const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema para itens adicionais
const AdicionalSchema = new Schema({
  nomeAdicional: String,
  quantidade: Number,
  valorAdicional: Number
});

// Schema para itens do carrinho
const CartItemSchema = new Schema({
  descricao: String,
  imgProduto: String,
  listaAdicionais: {
    type: Map,
    of: [AdicionalSchema]
  },
  name: String,
  price: Number,
  quantidadeNomeAdicionais: [{
    nome: String,
    quantidade: Number,
    valor: Number
  }],
  quantityProduto: Number,
  valorTotalAdicional: Number
}, { _id: false });

// Schema para os pedidos
const Pedido = new Schema({
  nomeLoja: String,
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
  subtotal: Number,
  telefone: String,
  uf: String,
  valorTotal: Number,
  
  cart: [CartItemSchema],

});

// Criar o Modelo
mongoose.model('pedidos', Pedido);

