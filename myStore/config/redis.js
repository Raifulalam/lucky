require("dotenv").config();
const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false,
    },
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log("✅ Redis Connected Successfully");
    } catch (err) {
        console.error("❌ Redis Connection Failed:", err);
    }
})();

module.exports = redisClient;
