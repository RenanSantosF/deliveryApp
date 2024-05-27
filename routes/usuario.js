const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const multer = require("multer");
const path = require("path");

// Configurando o recebimento de arquivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueFileName = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});
const upload = multer({ storage: storage });

// Rotas
router.get("/registro", (req, res) => {
  res.render("usuarios/registro", {
    css: "/css/pages/registro/index.css",
    script: "/scripts/registro/index.js",
  });
});

// router.post(
//   "/registro",
//   upload.fields([
//     { name: "imgLogo", maxCount: 1 },
//     { name: "imgBg", maxCount: 1 },
//   ]),
//   (req, res) => {
//     let erros = [];

//     if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
//       erros.push({ texto: "Nome inválido" });
//     }
//     if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
//       erros.push({ texto: "Email inválido" });
//     }
//     if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
//       erros.push({ texto: "Senha inválida" });
//     }
//     if (req.body.senha.length < 4) {
//       erros.push({ texto: "Senha curta demais" });
//     }
//     if (req.body.senha != req.body.senha2) {
//       erros.push({ texto: "As senhas não conferem" });
//     }

//     if (erros.length > 0) {
//       res.render("usuarios/registro", { erros: erros });
//       console.log(erros);
//     } else {
//       Usuario.findOne({ email: req.body.email })
//         .lean()
//         .then((usuario) => {
//           if (usuario) {
//             req.flash("error_msg", "Já existe uma conta com este email no nosso sistema");
//             res.redirect("/usuarios/registro");
//           } else {
//             let loja = req.body.nomeLoja;
//             function slugify(text) {
//               // Normaliza o texto para decompor caracteres especiais
//               text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
//               // Remove caracteres não-ASCII
//               text = text.replace(/[^\w\s-]/g, "");
//               // Substitui espaços e múltiplos hífens por um único hífen
//               text = text.trim().replace(/\s+/g, "-").replace(/-+/g, "-");
//               // Converte para minúsculas
//               text = text.toLowerCase();
//               return text;
//             }

//             let nomeLojaCorrigido = slugify(loja);

//             const novoUsuario = new Usuario({
//               nome: req.body.nome,
//               email: req.body.email,
//               senha: req.body.senha,
//               NomeDaLoja: req.body.nomeLoja,
//               nomeLoja: nomeLojaCorrigido,
//               imgLogo: req.files.imgLogo[0].filename,
//               imgBg: req.files.imgBg[0].filename,
//               telefone: req.body.telefone,
//               numeroRua: req.body.numero,
//               rua: req.body.rua,
//               bairro: req.body.bairro,
//               cidade: req.body.cidade,
//               estado: req.body.estado,
//               pontoReferencia: req.body.pontoReferencia,
//               segAb: req.body.segAb,
//               segFe: req.body.segFe,
//               terAb: req.body.terAb,
//               terFe: req.body.terFe,
//               quaAb: req.body.quaAb,
//               quaFe: req.body.quaFe,
//               quiAb: req.body.quiAb,
//               quiFe: req.body.quiFe,
//               sexAb: req.body.sexAb,
//               sexFe: req.body.sexFe,
//               sabAb: req.body.sabAb,
//               sabFe: req.body.sabFe,
//               domAb: req.body.domAb,
//               domFe: req.body.domFe,
//             });

//             bcrypt.genSalt(10, (erro, salt) => {
//               bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
//                 if (erro) {
//                   req.flash("error_msg", "Houve um erro durante o salvamento de usuário");
//                   res.redirect("/");
//                   console.log(erro);
//                 } else {
//                   novoUsuario.senha = hash;
//                   novoUsuario
//                     .save()
//                     .then(() => {
//                       res.redirect("/");
//                     })
//                     .catch((err) => {
//                       req.flash("error_msg", "Houve um erro  ao criar o usuario, tente novamente!");
//                       res.redirect("/usuarios/registro");
//                       console.log(err);
//                     });
//                 }
//               });
//             });
//           }
//         })
//         .catch((err) => {
//           req.flash("error_msg", "Houve um erro interno");
//           res.redirect("/");
//           console.log(err);
//         });
//     }
//   }
// );

