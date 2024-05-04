const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { eAdmin } = require("../helpers/eAdmin");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Produto");
const Produto = mongoose.model("produtos");
require("../models/Adicional");
const Adicional = mongoose.model("adicionais");

const multer = require("multer");
const path = require("path");

// Configurando o recebimento de arquivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueFileName =
      file.originalname + Date.now() + path.extname(file.originalname);
    req.generatedFileName = uniqueFileName;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage });

let usuarioAtual = "";
function UserAuth(req, res, next) {
  usuarioAtual = req.user.nomeLoja;
  next();
}

router.get("/", UserAuth, (req, res) => {
  res.render("admin/index");
});

router.get("/:nomeLoja/posts", UserAuth, eAdmin, (req, res) => {
  res.send("Página de posts");
});

router.get("/categorias", UserAuth, eAdmin, (req, res) => {
  Categoria.find({ nomeLoja: usuarioAtual })
    .sort({ date: "desc" })
    .lean()
    .then((categorias) => {
      res.render("admin/categorias", {
        categorias: categorias,
        usuarioAtual: usuarioAtual,
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect(`/${usuarioAtual}/admin`);
    });
});

router.get("/categorias/add", UserAuth, eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria precisa ser maior" });
  }
  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
      nomeLoja: usuarioAtual,
    };
    try {
      new Categoria(novaCategoria).save();
      res.redirect(`/${usuarioAtual}/admin/categorias`);
      req.flash("success_msg", "Categoria criada com sucesso!");
    } catch (error) {
      req.flash("error_msg", "Houve um erro ao salvar a categoria!");
    }
  }
});

router.get("/categorias/edit/:id", UserAuth, eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editCategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa categoria não existe!");
      res.redirect(`/${usuarioAtual}/admin/categorias`);
    });
});

router.post("/categorias/edit", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria precisa ser maior" });
  }
  if (erros.length > 0) {
    res.render("editCategorias", { erros: erros });
    res.redirect(`/${usuarioAtual}/admin/categorias/edit/${req.body.id}`);
  } else {
    Categoria.findOne({ _id: req.body.id })
      .then((categoria) => {
        (categoria.nome = req.body.nome), (categoria.slug = req.body.slug);
        categoria
          .save()
          .then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect(`/${usuarioAtual}/admin/categorias`);
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Houve um erro interno ao salvar a categoria!"
            );
            res.redirect(`/${usuarioAtual}/admin/categorias`);
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect(`/${usuarioAtual}/admin/categorias`);
      });
  }
});

router.post("/categorias/deletar", UserAuth, eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect(`/${usuarioAtual}/admin/categorias`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria");
      res.redirect(`/${usuarioAtual}/admin/categorias`);
    });
});

// Produtos

router.get("/produtos", UserAuth, eAdmin, (req, res) => {
  Produto.find({ nomeLoja: usuarioAtual })
    .populate("categoria")
    .sort({ date: "desc" })
    .lean()
    .then((produtos) => {
      res.render("admin/produtos", { produtos: produtos });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as produtos");
      res.redirect(`/${usuarioAtual}/admin`);
    });
});

