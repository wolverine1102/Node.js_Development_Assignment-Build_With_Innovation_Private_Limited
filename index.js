const express = require('express');
const mongoose = require('mongoose');

const app = express();
const db = require('./src/config/index');

app.use(express.json());

app.listen(7050, '0.0.0.0', () => console.log('Listening on port 7050...'));