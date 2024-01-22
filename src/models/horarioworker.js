const {Schema, model} = require('mongoose');
const mongoose = require('mongoose');

const horasWorker = new mongoose.Schema({
    
    lunes: {
        start: { type: Date },
        end: { type: Date },
      },
    martes: {
        start: { type: Date },
        end: { type: Date },
      },
    miercoles: {
        start: { type: Date },
        end: { type: Date },
      },
    jueves: {
        start: { type: Date },
        end: { type: Date },
      },
    viernes: {
        start: { type: Date },
        end: { type: Date },
      },
    sabado: {
        start: { type: Date },
        end: { type: Date },
      },
    domingo: {
        start: { type: Date },
        end: { type: Date },
      },
  
});

module.exports = model('horasworker',horasWorker);