const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Adicional = new Schema({
  nomeLoja: {
    type: String,
    require: true,
  },
  nome: {
    type: String,
    require: true,
  },
  taxa: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  categoria: {
    type: String,
    require: true
  }
});

mongoose.model("adicionais", Adicional);
