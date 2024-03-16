const telegramApi = require('node-telegram-bot-api');
const express = require("express")
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())



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

app.post("/postData", (req, res) => {
    const postData = req.body;
    console.log('Received data:', postData);
    bot.sendPhoto(chatIdGlobal, `${postData.picture}`)
    res.status(200).json({ message: 'Data received successfully.' });
});

const PORT = 8000;

app.listen(PORT, () => console.log("server started on PORT " + PORT))




