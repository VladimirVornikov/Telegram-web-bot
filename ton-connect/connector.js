
const  {TonConnect} =  require('@tonconnect/sdk');
const { TonConnectStorage } = require('./storage');
require('dotenv').config()

function getConnector(chatId) {
    return new TonConnect({
        manifestUrl: process.env.MANIFEST_URL,
        storage: new TonConnectStorage(chatId)
    });
}

module.exports = {getConnector}