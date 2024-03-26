const { getWallets } = require('./ton-connect/wallets');
const { bot } = require('./bot');

const walletMenuCallbacks = { 
    chose_wallet: onChooseWalletClick
};

bot.on('callback_query', query => { 
    if (!query.data) {
        return;
    }

    let request;

    try {
        request = JSON.parse(query.data);
    } catch {
        return;
    }

    if (!walletMenuCallbacks[request.method]) {
        return;
    }

    walletMenuCallbacks[request.method](query, request.data);
});


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
            message_id: query.message.message_id,
            chat_id: query.message.chat.id
        }
    );
}