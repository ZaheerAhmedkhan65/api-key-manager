const db = require("../config/db");

function generateApiKey(length = 20) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < length; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

async function createApiKey(owner) {
    let apiKey;

    // Generate unique key
    while (true) {
        apiKey = generateApiKey();
        const [rows] = await db.query("SELECT id FROM api_keys WHERE api_key=?", [apiKey]);
        if (rows.length === 0) break; // unique
    }

    await db.query(
        "INSERT INTO api_keys (api_key, owner) VALUES (?, ?)",
        [apiKey, owner]
    );

    return apiKey;
}

module.exports = { createApiKey };
