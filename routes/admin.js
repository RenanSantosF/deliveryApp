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
require("../models/Pagamento");
const Pagamento = mongoose.model("pagamentos");
require("../models/Bairro");
const Bairro = mongoose.model("bairros");

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
  Categoria.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((categorias) => {
      res.render("admin/categorias", {
        categorias: categorias,
        usuarioAtual: req.user.nomeLoja,
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect(`/${req.user.nomeLoja}/admin`);
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
      nomeLoja: req.user.nomeLoja,
    };
    try {
      new Categoria(novaCategoria).save();
      res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
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
      res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
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
    res.redirect(`/${req.user.nomeLoja}/admin/categorias/edit/${req.body.id}`);
  } else {
    Categoria.findOne({ _id: req.body.id })
      .then((categoria) => {
        (categoria.nome = req.body.nome), (categoria.slug = req.body.slug);
        categoria
          .save()
          .then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Houve um erro interno ao salvar a categoria!"
            );
            res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
      });
  }
});

router.post("/categorias/deletar", UserAuth, eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria");
      res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
    });
});

// Produtos

router.get("/produtos", UserAuth, eAdmin, (req, res) => {
  Produto.find({ nomeLoja: req.user.nomeLoja })
    .populate("categoria")
    .sort({ date: "desc" })
    .lean()
    .then((produtos) => {
      res.render("admin/produtos", { produtos: produtos });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as produtos");
      res.redirect(`/${req.user.nomeLoja}/admin`);
    });
});

router.get("/produtos/add", UserAuth, eAdmin, (req, res) => {
  Adicional.find({ nomeLoja: req.user.nomeLoja })
    .lean()
    .then((adicionais) => {
      Categoria.find({ nomeLoja: req.user.nomeLoja })
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
          res.redirect(`/${req.user.nomeLoja}/admin`);
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect(`/${req.user.nomeLoja}/admin`);
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
          categoriaAdicional: req.body.categoriaAdicional[i],
        });
      }

      const novaproduto = {
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        preco: req.body.preco,
        categoria: req.body.categoria,
        nomeLoja: req.user.nomeLoja,
        imgProduto: req.generatedFileName,
        adicionais: novosAdicionais,
      };
      new Produto(novaproduto)
        .save()
        .then(() => {
          req.flash("success_msg", "produto criado com sucesso!");
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro na criação da produto!");
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
        });
    }
  }
);

router.get("/produtos/edit/:id", UserAuth, eAdmin, (req, res) => {
  Produto.findOne({ _id: req.params.id })
    .lean()
    .then((produto) => {
      Adicional.find({ nomeLoja: req.user.nomeLoja })
        .lean()
        .then((adicionais) => {
          Categoria.find({ nomeLoja: req.user.nomeLoja })
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
              res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
            });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
        });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição"
      );
      res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
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
            categoriaAdicional: req.body.categoriaAdicional[i],
          });
        }

        const preco = req.body.preco;

        produto.titulo = req.body.titulo;
        produto.slug = req.body.slug;
        produto.descricao = req.body.descricao;
        produto.categoria = req.body.categoria;
        produto.preco = preco;
        produto.nomeLoja = req.user.nomeLoja;
        produto.imgProduto = req.generatedFileName;
        produto.adicionais = novosAdicionais;

        produto
          .save()
          .then(() => {
            req.flash("success_msg", "produto editada com sucesso!");
            res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
          })
          .catch((err) => {
            req.flash("error_msg", "Erro interno");
            res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição");
        res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
      });
  }
);

router.get("/produtos/deletar/:id", UserAuth, eAdmin, (req, res) => {
  Produto.deleteOne({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "produto deletada");
      res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a produto!");
      res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
    });
});

