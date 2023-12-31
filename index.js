const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

app.listen(7050, '0.0.0.0', () => console.log('Listening on port 7050...'));