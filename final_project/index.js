const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configure session middleware
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.accessToken) {
        try {
            const decoded = jwt.verify(req.session.accessToken, "your_secret_key");
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
        }
    } else {
        return res.status(401).json({ error: "Unauthorized access. Please log in first." });
    }
});

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));