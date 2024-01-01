const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const db = require('./src/config/database');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(7050, '0.0.0.0', () => console.log('Listening on port 7050...'));