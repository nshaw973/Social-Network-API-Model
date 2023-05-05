const express = require('express');
const db = require('./config/connection');
const routes = require('./controllers');

const PORT = 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

// Listens once the DB connection is open and ready to receive queries
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API running on localhost://${PORT}!`);
  });
});
