const { getWalletInfo, getWallets } =  require('./ton-connect/wallet');
const { bot } =  require('./bot');
const { getConnector } =  require('./ton-connect/connector');
const QRCode =  require('qrcode');
const fs = require('fs');
const { isTelegramUrl} =  require('@tonconnect/sdk');
const { addTGReturnStrategy, buildUniversalKeyboard } = require('./utils');

const walletMenuCallbacks = {
    chose_wallet: onChooseWalletClick,
    select_wallet: onWalletClick,
    universal_qr: onOpenUniversalQRClick
};
async function onChooseWalletClick(query, _) {
    const wallets = await getWallets();

    await bot.editMessageReplyMarkup(
        {
            inline_keyboard: [
                wallets.map(wallet => ({
                    text: wallet.name,
                    callback_data: JSON.stringify({ method: 'select_wallet', data: wallet.appName })
                })),
                [
                    {
                        text: '« Back',
                        callback_data: JSON.stringify({
                            method: 'universal_qr'
                        })
                    }
                ]
            ]
        },
        {
            message_id: query.message?.message_id,
            chat_id: query.message?.chat.id
        }
    );
}

async function onOpenUniversalQRClick(query, _) {
    const chatId = query.message.chat.id;
    const wallets = await getWallets();

    const connector = getConnector(chatId);

    const link = connector.connect(wallets);

    await editQR(query.message, link);

    const keyboard = await buildUniversalKeyboard(link, wallets);

    await bot.editMessageReplyMarkup(
        {
            inline_keyboard: [keyboard]
        },
        {
            message_id: query.message?.message_id,
            chat_id: query.message?.chat.id
        }
    );
}

async function onWalletClick(query, data) {
    const chatId = query.message.chat.id;
    const connector = getConnector(chatId);

    const selectedWallet = await getWalletInfo(data);
    if (!selectedWallet) {
        return;
    }

    let buttonLink = connector.connect({
        bridgeUrl: selectedWallet.bridgeUrl,
        universalLink: selectedWallet.universalLink
    });

    let qrLink = buttonLink;

    if (isTelegramUrl(selectedWallet.universalLink)) {
        buttonLink = addTGReturnStrategy(buttonLink, process.env.TELEGRAM_BOT_LINK);
        qrLink = addTGReturnStrategy(qrLink, 'none');
    }

    await editQR(query.message, qrLink);

    await bot.editMessageReplyMarkup(
        {
            inline_keyboard: [
                [
                    {
                        text: '« Back',
                        callback_data: JSON.stringify({ method: 'chose_wallet' })
                    },
                    {
                        text: `Open ${selectedWallet.name}`,
                        url: buttonLink
                    }
                ]
            ]
        },
        {
            message_id: query.message?.message_id,
            chat_id: chatId
        }
    );
}

async function editQR(message, link) {
    const fileName = 'QR-code-' + Math.round(Math.random() * 10000000000);

    await QRCode.toFile(`./${fileName}`, link);

    await bot.editMessageMedia(
        {
            type: 'photo',
            media: `attach://${fileName}`
        },
        {
            message_id: message?.message_id,
            chat_id: message?.chat.id
        }
    );

    await new Promise(r => fs.rm(`./${fileName}`, r));
}

module.exports = {walletMenuCallbacks}