const mongoose = require('mongoose');
const dotenv = require('dotenv');
const seedAdmin = require('../seed/seedAdmin').seedAdmin;

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DB = process.env.MONGO_DB;

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
// const url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`
mongoose.connect(url, { useNewUrlParser: true }).
    catch(error => console.log(error));

const db = mongoose.connection;

db.on('error', (error) => {
    console.log(error)
});
db.on('connected', () => {
    console.log('Database Connected...');
});
db.on('disconnected', () => {
    console.log('Database Disconnected...')
});

seedAdmin(); // Adding admin to the database