const telegramApi = require('node-telegram-bot-api');
const qr = require("qr-image")
require('dotenv').config()
const {seqno, balance} = require("./wallet.js") 
const {getWallets, getWalletInfo} = require("./ton-connect/wallet.js")
const QRCode = require("qrcode")
const {getConnector} = require('./ton-connect/connector.js')
const fs = require('fs')

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEB_URL;
const bot = new telegramApi(token, {polling: true});

console.log(seqno, balance);

bot.onText(/\/connect/, async msg => {
    const chatId = msg.chat.id;
    const wallets = await getWallets();

    const connector = getConnector(chatId);

    connector.onStatusChange(async wallet => {
        if (wallet) {
            const walletName =
                (await getWalletInfo(wallet.device.appName))?.name || wallet.device.appName;
            bot.sendMessage(chatId, `${walletName} wallet connected!`);
        }
    });

    const link = connector.connect(wallets);
    const image = await QRCode.toBuffer(link);

    await bot.sendPhoto(chatId, image, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Choose a Wallet',
                        callback_data: JSON.stringify({ method: 'chose_wallet' })
                    },
                    {
                        text: 'Open Link',
                        url: `https://ton-connect.github.io/open-tc/`
                    }
                ]
            ]
        }
    });
});
const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use(cors());

const walletNames = {};

const getInvoice = (id) => {
    return {
        chat_id: id, 
        title: 'InvoiceTitle',
        description: 'InvoiceDescription',
        payload: JSON.stringify({
            unique_id: `${id}_${Number(new Date())}`,
            provider_token: process.env.PROVIDER_TOKEN
        }),
        provider_token: process.env.PROVIDER_TOKEN,
        start_parameter: 'get_access',
        currency: 'RUB',
        prices: [
            {
                "label": "My product",
                "amount": 1000 * 1000
            }
        ] 
    };
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendInvoice(chatId, 
                    getInvoice(chatId).title,
                    getInvoice(chatId).description,
                    getInvoice(chatId).payload,
                    getInvoice(chatId).provider_token,
                    // getInvoice(chatId).start_parameter,
                    getInvoice(chatId).currency,
                    getInvoice(chatId).prices
    );
});

bot.on('pre_checkout_query', (query) => {
    bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', async (msg) => {
    await bot.sendMessage(msg.chat.id, 'Thank you for your payment!');
});

bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'settings') {
        const qrCode = qr.imageSync(`https://t.me/Trood_2024_Bot`, { type: 'png' });
        bot.sendPhoto(chatId, qrCode);
    } else if (data === "create") {
        bot.sendMessage(chatId, "Enter a name for your wallet (use /create YOUR_NEW_NAME_WALLET):");
    } else if (data === "delete") {
        bot.sendMessage(chatId, Object.values(walletNames).length > 0 ? 
            `Which wallet do you want to delete: ${Object.values(walletNames).join(', ')}` : "You don't have any wallets")
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if(msg?.web_app_data?.data) {
        console.log(msg);
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            if(data.totalTime > 0) {
                bot.sendMessage(chatId, 
                `You spent ${data.totalTime} ${data.totalTime > 1 ? "hours" : "hour"}`)
            }
            bot.sendPhoto(chatId, data.picture);
        } catch(e) {
            console.log(e);
        }
    }
})

bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const nickname = msg.from.first_name;

    if (text === "/start") {
        await bot.sendMessage(chatId, `Hi ${nickname}, welcome to telegram bot. My name is TroodBot.`);
        setTimeout(() => {
            bot.sendMessage(chatId, "I'm a bot that helps people track time, and also take into account the user's health status based on their images.");
        }, 1000);
        
        setTimeout(() => {
            bot.sendMessage(chatId, "Please provide the following information:");
            setTimeout(() => {
                bot.sendMessage(chatId, "What is your name, surname, year of birth? (Please use commas to separate data)");
            }, 1000);
        }, 3000);
    } else if (msg.text?.startsWith("/create")) {
        const walletName = text.replace("/create", "").trim();
        walletNames[chatId] = walletName;
        console.log(walletNames);

        setTimeout(()=> {
            bot.sendMessage(chatId, `Your new wallet name is: ${walletName}`);
        }, 1000)
        
    } else if (msg.text != "/start" && !msg.web_app_data && msg.text !="pay") {
        const userData = msg.text?.split(",");
        if(userData?.length !== 3) {
            bot.sendMessage(chatId, "Please provide your name, surname, and year of birth separated by commas.");
            return;
        }
        const [name, surname, year] = userData;
        const age = 2024 - parseInt(year);
        
        if(isNaN(age) || (age <= 0 || age >= 90) ) {
            bot.sendMessage(chatId, "Invalid year of birth. Please provide a valid year of birth.");
            return;
        }
        
        bot.sendMessage(chatId, `Are you ${surname} ${name} ${age} years old ?`);
        setTimeout(() => {
            bot.sendMessage(chatId, "Please fill the form below, and make a photo", {
                reply_markup: {
                    keyboard: [
                        [{text: "Fill form", web_app: {url: webAppUrl}}]
                    ]
                }
        }, 2000)
        });
        setTimeout(() => {
            bot.sendMessage(chatId, `Now you can use your wallet`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text: 'Settings', callback_data: 'settings'},
                            {text: 'Create wallet', callback_data: 'create'},
                            {text: 'Delete wallet', callback_data: 'delete'},
                            {
                                text: 'Open Link',
                                url: `https://telegramwebapptrood.netlify.app/`
                            }
                        ]
                    ]
                }
            });
        }, 3000)
    } 
})



app.post('/upload', async (req, res) => {
    try {
        const { key, image, name } = req.body;

        const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ key, image, name }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const walletMenuCallbacks = {
    chose_wallet: onChooseWalletClick,
    select_wallet: onWalletClick,
    universal_qr: onOpenUniversalQRClick
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

async function onOpenUniversalQRClick(query, _) {
    const chatId = query.message.chat.id;
    const wallets = await getWallets();

    const connector = getConnector(chatId);

    connector.onStatusChange(wallet => {
        if (wallet) {
            bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
        }
    });

    const link = connector.connect(wallets);

    await editQR(query.message, link);

    await bot.editMessageReplyMarkup(
        {
            inline_keyboard: [
                [
                    {
                        text: 'Choose a Wallet',
                        callback_data: JSON.stringify({ method: 'chose_wallet' })
                    },
                    {
                        text: 'Open Link',
                        url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(
                            link
                        )}`
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

async function onWalletClick(query, data) {
    const chatId = query.message.chat.id;
    const connector = getConnector(chatId);

    connector.onStatusChange(wallet => {
        if (wallet) {
            bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
        }
    });

    const selectedWallet = await getWalletInfo(data);
    if (!selectedWallet) {
        return;
    }

    const link = connector.connect({
        bridgeUrl: selectedWallet.bridgeUrl,
        universalLink: selectedWallet.universalLink
    });

    await editQR(query.message, link);

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
                        url: link
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