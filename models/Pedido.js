const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para itens do carrinho
const CartItemSchema = new Schema({
  valorTotalAdicional: Number,
  name: String,
  price: Number,
  descricao: String,
  imgProduto: String,
  quantityProduto: Number,
  listaAdicionais: [{
    quantidade: Number,
    nome: String,
    valor: Number
  }],
  quantidadeNomeAdicionais: [String]
}, { _id: false });

// Schema para o pedido
const Pedido = new Schema({
  nomeLoja: String,
  nome: String,
  telefone: String,
  valorTotal: Number,
  pagamento: String,
  entrega: String,
  numero: String,
  referencia: String,
  rua: String,
  uf: String,
  taxa: Number,
  cart: [CartItemSchema]
});

mongoose.model('pedidos', Pedido);
