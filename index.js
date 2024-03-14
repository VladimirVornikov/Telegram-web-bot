const telegramApi = require('node-telegram-bot-api');
const express =require("express")
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
        await bot.sendMessage(chatId, `Hi ${nickname}, welcome to telegram bot. My name is TroodBot. Please, fill the form below`, {
            reply_markup: {
                keyboard: [
                    [{text: "Fill form", web_app: {url: webAppUrl}}]
                ]
            }
        })
    }
    bot.sendMessage(chatId, "Ok, now we need your foto. Please make a foto", {
        reply_markup: {
            inline_keyboard: [
                [{text: "Make a foto", web_app: {url: webAppUrl}}]
            ]
        }
    })
})

app.post("/web-data", async (req, res) => {
    const {queryId, totalTime} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "All right",
            input_message_content: {message_text: `You spend ${totalTime}!` }
        })
        return res.status(200).json({})
    } catch(e) {
        await bot.answerWebAppQuery(queryId, {
            type: "article",
            id: queryId,
            title: "Not good",
            input_message_content: {message_text: e }
        })
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log("server started on PORT " + PORT))