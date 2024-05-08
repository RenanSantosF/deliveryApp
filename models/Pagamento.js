const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Pagamento = new Schema({
  nomeLoja: {
    type: String,
    require: true,
  },
  nome: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  }
});

mongoose.model("pagamentos", Pagamento);
