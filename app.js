// app.js


require('dotenv').config();
const express = require('express');
const connectDB = require('./Config/Databaseconfig');
const nibssService = require('./Sevices/NibssService');
const errorMiddleware = require('./Middleware/ErrorMiddleware');

const app = express();

app.use(express.json()); // lets req.body parse incoming JSON

// ---- Mount every route file under its base path ----
app.use('/auth', require('./Routes/AuthRoutes'));
app.use('/customers', require('./Routes/CustomerRoutes'));
app.use('/accounts', require('./Routes/AccountRoutes'));
app.use('/transactions', require('./Routes/TransactionRoutes'));

// ---- Error handler — MUST be registered last, after every route ----
app.use(errorMiddleware);

const PORT = process.env.PORT;

async function startServer() {
  await connectDB();

  // Log in to NIBSS once at startup, so the JWT is ready before any
  // customer request needs it — rather than logging in on every call.
  await nibssService.login();
  console.log('Logged in to NIBSS');

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();