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
require("../models/Pedido");
const Pedido = mongoose.model("pedidos");
const fs = require("fs");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueFileName = file.originalname + Date.now() + path.extname(file.originalname);
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

router.get("/", UserAuth, eAdmin, (req, res) => {
  res.render("admin/index", {
    user: req.user,
  });
});

router.get("/categorias", UserAuth, eAdmin, (req, res) => {
  Categoria.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((categorias) => {
      res.render("admin/categorias", {
        categorias: categorias,
        usuarioAtual: req.user.nomeLoja,
        user: req.user,
        css: "/css/pages/categoria/index.css",
        script: "/scripts/categoria/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect(`/${req.user.nomeLoja}/admin`);
    });
});

router.get("/categorias/add", UserAuth, eAdmin, (req, res) => {
  res.render("admin/addcategorias", {
    user: req.user,
    css: "/css/pages/addCategoria/index.css",
    script: "/scripts/addCategoria/index.js",
  });
});

router.post("/categorias/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido" });
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
    } catch (error) {
      req.flash("error_msg", "Houve um erro ao salvar a categoria!");
    }
  }
});

router.get("/categorias/edit/:id", UserAuth, eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editCategorias", {
        categoria: categoria,
        user: req.user,
        css: "/css/pages/editCategoria/index.css",
        script: "/scripts/editCategoria/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa categoria não existe!");
      res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
    });
});

// router.post("/categorias/edit", UserAuth, eAdmin, (req, res) => {
//   let erros = [];
//   if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
//     erros.push({ texto: "Nome inválido" });
//   }
//   if (req.body.nome.length < 2) {
//     erros.push({ texto: "Nome da categoria precisa ser maior" });
//   }
//   if (erros.length > 0) {
//     res.render("admin/editCategorias", { erros: erros });
//     res.redirect(`/${req.user.nomeLoja}/admin/categorias/edit/${req.body.id}`);
//   } else {
//     Categoria.findOne({ _id: req.body.id })
//       .then((categoria) => {
//         (categoria.nome = req.body.nome), (categoria.slug = req.body.slug);

//         console.log(categoria.slug = req.body.slug)
//         categoria
//           .save()
//           .then(() => {
//             res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
//           })
//           .catch((err) => {
//             req.flash("error_msg", "Houve um erro interno ao salvar a categoria!");
//             res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
//           });
//       })
//       .catch((err) => {
//         req.flash("error_msg", "Houve um erro ao editar a categoria");
//         res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
//       });
//   }
// });

