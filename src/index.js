// require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./router');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}));  // for parsing application/x-www-form-urlencoded

// Added router
app.use(router);

app.get('/', async (req, res) => {
  console.log('Welcome to google sheets rest server');
  res.send(`Welcome to google sheets rest server!`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
