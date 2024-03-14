const telegramApi = require('node-telegram-bot-api');
const express = require("express")
const cors = require('cors')


const token = "7132665948:AAFECPqQmjvgjX30MWXi5ejJjRldEEdKHBY";
const webAppUrl = 'https://telegramwebapptrood.netlify.app/'

const bot = new telegramApi(token, {polling: true});
const app = express()

app.use(express.json())
app.use(cors())

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
    
})

app.post("/web-data", (req, res) => {
    console.log("Received data:", req.body);

    const {queryId, totalTime} = req.body;
    try {
        bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "All right",
            input_message_content: {message_text: `You spend ${totalTime}!` }
        })
        return res.status(200).json({})
    } catch(e) {
        bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Fail :(",
            input_message_content: {message_text: e }
        })
        return res.status(500).json({})
    }
});

const PORT = 8000;

app.listen(PORT, () => console.log("server started on PORT " + PORT))