router.post("/categorias/edit", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria precisa ser maior" });
  }
  if (erros.length > 0) {
    res.render("admin/editCategorias", { erros: erros });
    res.redirect(`/${req.user.nomeLoja}/admin/categorias/edit/${req.body.id}`);
  } else {
    Categoria.findOne({ _id: req.body.id })
      .then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;
        categoria
          .save()
          .then(() => {
            // Atualiza todos os produtos que possuem essa categoria
            Produto.updateMany({ categoria: req.body.id }, { $set: { categoria: req.body.id } })
              .then(() => {
                // Atualiza todos os adicionais que possuem essa categoria
                Adicional.updateMany({ categoria: req.body.id }, { $set: { categoria: req.body.nome } })
                  .then(() => {
                    res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
                  })
                  .catch((err) => {
                    req.flash("error_msg", "Houve um erro ao atualizar os adicionais da categoria!");
                    res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
                  });
              })
              .catch((err) => {
                req.flash("error_msg", "Houve um erro ao atualizar os produtos da categoria!");
                res.redirect(`/${req.user.nomeLoja}/admin/categorias`);
              });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a categoria!");
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
      res.render("admin/produtos", {
        produtos: produtos,
        user: req.user,
        css: "/css/pages/produto/index.css",
        script: "/scripts/produto/index.js",
      });
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
          function reorganizarPorCategoria(adicionais) {
            const adicionaisPorCategoria = {};

            adicionais.forEach((adicional) => {
              if (!adicionaisPorCategoria.hasOwnProperty(adicional.categoria)) {
                adicionaisPorCategoria[adicional.categoria] = [];
              }
              adicionaisPorCategoria[adicional.categoria].push(adicional);
            });

            return adicionaisPorCategoria;
          }

          const adicionaisPorCategoria = reorganizarPorCategoria(adicionais);

          res.render("admin/addProduto", {
            categorias: categorias,
            adicionais: adicionaisPorCategoria,
            css: "/css/pages/addProduto/index.css",
            script: "/scripts/addProdutos/index.js",
            user: req.user,
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

// router.post("/produtos/nova", upload.single("imgProduto"), UserAuth, eAdmin, (req, res) => {
//   let erros = [];

//   if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
//     erros.push({ texto: "Título inválido" });
//   }

//   if (!req.body.preco || typeof req.body.preco == undefined || req.body.preco == null) {
//     erros.push({ texto: "Valor inválido" });
//   }

//   if (req.body.categoria == "0") {
//     erros.push({ texto: "Categoria inválida, registre uma categoria" });
//   }

//   if (erros.length > 0) {
//     res.render("admin/addProduto", { erros: erros });
//   } else {
//     const novosAdicionais = [];
//     const adicionaisCategorias = Object.keys(req.body).filter((key) => key.startsWith("adicionais-"));

//     adicionaisCategorias.forEach((categoria) => {
//       const categoriaNome = categoria.replace("adicionais-", "");
//       const adicionais = Array.isArray(req.body[categoria]) ? req.body[categoria] : [req.body[categoria]];
//       const minAdicionais = req.body[`minAdicionais-${categoriaNome}`];
//       const maxAdicionais = req.body[`maxAdicionais-${categoriaNome}`];

//       adicionais.forEach((adicional, index) => {
//         novosAdicionais.push({
//           adicionais: adicional,
//           precoAdicional: req.body.precoAdicional[index],
//           produtoReferido: req.body.titulo,
//           categoriaAdicional: req.body[`categoriaAdicional-${categoriaNome}-${index}`],
//           minAdicionais: minAdicionais,
//           maxAdicionais: maxAdicionais,
//         });
//       });
//     });

//     const novaproduto = {
//       titulo: req.body.titulo,
//       descricao: req.body.descricao,
//       preco: req.body.preco,
//       categoria: req.body.categoria,
//       nomeLoja: req.user.nomeLoja,
//       imgProduto: req.file ? req.generatedFileName : req.generatedFileName,
//       adicionais: novosAdicionais,
//     };

//     console.log(novaproduto);

//     new Produto(novaproduto)
//       .save()
//       .then(() => {
//         res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
//       })
//       .catch((err) => {
//         req.flash("error_msg", "Houve um erro na criação do produto!");
//         res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
//         console.log(err);
//       });
//   }
// });

router.post("/produtos/nova", upload.single("imgProduto"), UserAuth, eAdmin, (req, res) => {
  let erros = [];

  if (!req.body.titulo || typeof req.body.titulo === 'undefined' || req.body.titulo === null) {
    erros.push({ texto: "Título inválido" });
  }

  if (!req.body.preco || typeof req.body.preco === 'undefined' || req.body.preco === null) {
    erros.push({ texto: "Valor inválido" });
  }

  if (req.body.categoria === "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria" });
  }

  if (erros.length > 0) {
    res.render("admin/addProduto", { erros: erros });
  } else {
    const novosAdicionais = [];
    const adicionaisCategorias = Object.keys(req.body).filter((key) => key.startsWith("adicionais-"));

    adicionaisCategorias.forEach((categoria) => {
      const categoriaNome = categoria.replace("adicionais-", "");
      const adicionais = Array.isArray(req.body[categoria]) ? req.body[categoria] : [req.body[categoria]];
      const minAdicionais = req.body[`minAdicionais-${categoriaNome}`];
      const maxAdicionais = req.body[`maxAdicionais-${categoriaNome}`];

      adicionais.forEach((adicional, index) => {
        const precoAdicional = req.body[`precoAdicional-${categoriaNome}-${index}`];
        novosAdicionais.push({
          adicionais: adicional,
          precoAdicional: precoAdicional,
          produtoReferido: req.body.titulo,
          categoriaAdicional: req.body[`categoriaAdicional-${categoriaNome}-${index}`],
          minAdicionais: minAdicionais,
          maxAdicionais: maxAdicionais,
        });
      });
    });

    const novaproduto = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      preco: req.body.preco,
      categoria: req.body.categoria,
      nomeLoja: req.user.nomeLoja,
      imgProduto: req.file ? req.generatedFileName : req.generatedFileName,
      adicionais: novosAdicionais,
    };

    console.log(novaproduto);

    new Produto(novaproduto)
      .save()
      .then(() => {
        res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro na criação do produto!");
        res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
        console.log(err);
      });
  }
});

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
              function reorganizarPorCategoria(adicionais) {
                const adicionaisPorCategoria = {};

                adicionais.forEach((adicional) => {
                  if (!adicionaisPorCategoria.hasOwnProperty(adicional.categoria)) {
                    adicionaisPorCategoria[adicional.categoria] = [];
                  }
                  adicionaisPorCategoria[adicional.categoria].push(adicional);
                });

                return adicionaisPorCategoria;
              }
              const adicionaisPorCategoria = reorganizarPorCategoria(adicionais);

              res.render("admin/editProdutos", {
                categorias: categorias,
                produto: produto,
                adicionais: adicionaisPorCategoria,
                css: "/css/pages/editProduto/index.css",
                script: "/scripts/editProduto/index.js",
                user: req.user,
              });
            })
            .catch((err) => {
              req.flash("error_msg", "Houve um erro ao exibir o produto");
              res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
            });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
      res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
    });
});

