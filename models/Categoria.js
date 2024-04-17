const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dayjs = require("dayjs");

const Categoria = new Schema({
  nomeLoja: {
    type: String,
    require: true,
  },
  nome: {
    type: String,
    require: true,
  },
  slug: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    default: dayjs(Date.now()).format("DD/MM/YYYY HH:MM"),
  },
});

mongoose.model("categorias", Categoria);
