const autenticado = function (req, res, next) {
  res.locals.loja = req.user.nomeLoja;
  if (req.params.nomeLoja == req.user.nomeLoja) {
    return next();
  } else {
    res.redirect(`/`);
  }
};

module.exports = {
  autenticado,
};