// router.post("/produto/edit", upload.single("imgProduto"), UserAuth, eAdmin, (req, res) => {
//   Produto.findOne({ _id: req.body.id })
//     .then((produto) => {
//       const novosAdicionais = [];
//       const adicionaisCategorias = Object.keys(req.body).filter((key) => key.startsWith("adicionais-"));

//       adicionaisCategorias.forEach((categoria) => {
//         const categoriaNome = categoria.replace("adicionais-", "");
//         const adicionais = Array.isArray(req.body[categoria]) ? req.body[categoria] : [req.body[categoria]];

//         adicionais.forEach((adicional, index) => {
//           novosAdicionais.push({
//             adicionais: adicional,
//             precoAdicional: req.body.precoAdicional[index],
//             produtoReferido: req.body.titulo,
//             categoriaAdicional: req.body[`categoriaAdicional-${categoriaNome}-${index}`],
//             minAdicionais: req.body[`minAdicionais-${categoriaNome}`],
//             maxAdicionais: req.body[`maxAdicionais-${categoriaNome}`],
//           });
//         });
//       });

//       const preco = req.body.preco;

//       produto.titulo = req.body.titulo;
//       produto.descricao = req.body.descricao;
//       produto.categoria = req.body.categoria;
//       produto.preco = preco;
//       produto.nomeLoja = req.user.nomeLoja;

//       if (req.file) {
//         if (produto.imgProduto) {
//           const imagePath = path.join(__dirname, "..", "public", "uploads", produto.imgProduto);

//           fs.unlink(imagePath, (err) => {
//             if (err) {
//               console.error("Erro ao excluir a foto anterior:", err);
//             }
//           });
//         }
//         produto.imgProduto = req.generatedFileName ? req.generatedFileName : "padrao/imgPadrao.png";
//       }

//       produto.adicionais = novosAdicionais;