router.post(
  "/registro",
  upload.fields([
    { name: "imgLogo", maxCount: 1 },
    { name: "imgBg", maxCount: 1 },
  ]),
  (req, res) => {
    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
      erros.push({ texto: "Nome inválido" });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
      erros.push({ texto: "Email inválido" });
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
      erros.push({ texto: "Senha inválida" });
    }
    if (req.body.senha.length < 4) {
      erros.push({ texto: "Senha curta demais" });
    }
    if (req.body.senha != req.body.senha2) {
      erros.push({ texto: "As senhas não conferem" });
    }

    if (erros.length > 0) {
      res.render("usuarios/registro", { erros: erros });
      console.log(erros);
    } else {
      Usuario.findOne({ email: req.body.email })
        .lean()
        .then((usuario) => {
          if (usuario) {
            req.flash("error_msg", "Já existe uma conta com este email no nosso sistema");
            res.redirect("/usuarios/registro");
          } else {
            let loja = req.body.nomeLoja;
            function slugify(text) {
              // Normaliza o texto para decompor caracteres especiais
              text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              // Remove caracteres não-ASCII
              text = text.replace(/[^\w\s-]/g, "");
              // Substitui espaços e múltiplos hífens por um único hífen
              text = text.trim().replace(/\s+/g, "-").replace(/-+/g, "-");
              // Converte para minúsculas
              text = text.toLowerCase();
              return text;
            }

            let nomeLojaCorrigido = slugify(loja);

            const novoUsuario = new Usuario({
              nome: req.body.nome,
              email: req.body.email,
              senha: req.body.senha,
              NomeDaLoja: req.body.nomeDaLoja,
              nomeLoja: nomeLojaCorrigido,
              imgLogo: req.files.imgLogo ? req.files.imgLogo[0].filename : "/padrao/imgPadrao.png",
              imgBg: req.files.imgBg ? req.files.imgBg[0].filename : "/padrao/imgPadrao.png",
              telefone: req.body.telefone,
              numeroRua: req.body.numero,
              rua: req.body.rua,
              bairro: req.body.bairro,
              cidade: req.body.cidade,
              estado: req.body.estado,
              pontoReferencia: req.body.pontoReferencia,
              segAb: req.body.segAb,
              segFe: req.body.segFe,
              terAb: req.body.terAb,
              terFe: req.body.terFe,
              quaAb: req.body.quaAb,
              quaFe: req.body.quaFe,
              quiAb: req.body.quiAb,
              quiFe: req.body.quiFe,
              sexAb: req.body.sexAb,
              sexFe: req.body.sexFe,
              sabAb: req.body.sabAb,
              sabFe: req.body.sabFe,
              domAb: req.body.domAb,
              domFe: req.body.domFe,
            });

            bcrypt.genSalt(10, (erro, salt) => {
              bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                if (erro) {
                  req.flash("error_msg", "Houve um erro durante o salvamento de usuário");
                  res.redirect("/");
                  console.log(erro);
                } else {
                  novoUsuario.senha = hash;
                  novoUsuario
                    .save()
                    .then(() => {
                      res.redirect("/");
                    })
                    .catch((err) => {
                      req.flash("error_msg", "Houve um erro ao criar o usuario, tente novamente!");
                      res.redirect("/usuarios/registro");
                      console.log(err);
                    });
                }
              });
            });
          }
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro interno");
          res.redirect("/");
          console.log(err);
        });
    }
  }
);

router.get("/login", (req, res) => {
  res.render("usuarios/login", {
    css: "/css/pages/login/index.css",
    script: "/scripts/login/index.js",
  });
});

router.post("/cadastrar", (req, res) => {
  res.redirect("/usuarios/registro");
});

// Consulta disponibilidade do nome de usuário no DB
router.get('/check-username', (req, res) => {
  const username = req.query.username;

  Usuario.findOne({ nomeLoja: username })
    .lean()
    .then((usuario) => {
      if (usuario) {
        res.json({ available: false });
      } else {
        res.json({ available: true });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ available: false });
    });
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Deslogado com sucesso");
    res.redirect("/usuarios/login");
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error_msg", "Usuário ou senha inválidos");
      return res.redirect("/usuarios/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const userRoute = `/${req.user.nomeLoja}/admin/pedidos/`;
      return res.redirect(userRoute);
    });
  })(req, res, next);
});

module.exports = router;
