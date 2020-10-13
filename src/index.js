// require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./router');

// Added router
app.use(router);

app.get('/', async (req, res) => {
  console.log('Welcome to sandwich bot rest server');
  res.send(`Welcome to sandwich bot rest server!`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
