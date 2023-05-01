const express = require('express');
const db = require('./config/connection');
const routes = require('./routes');

const PORT = 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

app.use((req, res) => {
  res.status(404).end();
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API running on localhost://${PORT}!`);
  });
});
