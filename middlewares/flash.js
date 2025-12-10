//middlewares/flash.js
const { getFlash } = require("../utils/flash");

module.exports = (req, res, next) => {
    const flash = getFlash(req, res);
    res.locals.flash = flash;  // available in all EJS views
    next();
};