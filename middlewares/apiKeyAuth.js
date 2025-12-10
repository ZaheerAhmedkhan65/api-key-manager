const db = require("../config/db");

module.exports = async function (req, res, next) {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
    }

    // Check API key
    const [rows] = await db.query("SELECT * FROM api_keys WHERE api_key=? AND active=1", [apiKey]);

    if (rows.length === 0) {
        return res.status(403).json({ message: "Invalid API key" });
    }

    const keyData = rows[0];
    const now = new Date();

    // RATE LIMIT: 100 req / minute
    const MAX_REQ = 100;
    const WINDOW = 60 * 1000; // 1 minute

    if (keyData.last_request) {
        const diff = now - new Date(keyData.last_request);

        if (diff < WINDOW) {
            // Inside window
            if (keyData.requests >= MAX_REQ) {
                return res.status(429).json({
                    message: "Rate limit exceeded. Wait 1 minute."
                });
            }

            // Increment request counter
            await db.query(
                "UPDATE api_keys SET requests = requests + 1 WHERE id=?",
                [keyData.id]
            );

        } else {
            // Window expired — reset counter
            await db.query(
                "UPDATE api_keys SET requests = 1, last_request=? WHERE id=?",
                [now, keyData.id]
            );
        }

    } else {
        // First-time request
        await db.query(
            "UPDATE api_keys SET requests = 1, last_request=? WHERE id=?",
            [now, keyData.id]
        );
    }

    req.apiUser = keyData.owner;

    next();
};
