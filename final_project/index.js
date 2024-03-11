const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: 'fingerprint_customer', resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
  try {
    let token = req.session.authorization["accessToken"];

    // verify token & store user_id in request to use it in the next controller
    const { user_id } = jwt.verify(token, 'access'); // should be stored in .env file
    req.user = { user_id };

    next();
  } catch (error) {
    return res.status(401).json({ message: "You're not authorized" });
  }
});

const PORT = process.env.PORT || 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