//Adicionais
router.get("/adicionais", UserAuth, eAdmin, (req, res) => {
  Adicional.find({ nomeLoja: req.user.nomeLoja })
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
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/adicionais/add", UserAuth, eAdmin, (req, res) => {
  Categoria.find({ nomeLoja: req.user.nomeLoja })
    .lean()
    .then((categorias) => {
      res.render("admin/addadicionais", {
        categorias: categorias,
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os adicionais");
      res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
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
      nomeLoja: req.user.nomeLoja,
      categoria: req.body.categoria,
    };
    try {
      new Adicional(novoAdicional).save();
      res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
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
      Categoria.find({ nomeLoja: req.user.nomeLoja })
        .lean()
        .then((categorias) => {
          res.render("admin/editadicionais", {
            adicional: adicional,
            categorias: categorias,
          });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar os adicionais");
          res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
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
    res.redirect(`/${req.user.nomeLoja}/admin/adicionais/edit/${req.body.id}`);
  } else {
    Adicional.findOne({ _id: req.body.id })
      .then((adicional) => {
        (adicional.nome = req.body.nome),
          (adicional.taxa = req.body.taxa),
          (adicional.categoria = req.body.categoria);
        adicional
          .save()
          .then(() => {
            req.flash("success_msg", "Adicional editado com sucesso!");
            res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Houve um erro interno ao adicionar o adicional!"
            );
            res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o adicional");
        res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
      });
  }
});

router.post("/adicionais/deletar", UserAuth, eAdmin, (req, res) => {
  Adicional.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Adicional deletado com sucesso!");
      res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar o adicional");
      res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
    });
});

//Pagamentos
router.get("/pagamentos", UserAuth, eAdmin, (req, res) => {
  Pagamento.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((pagamentos) => {
      res.render("admin/pagamentos", { pagamentos: pagamentos });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao listar as formas de pagamentos cadastradas"
      );
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/pagamentos/add", UserAuth, eAdmin, (req, res) => {
  try {
    res.render("admin/addpagamentos");
  } catch (error) {
    console.log(error);
    res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
  }
});

router.post("/pagamentos/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome da forma de pagamento precisa ser maior!" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da forma de pagamento precisa ser maior!" });
  }
  if (erros.length > 0) {
    res.render("admin/addpagamentos", { erros: erros });
  } else {
    const novoPagamento = {
      nome: req.body.nome,
      nomeLoja: req.user.nomeLoja,
    };
    try {
      new Pagamento(novoPagamento).save();
      res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
      req.flash("success_msg", "Forma de pagamento registrada com sucesso!");
    } catch (error) {
      req.flash(
        "error_msg",
        "Houve um erro ao cadastrar a forma de pagamento!"
      );
    }
  }
});

router.get("/pagamentos/edit/:id", UserAuth, eAdmin, (req, res) => {
  Pagamento.findOne({ _id: req.params.id })
    .lean()
    .then((pagamento) => {
      res.render("admin/editpagamentos", { pagamento: pagamento });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa forma de pagamento não existe!");
      res.redirect("/admin/pagamentos");
    });
});

router.post("/pagamentos/edit", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido!" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da forma de pagamento é inválido!" });
  }
  if (erros.length > 0) {
    res.render("editpagamentos", { erros: erros });
    res.redirect(`/${req.user.nomeLoja}/admin/pagamentos/edit/${req.body.id}`);
  } else {
    Pagamento.findOne({ _id: req.body.id })
      .then((pagamento) => {
        (pagamento.nome = req.body.nome),
        pagamento
            .save()
            .then(() => {
              req.flash("success_msg", "Forma de pagamento atualizada!");
              res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
            })
            .catch((err) => {
              req.flash(
                "error_msg",
                "Houve um erro ao editar a forma de pagamento!"
              );
              res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
            });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a forma de pagamento");
        res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
      });
  }
});

router.post("/pagamentos/deletar", UserAuth, eAdmin, (req, res) => {
  Adicional.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Forma de pagamento deletada com sucesso!");
      res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a forma de pagamento!");
      res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
    });
});

























//Bairros
router.get("/bairros", UserAuth, eAdmin, (req, res) => {
  Bairro.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((bairros) => {
      res.render("admin/bairros", { bairros: bairros });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro ao listar os bairros cadastrados"
      );
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/bairros/add", UserAuth, eAdmin, (req, res) => {
  try {
    res.render("admin/addbairros");
  } catch (error) {
    console.log(error);
    res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
  }
});

router.post("/bairros/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome do bairro inválido!" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome do bairro precisa ser maior!" });
  }
  if (erros.length > 0) {
    res.render("admin/addbairros", { erros: erros });
  } else {
    const novoBairro = {
      nome: req.body.nome,
      taxa: req.body.taxa,
      nomeLoja: req.user.nomeLoja,
    };
    try {
      new Bairro(novoBairro).save();
      res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
      req.flash("success_msg", "Bairro registrado com sucesso!");
    } catch (error) {
      req.flash(
        "error_msg",
        "Houve um erro ao cadastrar o bairro!"
      );
    }
  }
});

router.get("/bairros/edit/:id", UserAuth, eAdmin, (req, res) => {
  Bairro.findOne({ _id: req.params.id })
    .lean()
    .then((bairro) => {
      res.render("admin/editbairros", { bairro: bairro });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa forma de bairro não existe!");
      res.redirect("/admin/bairros");
    });
});

router.post("/bairros/edit", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido!" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome do bairro é inválido!" });
  }
  if (erros.length > 0) {
    res.render("editbairros", { erros: erros });
    res.redirect(`/${req.user.nomeLoja}/admin/bairros/edit/${req.body.id}`);
  } else {
    Bairro.findOne({ _id: req.body.id })
      .then((bairro) => {
        (bairro.nome = req.body.nome),
        (bairro.taxa = req.body.taxa)
        bairro
            .save()
            .then(() => {
              req.flash("success_msg", "Bairro atualizado!");
              res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
            })
            .catch((err) => {
              req.flash(
                "error_msg",
                "Houve um erro ao editar o bairro!"
              );
              res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
            });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o bairro");
        res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
      });
  }
});

router.post("/bairros/deletar", UserAuth, eAdmin, (req, res) => {
  Bairro.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Bairro deletado com sucesso!");
      res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar o bairro!");
      res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
    });
});

module.exports = router;