//       console.log(produto);
//       produto
//         .save()
//         .then(() => {
//           res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
//         })
//         .catch((err) => {
//           req.flash("error_msg", "Erro interno ao salvar a edição");
//           res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
//         });
//     })
//     .catch((err) => {
//       req.flash("error_msg", "Houve um erro ao encontrar o produto para edição");
//       res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
//     });
// });


router.post("/produto/edit", upload.single("imgProduto"), UserAuth, eAdmin, (req, res) => {
  Produto.findOne({ _id: req.body.id })
    .then((produto) => {
      const novosAdicionais = [];
      const adicionaisCategorias = Object.keys(req.body).filter((key) => key.startsWith("adicionais-"));

      adicionaisCategorias.forEach((categoria) => {
        const categoriaNome = categoria.replace("adicionais-", "");
        const adicionais = Array.isArray(req.body[categoria]) ? req.body[categoria] : [req.body[categoria]];
        const minAdicionais = req.body[`minAdicionais-${categoriaNome}`];
        const maxAdicionais = req.body[`maxAdicionais-${categoriaNome}`];

        adicionais.forEach((adicional, index) => {
          const precoAdicional = req.body[`precoAdicional-${categoriaNome}-${index}`];
          novosAdicionais.push({
            adicionais: adicional,
            precoAdicional: precoAdicional,
            produtoReferido: req.body.titulo,
            categoriaAdicional: req.body[`categoriaAdicional-${categoriaNome}-${index}`],
            minAdicionais: minAdicionais,
            maxAdicionais: maxAdicionais,
          });
        });
      });

      const preco = req.body.preco;

      produto.titulo = req.body.titulo;
      produto.descricao = req.body.descricao;
      produto.categoria = req.body.categoria;
      produto.preco = preco;
      produto.nomeLoja = req.user.nomeLoja;

      if (req.file) {
        if (produto.imgProduto) {
          const imagePath = path.join(__dirname, "..", "public", "uploads", produto.imgProduto);

          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error("Erro ao excluir a foto anterior:", err);
            }
          });
        }
        produto.imgProduto = req.generatedFileName ? req.generatedFileName : "padrao/imgPadrao.png";
      }

      produto.adicionais = novosAdicionais;

      console.log(produto);
      produto
        .save()
        .then(() => {
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
        })
        .catch((err) => {
          req.flash("error_msg", "Erro interno ao salvar a edição");
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao encontrar o produto para edição");
      res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
    });
});


router.post("/produtos/deletar", UserAuth, eAdmin, (req, res) => {
  Produto.findOne({ _id: req.body.id })
    .then((produto) => {
      if (!produto) {
        req.flash("error_msg", "Produto não encontrado!");
        return res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
      }

      if (produto.imgProduto) {
        const imagePath = path.join(__dirname, "..", "public", "uploads", produto.imgProduto);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Erro ao excluir a foto:", err);
          }
        });
      }

      Produto.deleteOne({ _id: req.body.id })
        .then(() => {
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
          console.log("Produto excluído com sucesso.");
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao deletar o produto!");
          res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
          console.error("Erro ao excluir o produto:", err);
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao encontrar o produto!");
      res.redirect(`/${req.user.nomeLoja}/admin/produtos`);
      console.error("Erro ao encontrar o produto:", err);
    });
});

