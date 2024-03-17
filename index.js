const telegramApi = require('node-telegram-bot-api');




const token = "7132665948:AAFECPqQmjvgjX30MWXi5ejJjRldEEdKHBY";
const webAppUrl = 'https://telegramwebapptrood.netlify.app/'

const bot = new telegramApi(token, {polling: true});

let chatIdGlobal;

bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const nickname = msg.from.first_name;
    chatIdGlobal = chatId

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


const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

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