router.get("/produtos/add", UserAuth, eAdmin, (req, res) => {
  Adicional.find({ nomeLoja: usuarioAtual })
    .lean()
    .then((adicionais) => {
      Categoria.find({ nomeLoja: usuarioAtual })
        .lean()
        .then((categorias) => {
          res.render("admin/addProduto", {
            categorias: categorias,
            adicionais: adicionais,
            css: "/styles/addProdutos/index.css",
            script: "/scripts/addProdutos/index.js",
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao carregar o formulário");
          res.redirect(`/${usuarioAtual}/admin`);
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect(`/${usuarioAtual}/admin`);
    });
});

router.post(
  "/produtos/nova",
  upload.single("imgProduto"),
  UserAuth,
  eAdmin,
  (req, res, e) => {
    let erros = [];
    if (
      !req.body.titulo ||
      typeof req.body.titulo == undefined ||
      req.body.titulo == null
    ) {
      erros.push({ texto: "Título inválido" });
    }
    if (
      !req.body.slug ||
      typeof req.body.slug == undefined ||
      req.body.slug == null
    ) {
      erros.push({ texto: "Slug inválido" });
    }
    if (
      !req.body.descricao ||
      typeof req.body.descricao == undefined ||
      req.body.descricao == null
    ) {
      erros.push({ texto: "Descrição inválida" });
    }

    if (
      !req.body.preco ||
      typeof req.body.preco == undefined ||
      req.body.preco == null
    ) {
      erros.push({ texto: "Valor inválido" });
    }
    if (req.body.categoria == "0") {
      erros.push({ texto: "categoria inválida, registre uma categoria" });
    }
    if (erros.length > 0) {
      res.render("admin/addProduto", { erros: erros });
    } else {
      const novosAdicionais = [];

      const adicionais = Array.isArray(req.body.adicionais)
        ? req.body.adicionais
        : [req.body.adicionais];

      for (let i = 0; i < adicionais.length; i++) {
        novosAdicionais.push({
          adicionais: adicionais[i],
          precoAdicional: req.body.precoAdicional[i],
          produtoReferido: req.body.titulo,
          categoriaAdicional: req.body.categoriaAdicional[i]
        });
      }

      const novaproduto = {
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        preco: req.body.preco,
        categoria: req.body.categoria,
        nomeLoja: usuarioAtual,
        imgProduto: req.generatedFileName,
        adicionais: novosAdicionais,
      };
      new Produto(novaproduto)
        .save()
        .then(() => {
          req.flash("success_msg", "produto criado com sucesso!");
          res.redirect(`/${usuarioAtual}/admin/produtos`);
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro na criação da produto!");
          res.redirect(`/${usuarioAtual}/admin/produtos`);
        });
    }
  }
);

router.get("/produtos/edit/:id", UserAuth, eAdmin, (req, res) => {
  Produto.findOne({ _id: req.params.id })
    .lean()
    .then((produto) => {
      Adicional.find({ nomeLoja: usuarioAtual })
        .lean()
        .then((adicionais) => {
          Categoria.find({ nomeLoja: usuarioAtual })
            .lean()
            .then((categorias) => {
              res.render("admin/editprodutos", {
                categorias: categorias,
                produto: produto,
                adicionais: adicionais,
                css: "/styles/addProdutos/index.css",
                script: "/scripts/addProdutos/index.js",
              });
            })
            .catch((err) => {
              req.flash("error_msg", "Houve um erro ao listar as categorias");
              res.redirect(`/${usuarioAtual}/admin/produtos`);
            });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect(`/${usuarioAtual}/admin/produtos`);
        });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição"
      );
      res.redirect(`/${usuarioAtual}/admin/produtos`);
    });
});

router.post(
  "/produto/edit",
  upload.single("imgProduto"),
  UserAuth,
  eAdmin,
  (req, res) => {
    Produto.findOne({ _id: req.body.id })
      .then((produto) => {
        const novosAdicionais = [];

        const adicionais = Array.isArray(req.body.adicionais)
          ? req.body.adicionais
          : [req.body.adicionais];

        for (let i = 0; i < adicionais.length; i++) {
          novosAdicionais.push({
            adicionais: adicionais[i],
            precoAdicional: req.body.precoAdicional[i],
            produtoReferido: req.body.titulo,
            categoriaAdicional: req.body.categoriaAdicional[i]
          });
        }

        produto.titulo = req.body.titulo;
        produto.slug = req.body.slug;
        produto.descricao = req.body.descricao;
        produto.categoria = req.body.categoria;
        produto.preco = req.body.preco;
        produto.nomeLoja = usuarioAtual;
        produto.imgProduto = req.generatedFileName;
        produto.adicionais = novosAdicionais;

        produto
          .save()
          .then(() => {
            req.flash("success_msg", "produto editada com sucesso!");
            res.redirect(`/${usuarioAtual}/admin/produtos`);
          })
          .catch((err) => {
            req.flash("error_msg", "Erro interno");
            res.redirect(`/${usuarioAtual}/admin/produtos`);
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição");
        res.redirect(`/${usuarioAtual}/admin/produtos`);
      });
  }
);

router.get("/produtos/deletar/:id", UserAuth, eAdmin, (req, res) => {
  Produto.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "produto deletada");
      res.redirect(`/${usuarioAtual}/admin/produtos`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a produto!");
      res.redirect(`/${usuarioAtual}/admin/produtos`);
    });
});

//Adicionais
router.get("/adicionais", UserAuth, eAdmin, (req, res) => {
  Adicional.find({ nomeLoja: usuarioAtual })
    .sort({ date: "desc" })
    .lean()
    .then((adicionais) => {
      res.render("admin/adicionais", { adicionais: adicionais });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao listar os adicionais cadastrados"
      );
      res.redirect(`"/${usuarioAtual}/admin`);
    });
});

router.get("/adicionais/add", UserAuth, eAdmin, (req, res) => {
  Categoria.find({ nomeLoja: usuarioAtual })
    .lean()
    .then((categorias) => {
      res.render("admin/addadicionais", {
        categorias: categorias,
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os adicionais");
      res.redirect(`/${usuarioAtual}/admin/adicionais`);
    });
});

router.post("/adicionais/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.taxa ||
    typeof req.body.taxa == undefined ||
    req.body.taxa == null
  ) {
    erros.push({ texto: "Valor da taxa é inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome do adicionais precisa ser maior" });
  }
  if (erros.length > 0) {
    res.render("admin/addadicionais", { erros: erros });
  } else {
    const novoAdicional = {
      nome: req.body.nome,
      taxa: req.body.taxa,
      nomeLoja: usuarioAtual,
      categoria: req.body.categoria,
    };
    try {
      new Adicional(novoAdicional).save();
      res.redirect(`/${usuarioAtual}/admin/adicionais`);
      req.flash("success_msg", "Adicional registrado com sucesso!");
    } catch (error) {
      req.flash("error_msg", "Houve um erro ao adicionar o adicional!");
    }
  }
});

router.get("/adicionais/edit/:id", UserAuth, eAdmin, (req, res) => {
  Adicional.findOne({ _id: req.params.id })
    .lean()
    .then((adicional) => {
      Categoria.find({ nomeLoja: usuarioAtual })
        .lean()
        .then((categorias) => {
          res.render("admin/editadicionais", {
            adicional: adicional,
            categorias: categorias,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar os adicionais");
          res.redirect(`/${usuarioAtual}/admin/adicionais`);
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Esse adicional não existe!");
      res.redirect("/admin/adicionais");
    });
});

router.post("/adicionais/edit", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.taxa ||
    typeof req.body.taxa == undefined ||
    req.body.taxa == null
  ) {
    erros.push({ texto: "Valor inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome do adicional precisa ser maior" });
  }
  if (erros.length > 0) {
    res.render("editAdicionais", { erros: erros });
    res.redirect(`/${usuarioAtual}/admin/adicionais/edit/${req.body.id}`);
  } else {
    Adicional.findOne({ _id: req.body.id })
      .then((adicional) => {
        (adicional.nome = req.body.nome),
        (adicional.taxa = req.body.taxa),
        (adicional.categoria = req.body.categoria)
        adicional
          .save()
          .then(() => {
            req.flash("success_msg", "Adicional editado com sucesso!");
            res.redirect(`/${usuarioAtual}/admin/adicionais`);
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Houve um erro interno ao adicionar o adicional!"
            );
            res.redirect(`/${usuarioAtual}/admin/adicionais`);
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o adicional");
        res.redirect(`/${usuarioAtual}/admin/adicionais`);
      });
  }
});

router.post("/adicionais/deletar", UserAuth, eAdmin, (req, res) => {
  Adicional.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Adicional deletado com sucesso!");
      res.redirect(`/${usuarioAtual}/admin/adicionais`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar o adicional");
      res.redirect(`/${usuarioAtual}/admin/adicionais`);
    });
});

module.exports = router;
