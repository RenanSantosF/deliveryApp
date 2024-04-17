const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

const existeUsuario = function (req, res, next) {
  Usuario.findOne({ nomeLoja: req.params.nomeLoja })
    .lean()
    .then((usuario) => {
      if (usuario) {
        return next();
      } else {
        res.send("Arquivo não encontrado");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
    });
};

module.exports = {
  existeUsuario,
};
