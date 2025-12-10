// utils/flash.js
const flashCookieName = "flash_msg";

function setFlash(res, type, message) {
    res.cookie(flashCookieName, JSON.stringify({ type, message }), {
        httpOnly: true,
        maxAge: 5000, // 5 seconds
        sameSite: "strict"
    });
}

function getFlash(req, res) {
    let flashData = null;

    if (req.cookies[flashCookieName]) {
        try {
            flashData = JSON.parse(req.cookies[flashCookieName]);
        } catch (e) {
            flashData = null;
        }
        res.clearCookie(flashCookieName);
    }

    return flashData;
}

module.exports = { setFlash, getFlash };
