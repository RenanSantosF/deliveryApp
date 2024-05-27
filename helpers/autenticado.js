const autenticado = function (req, res, next) {
  try {
    res.locals.loja = req.user.nomeLoja;
    res.locals.nomeDaLoja = req.user.nomeDaLoja;
    if (req.params.nomeLoja == req.user.nomeLoja) {
      return next();
    } else {
      res.redirect(`/usuarios/login`);
    }
  } catch (error) {
    res.redirect("/usuarios/login");
  }
};

module.exports = {
  autenticado,
};
