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
  disponivel: {
    type: Boolean,
    default: true
  },
  preco: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
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
    default: "padrao/imgPadrao.png"
  },
  adicionais: [
    {
      adicionais: String,
      precoAdicional: String,
      produtoReferido: String,
      categoriaAdicional: String,
      minAdicionais: Number,
      maxAdicionais: Number,
    },
  ],
});

mongoose.model("produtos", Produto);
