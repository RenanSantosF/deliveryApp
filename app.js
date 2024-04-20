// Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const app = express();
const admin = require("./routes/admin");
const usuarios = require("./routes/usuario");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const { autenticado } = require("./helpers/autenticado");
const { existeUsuario } = require("./helpers/existeUsuario");
require("./models/Produto");
const Produto = mongoose.model("produtos");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
require("./models/Usuario");
const Usuario = mongoose.model("usuarios");
require("./config/auth")(passport);
require("./models/Usuario");

// Configurações
// Sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Handlebars
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Mongoose
mongoose.Promise = global.Promise;
try {
  mongoose.connect("mongodb://localhost/Menu");
  console.log("Conectado ao mongo");
} catch {
  console.log("Erro ao conectar: " + err);
}
// Public
app.use(express.static(path.join(__dirname, "public")));

// Desviando para outros arquivos
app.use("/:nomeLoja/admin", autenticado, admin);
app.use("/usuarios", usuarios);

// Rotas
app.get("/", (req, res) => {
  res.send("principal");
});

// Página da loja, de exibir erro
app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

// Página para cada cliente de cada loja
app.get("/:nomeLoja", existeUsuario, (req, res) => {
  let dadosUsuario = [];
  Usuario.find({ nomeLoja: req.params.nomeLoja })
    .lean()
    .then((usuario) => {
      dadosUsuario = usuario;
    })
    .catch((err) => {
      // res.send('erro ao exibir usuário')
    });

  Produto.find({ nomeLoja: req.params.nomeLoja })
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((produtos) => {
      Categoria.find({ nomeLoja: req.params.nomeLoja })
        .lean()
        .sort({ data: "desc" })
        .then((categorias) => {
          const produtosPorCategoria = {};

          categorias.forEach((categoria) => {
            produtosPorCategoria[categoria.nome] = [];
          });

          produtos.forEach((produto) => {
            const categoria = categorias.find(
              (cat) => cat.nome === produto.categoria.nome
            );

            if (categoria) {
              produtosPorCategoria[categoria.nome].push(produto);
            }
          });

          res.render("index", {
            produtosPorCategoria: produtosPorCategoria,
            dadosUsuario: dadosUsuario,
          });
        })
        .catch((err) => {
          res.send("Erro interno");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.send("Erro interno");
    });
});

// Exibir único produto
app.get(`/:nomeLoja/produto/:slug`, existeUsuario, (req, res) => {
  Produto.findOne({ slug: req.params.slug })
    .lean()
    .then((produto) => {
      if (produto) {
        res.render("produto/index", { produto, produto });
      } else {
        req.flash("error_msg", "Este produto não existe");
        res.redirect(`/${usuario.nomeLoja}/`);
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect(`/${usuario.nomeLoja}/`);
    });
});

// Exibir todas as categorias
app.get("/:nomeLoja/categorias", existeUsuario, (req, res) => {
  Categoria.find({ nomeLoja: req.params.nomeLoja })
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect(`/${usuario.nomeLoja}/`);
    });
});

// Exibir única categoria
app.get("/:nomeLoja/categorias/:slug", existeUsuario, (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        Produto.find({ categoria: categoria._id })
          .lean()
          .then((produtos) => {
            res.render("categorias/produtos", {
              produtos: produtos,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as produtos");
            res.redirect(`/${usuario.nomeLoja}/`);
          });
      } else {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect(`/${usuario.nomeLoja}/`);
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página desta categoria"
      );
      res.redirect(`/${usuario.nomeLoja}/`);
    });
});

// Outros
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando");
});