router.get("/adicionais", UserAuth, eAdmin, (req, res) => {
  Adicional.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((adicionais) => {
      res.render("admin/adicionais", {
        adicionais: adicionais,
        user: req.user,
        css: "/css/pages/adicional/index.css",
        script: "/scripts/adicional/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os adicionais cadastrados");
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/adicionais/add", UserAuth, eAdmin, (req, res) => {
  Categoria.find({ nomeLoja: req.user.nomeLoja })
    .lean()
    .then((categorias) => {
      res.render("admin/addadicionais", {
        categorias: categorias,
        user: req.user,
        css: "/css/pages/addAdicional/index.css",
        script: "/scripts/addAdicional/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os adicionais");
      res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
    });
});

router.post("/adicionais/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido" });
  }
  if (!req.body.taxa || typeof req.body.taxa == undefined || req.body.taxa == null) {
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
          res.render("admin/editAdicionais", {
            adicional: adicional,
            categorias: categorias,
            user: req.user,
            css: "/css/pages/editAdicional/index.css",
            script: "/scripts/editAdicional/index.js",
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
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido" });
  }
  if (!req.body.taxa || typeof req.body.taxa == undefined || req.body.taxa == null) {
    erros.push({ texto: "Valor inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome do adicional precisa ser maior" });
  }
  if (erros.length > 0) {
    console.log("Validation errors:", erros);
    res.render("editAdicionais", { erros: erros });
    res.redirect(`/${req.user.nomeLoja}/admin/adicionais/edit/${req.body.id}`);
  } else {
    Adicional.findOne({ _id: req.body.id })
      .then((adicional) => {
        if (!adicional) {
          console.log("Adicional not found");
          req.flash("error_msg", "Adicional não encontrado");
          return res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
        }

        const nomeAntigo = adicional.nome;

        adicional.nome = req.body.nome;
        adicional.taxa = req.body.taxa;
        adicional.categoria = req.body.categoria;

        adicional.save()
          .then(() => {
            console.log("Adicional updated:", adicional);

            // Atualiza todos os produtos que possuem o adicional com o nome antigo
            Produto.find({ "adicionais.adicionais": nomeAntigo })
              .then((produtos) => {
                if (produtos.length === 0) {
                  console.log("No products found with this adicional");
                }

                produtos.forEach((produto) => {
                  let modified = false;

                  produto.adicionais.forEach((adicionalItem) => {
                    if (adicionalItem.adicionais === nomeAntigo) {
                      console.log("Updating adicional in product:", produto._id);
                      adicionalItem.adicionais = req.body.nome;
                      adicionalItem.precoAdicional = req.body.taxa;
                      adicionalItem.categoriaAdicional = req.body.categoria;
                      modified = true;
                    }
                  });

                  if (modified) {
                    produto.save().then(() => {
                      console.log("Product updated:", produto._id);
                    }).catch((err) => {
                      console.log("Error saving product:", err);
                      req.flash("error_msg", "Houve um erro ao atualizar um produto com o adicional editado!");
                    });
                  }
                });

                res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
              })
              .catch((err) => {
                console.log("Error finding products:", err);
                req.flash("error_msg", "Houve um erro ao buscar os produtos com o adicional editado!");
                res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
              });
          })
          .catch((err) => {
            console.log("Error saving adicional:", err);
            req.flash("error_msg", "Houve um erro interno ao adicionar o adicional!");
            res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
          });
      })
      .catch((err) => {
        console.log("Error finding adicional:", err);
        req.flash("error_msg", "Houve um erro ao editar o adicional");
        res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
      });
  }
});

router.post("/adicionais/deletar", UserAuth, eAdmin, (req, res) => {
  Adicional.deleteOne({ _id: req.body.id })
    .then(() => {
      res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar o adicional");
      res.redirect(`/${req.user.nomeLoja}/admin/adicionais`);
    });
});

router.get("/pagamentos", UserAuth, eAdmin, (req, res) => {
  Pagamento.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((pagamentos) => {
      res.render("admin/pagamentos", {
        pagamentos: pagamentos,
        user: req.user,
        css: "/css/pages/pagamento/index.css",
        script: "/scripts/pagamento/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as formas de pagamentos cadastradas");
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/pagamentos/add", UserAuth, eAdmin, (req, res) => {
  try {
    res.render("admin/addpagamentos", {
      user: req.user,
      css: "/css/pages/addPagamento/index.css",
      script: "/scripts/addPagamento/index.js",
    });
  } catch (error) {
    res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
  }
});

router.post("/pagamentos/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
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
    } catch (error) {
      req.flash("error_msg", "Houve um erro ao cadastrar a forma de pagamento!");
    }
  }
});

router.get("/pagamentos/edit/:id", UserAuth, eAdmin, (req, res) => {
  Pagamento.findOne({ _id: req.params.id })
    .lean()
    .then((pagamento) => {
      res.render("admin/editpagamentos", {
        pagamento: pagamento,
        user: req.user,
        css: "/css/pages/editPagamento/index.css",
        script: "/scripts/editPagamento/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa forma de pagamento não existe!");
      res.redirect("/admin/pagamentos");
    });
});

router.post("/pagamentos/edit", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
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
              res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
            })
            .catch((err) => {
              req.flash("error_msg", "Houve um erro ao editar a forma de pagamento!");
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
  Pagamento.deleteOne({ _id: req.body.id })
    .then(() => {
      res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a forma de pagamento!");
      res.redirect(`/${req.user.nomeLoja}/admin/pagamentos`);
    });
});

router.get("/bairros", UserAuth, eAdmin, (req, res) => {
  Bairro.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((bairros) => {
      res.render("admin/bairros", {
        bairros: bairros,
        user: req.user,
        css: "/css/pages/bairro/index.css",
        script: "/scripts/bairro/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os bairros cadastrados");
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/bairros/add", UserAuth, eAdmin, (req, res) => {
  try {
    res.render("admin/addbairros", {
      user: req.user,
      css: "/css/pages/addBairro/index.css",
      script: "/scripts/addBairro/index.js",
    });
  } catch (error) {
    res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
  }
});

router.post("/bairros/nova", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
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
    } catch (error) {
      req.flash("error_msg", "Houve um erro ao cadastrar o bairro!");
    }
  }
});

router.get("/bairros/edit/:id", UserAuth, eAdmin, (req, res) => {
  Bairro.findOne({ _id: req.params.id })
    .lean()
    .then((bairro) => {
      res.render("admin/editbairros", {
        bairro: bairro,
        user: req.user,
        css: "/css/pages/editBairro/index.css",
        script: "/scripts/editBairro/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa forma de bairro não existe!");
      res.redirect("/admin/bairros");
    });
});

router.post("/bairros/edit", UserAuth, eAdmin, (req, res) => {
  let erros = [];
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
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
        (bairro.nome = req.body.nome), (bairro.taxa = req.body.taxa);
        bairro
          .save()
          .then(() => {
            res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar o bairro!");
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
      res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar o bairro!");
      res.redirect(`/${req.user.nomeLoja}/admin/bairros`);
    });
});

router.get("/pedidos", UserAuth, eAdmin, (req, res) => {
  Pedido.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((pedidos) => {
      res.render("admin/pedidos", {
        pedidos: pedidos,
        nomeLoja: req.user.nomeLoja,
        user: req.user,
        css: "/css/pages/pedido/index.css",
        script: "/scripts/pedido/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os pedidos");
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/pedidosAPI", UserAuth, eAdmin, (req, res) => {
  Pedido.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((pedidos) => {
      res.send({ pedidos: pedidos });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os pedidos");
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/pedidos-finalizados", UserAuth, eAdmin, (req, res) => {
  Pedido.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((pedidos) => {
      res.render("admin/pedidosFinalizados", {
        pedidos: pedidos,
        nomeLoja: req.user.nomeLoja,
        user: req.user,
        css: "/css/pages/pedidoFinalizado/index.css",
        script: "/scripts/pedidoFinalizado/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os pedidos");
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

router.get("/pedidosFinalizadosAPI", UserAuth, eAdmin, (req, res) => {
  Pedido.find({ nomeLoja: req.user.nomeLoja })
    .sort({ date: "desc" })
    .lean()
    .then((pedidos) => {
      res.send({ pedidos: pedidos });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar os pedidos");
      res.redirect(`"/${req.user.nomeLoja}/admin`);
    });
});

module.exports = router;
