const telegramApi = require('node-telegram-bot-api');

const webAppUrl = 'https://telegramwebapptrood.netlify.app/'
const token = "7132665948:AAFECPqQmjvgjX30MWXi5ejJjRldEEdKHBY";
const bot = new telegramApi(token, {polling: true});

const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

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
    } else if(msg.text != "/start") {
        const userData = msg.text.split(",");
        if(userData.length !== 3) {
            bot.sendMessage(chatId, "Invalid input. Please provide your name, surname, and year of birth separated by commas.");
            return;
        }
        
        const [name, surname, year] = userData;
        const age = 2024 - parseInt(year);
        
        if(isNaN(age) || age <= 0 ) {
            bot.sendMessage(chatId, "Invalid year of birth. Please provide a valid year of birth.");
            return;
        }
        
        bot.sendMessage(chatId, `Are you ${surname} ${name} ${age} years old ?`);
    }
});




app.post('/upload', async (req, res) => {
    try {
        const { key, image, name } = req.body;
        console.log(`key: ${key} and name ${name}`);

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