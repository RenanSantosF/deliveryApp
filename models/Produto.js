const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Produto = new Schema({
  nomeLoja: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  preco: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: "categorias",
    required: true,
  },
  data: {
    type: Date,
    default: Date.now(),
  },
  imgProduto: {
    type: String,
    default: "imgPadrao.png"
  },
  adicionais: [
    {
      adicionais: String,
      precoAdicional: String,
      produtoReferido: String,
      categoriaAdicional: String,
      minAdicionais: Number, // Adicionando campo para mínimo de adicionais
      maxAdicionais: Number, // Adicionando campo para máximo de adicionais
    },
  ],
});

mongoose.model("produtos", Produto);
