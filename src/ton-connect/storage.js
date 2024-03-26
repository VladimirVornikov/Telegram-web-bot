const { createClient } =  require('redis');
require("dotenv").config();


const storage = new Map();

const client = createClient({ url: process.env.REDIS_URL });

// client.on('error', err => console.log('Redis Client Error', err));

async function initRedisClient() {
    await client.connect();
}

class TonConnectStorage {
    constructor(chatId) {
        this.chatId = chatId
    } 
    getKey(key) {
        return this.chatId.toString() + key; 
    }

    async removeItem(key) {
        storage.delete(this.getKey(key));
    }

    async setItem(key, value) {
        storage.set(this.getKey(key), value);
    }

    async getItem(key) {
        return storage.get(this.getKey(key)) || null;
    }
}

module.exports = { TonConnectStorage, initRedisClient };
