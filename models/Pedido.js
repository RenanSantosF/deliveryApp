const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdicionalSchema = new Schema({
  nomeAdicional: String,
  quantidade: Number,
  valorAdicional: Number,
});

const CartItemSchema = new Schema(
  {
    descricao: String,
    imgProduto: String,
    listaAdicionais: {
      type: Map,
      of: [AdicionalSchema],
    },
    name: String,
    price: Number,
    observacao: String,
    quantidadeNomeAdicionais: [
      {
        nome: String,
        quantidade: Number,
        valor: Number,
      },
    ],
    quantityProduto: Number,
    valorTotalAdicional: Number,
  },
  { _id: false }
);

const Pedido = new Schema({
  nomeLoja: String,
  numeroPedido: Number,
  status: String,
  bairro: String,
  cidade: String,
  entrega: Boolean,
  nome: String,
  numero: String,
  pagamento: String,
  referencia: String,
  data: String,
  rua: String,
  taxa: Number,
  valorTroco: Number,
  subtotal: Number,
  telefone: String,
  uf: String,
  valorTotal: Number,

  cart: [CartItemSchema],
});

mongoose.model("pedidos", Pedido);
