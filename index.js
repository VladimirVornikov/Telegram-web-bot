const telegramApi = require('node-telegram-bot-api');

const token = "7132665948:AAFECPqQmjvgjX30MWXi5ejJjRldEEdKHBY";
const webAppUrl = 'https://telegramwebapptrood.netlify.app/'

const bot = new telegramApi(token, {polling: true});

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
            bot.sendMessage(chatId, "Please, fill the form below, and make a", {
                reply_markup: {
                    keyboard: [
                        [{text: "Fill form", web_app: {url: webAppUrl}}]
                    ]
                }
            });
        }, 3000);   
    }
    
    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            if(data.totalTime > 0) {
                bot.sendMessage(chatId, 
                `You spent ${data.totalTime} ${data.totalTime > 1 ? "hours" : "hour"}`)
            }
        } catch(e) {
            console.log(e);
        }
    }
})
