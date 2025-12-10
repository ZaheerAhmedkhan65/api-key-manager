const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require("cookie-parser");

const db = require('./config/db');
const { createApiKey } = require('./services/apiKeyService');
const { setFlash } = require('./utils/flash');
const flashMiddleware = require('./middlewares/flash');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // default layout file name

const protectedRoutes = require('./routes/protected');

// flash messages middleware
app.use(flashMiddleware); // make flash accessible to views

app.use("/api", protectedRoutes);
// show create form
app.get('/keys/new', (req, res) => res.render('keys/new', { title: 'Create API Key' }));

// create key (after generating key in your service)
app.post('/keys', async (req, res) => {
    const key = await createApiKey(req.body.owner);
    setFlash(res, "success", "API key created.");
    // pass createdKey to show once
    res.render('keys/new', { createdKey: key, title: 'Created API Key' });
});

// list keys
app.get('/keys', async (req, res) => {
    const keys = await db.query('SELECT id, api_key, owner, active, requests, created_at FROM api_keys');
    // mask keys for safety
    const rows = keys[0].map(r => ({
        ...r,
        api_key_masked: r.api_key ? (r.api_key.slice(0, 6) + '...' + r.api_key.slice(-4)) : '',
        api_key_plain: null, // don't show
        last_request: r.last_request ? new Date(r.last_request).toLocaleString() : null,
        created_at: new Date(r.created_at).toLocaleString()
    }));
    res.render('keys/index', { keys: rows, title: 'API Keys' });
});


app.get('/keys/:id/reveal', async (req, res) => {
    const [rows] = await db.query("SELECT api_key FROM api_keys WHERE id = ?", [req.params.id]);

    if (!rows.length) {
        return res.status(404).json({ error: "Key not found" });
    }

    res.json({ api_key: rows[0].api_key });
});

app.post('/keys/:id/revoke', async (req, res) => {
    await db.query("DELETE FROM api_keys WHERE id = ?", [req.params.id]);
    setFlash(res, "success", "API key revoked.");
    res.redirect('/keys');
}); 

app.listen(3000, () => console.log('Server started on port 3000'));