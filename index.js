const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { router } = require('./src/routes/index');

const app = express();
const db = require('./src/config/dbConfig');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.listen(7050, '0.0.0.0', () => console.log('Listening on port 7050...'));