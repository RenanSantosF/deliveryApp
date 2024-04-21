const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
  nome: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  eAdmin: {
    type: Number,
    default: 1,
  },
  senha: {
    type: String,
    require: true,
  },
  nomeLoja: {
    type: String,
    require: true,
  },
  imgLogo: {
    type: String,
    require: true,
  },
  imgBg: {
    type: String,
  },
  telefone: {
    type: String,
    require: true,
  },
  numeroRua: {
    type: String,
    require: true,
  },
  rua: {
    type: String,
    require: true,
  },
  bairro: {
    type: String,
    require: true,
  },
  cidade: {
    type: String,
    require: true,
  },
  estado: {
    type: String,
    require: true,
  },
  pontoReferencia: {
    type: String,
    require: true,
  },

  segAb: {
    type: String,
    default: 0,
  },
  terAb: {
    type: String,
    default: 0,
  },
  quaAb: {
    type: String,
    default: 0,
  },
  quiAb: {
    type: String,
    default: 0,
  },
  sexAb: {
    type: String,
    default: 0,
  },
  sabAb: {
    type: String,
    default: 0,
  },
  domAb: {
    type: String,
    default: 0,
  },
  segFe: {
    type: String,
    default: 0,
  },
  terFe: {
    type: String,
    default: 0,
  },
  quaFe: {
    type: String,
    default: 0,
  },
  quiFe: {
    type: String,
    default: 0,
  },
  sexFe: {
    type: String,
    default: 0,
  },
  sabFe: {
    type: String,
    default: 0,
  },
  domFe: {
    type: String,
    default: 0,
  },
});

mongoose.model("usuarios", Usuario);
