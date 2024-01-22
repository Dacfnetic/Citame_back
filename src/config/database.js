const mongoose = require('mongoose');

async function connect() {

    await mongoose.connect('mongodb://0.0.0.0:27017/citamedb');

    console.log('DB is Connected.')

};

const {deleteBusiness} = require('../routes/business/business.controller');

module.exports = { connect };

