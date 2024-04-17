const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Produto = new Schema({
  nomeLoja: {
    type: String,
    require: true,
  },
  titulo: {
    type: String,
    require: true,
  },
  slug: {
    type: String,
    require: true,
  },
  preco: {
    type: String,
    require: true,
  },
  descricao: {
    type: String,
    require: true,
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: "categorias",
    require: true,
  },
  data: {
    type: Date,
    default: Date.now(),
  },
});

mongoose.model("produtos", Produto);
