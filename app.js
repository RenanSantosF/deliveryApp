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
const cors = require("cors");
require("./models/Pagamento");
const Pagamento = mongoose.model("pagamentos");
require("./models/Bairro");
const Bairro = mongoose.model("bairros");
require("./models/Pedido");
const Pedido = mongoose.model("pedidos");
const db = require("./config/db");
const { createServer } = require("node:http");

const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);

// Configurações
// Sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);

// Middleware para redirecionamento
app.use((req, res, next) => {
  if (req.path.substr(-1) === "/" && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

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
  mongoose.connect(db.mongoURI);
  console.log("Conectado ao mongo");
} catch {
  console.log("Erro ao conectar: " + err);
}
// Public
app.use(express.static(path.join(__dirname, "public")));

//
// Rotas

console.log(db.mongoURI)

app.use("/:nomeLoja/admin", autenticado, admin);
app.use("/usuarios", usuarios);

app.get("/", (req, res) => {
  res.send("principal");
});

// Página da loja, de exibir erro
app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

app.post("/pedidos", async (req, res) => {
  try {
    const dadosPedido = req.body;

    const ultimoPedido = await Pedido.findOne({ nomeLoja: dadosPedido.nomeLoja }).sort({ numeroPedido: -1 });

    let novoNumeroPedido;
    if (ultimoPedido) {
      novoNumeroPedido = ultimoPedido.numeroPedido + 1;
    } else {
      novoNumeroPedido = 1;
    }

    dadosPedido.numeroPedido = novoNumeroPedido;
    const novoPedido = new Pedido(dadosPedido);
    await novoPedido.save();
    io.emit("novoPedido", novoPedido);

    res.status(201).json({ message: "enviado!", numeroPedido: novoNumeroPedido });
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    res.status(500).json({ message: "Erro ao salvar pedido", error });
  }
});

// app.get("/:nomeLoja", existeUsuario, (req, res) => {
//   let dadosUsuario = [];
//   let statusLoja = [];
//   let horarios = [];
//   let formasPagamento = [];
//   let bairrosCadastrados = [];
//   Usuario.find({ nomeLoja: req.params.nomeLoja })
//     .lean()
//     .then((usuario) => {
//       dadosUsuario = usuario;

//       const horariosDeFuncionamento = {
//         seg: { abertura: usuario[0].segAb, fechamento: usuario[0].segFe },
//         ter: { abertura: usuario[0].terAb, fechamento: usuario[0].terFe },
//         qua: { abertura: usuario[0].quaAb, fechamento: usuario[0].quaFe },
//         qui: { abertura: usuario[0].quiAb, fechamento: usuario[0].quiFe },
//         sex: { abertura: usuario[0].sexAb, fechamento: usuario[0].sexFe },
//         sab: { abertura: usuario[0].sabAb, fechamento: usuario[0].sabFe },
//         dom: { abertura: usuario[0].domAb, fechamento: usuario[0].domFe },
//       };

//       statusLoja = verificarHorarioDeFuncionamento(horariosDeFuncionamento);
//       horarios = horariosDeFuncionamento;
//       dadosUsuario.forEach((usuario) => {
//         usuario.statusSituacao = statusLoja;
//       });
//     })
//     .catch((err) => {
//       // res.send('erro ao exibir usuário')
//     });

//   Pagamento.find({ nomeLoja: req.params.nomeLoja })
//     .lean()
//     .then((pagamentos) => {
//       formasPagamento = pagamentos;
//     });

//   Bairro.find({ nomeLoja: req.params.nomeLoja })
//     .lean()
//     .then((bairros) => {
//       bairrosCadastrados = bairros;
//     });

//   Produto.find({ nomeLoja: req.params.nomeLoja })
//     .lean()
//     .populate("categoria")
//     .sort({ data: "desc" })
//     .then((produtos) => {
//       Categoria.find({ nomeLoja: req.params.nomeLoja })
//         .lean()
//         .sort({ data: "desc" })
//         .then((categorias) => {
//           const produtosPorCategoria = {};

//           categorias.forEach((categoria) => {
//             produtosPorCategoria[categoria.nome] = [];
//           });

//           produtos.forEach((produto) => {
//             const categoria = categorias.find((cat) => cat.nome === produto.categoria.nome);

//             if (categoria) {
//               produtosPorCategoria[categoria.nome].push(produto);
//             }
//           });
//           console.log(statusLoja);

//           res.render("index", {
//             produtosPorCategoria: produtosPorCategoria,
//             dadosUsuario: dadosUsuario,
//             statusLoja: statusLoja,
//             formasPagamento: formasPagamento,
//             bairrosCadastrados: bairrosCadastrados,
//             title: `${req.params.nomeLoja}`,
//             css: "/css/pages/home/index.css",
//             script: "/scripts/cliente/index.js",
//           });
//         })

//         .catch((err) => {
//           res.send("Erro interno");
//           console.log(err);
//         });
//     })
//     .catch((err) => {
//       req.flash("error_msg", "Houve um erro interno");
//       res.send("Erro interno");
//       console.log(err);
//     });
// });

app.get("/:nomeLoja", existeUsuario, (req, res) => {
  let dadosUsuario = [];
  let statusLoja = [];
  let horarios = [];
  let formasPagamento = [];
  let bairrosCadastrados = [];

  Usuario.find({ nomeLoja: req.params.nomeLoja })
    .lean()
    .then((usuario) => {
      dadosUsuario = usuario;

      const horariosDeFuncionamento = {
        seg: { abertura: usuario[0].segAb, fechamento: usuario[0].segFe },
        ter: { abertura: usuario[0].terAb, fechamento: usuario[0].terFe },
        qua: { abertura: usuario[0].quaAb, fechamento: usuario[0].quaFe },
        qui: { abertura: usuario[0].quiAb, fechamento: usuario[0].quiFe },
        sex: { abertura: usuario[0].sexAb, fechamento: usuario[0].sexFe },
        sab: { abertura: usuario[0].sabAb, fechamento: usuario[0].sabFe },
        dom: { abertura: usuario[0].domAb, fechamento: usuario[0].domFe },
      };

      statusLoja = verificarHorarioDeFuncionamento(horariosDeFuncionamento);
      horarios = horariosDeFuncionamento;
      dadosUsuario.forEach((usuario) => {
        usuario.statusSituacao = statusLoja;
      });

      return Promise.all([Pagamento.find({ nomeLoja: req.params.nomeLoja }).lean(), Bairro.find({ nomeLoja: req.params.nomeLoja }).lean(), Produto.find({ nomeLoja: req.params.nomeLoja }).lean().populate("categoria").sort({ data: "desc" }), Categoria.find({ nomeLoja: req.params.nomeLoja }).lean().sort({ data: "desc" })]);
    })
    .then(([pagamentos, bairros, produtos, categorias]) => {
      formasPagamento = pagamentos;
      bairrosCadastrados = bairros;

      const produtosPorCategoria = {};

      categorias.forEach((categoria) => {
        produtosPorCategoria[categoria.nome] = [];
      });

      produtos.forEach((produto) => {
        const categoria = categorias.find((cat) => cat.nome === produto.categoria.nome);

        if (categoria) {
          produtosPorCategoria[categoria.nome].push(produto);
        }
      });

      res.render("index", {
        produtosPorCategoria: produtosPorCategoria,
        dadosUsuario: dadosUsuario,
        statusLoja: statusLoja,
        formasPagamento: formasPagamento,
        bairrosCadastrados: bairrosCadastrados,
        title: `${req.params.nomeLoja}`,
        css: "/css/pages/home/index.css",
        script: "/scripts/cliente/index.js",
      });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.send("Erro interno");
      console.log(err);
    });
});

function verificarHorarioDeFuncionamento(element) {
  // Obter o horário atual
  const agora = new Date();
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();
  const horarioAtualEmMinutos = horaAtual * 60 + minutoAtual;

  // Obter o dia atual da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  const diaAtual = agora.getDay();
  const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const diaSemana = diasSemana[diaAtual];
  const diaSemanaAnterior = diasSemana[(diaAtual + 6) % 7]; // Dia anterior

  // Função auxiliar para converter horário em minutos desde a meia-noite
  function converterParaMinutos(horario) {
    const [hora, minuto] = horario.split(":").map(Number);
    return hora * 60 + minuto;
  }

  // Verificar se a loja está aberta no dia anterior
  if (diaSemanaAnterior in element) {
    const horarioAnterior = element[diaSemanaAnterior];
    const aberturaAnteriorEmMinutos = converterParaMinutos(horarioAnterior.abertura);
    const fechamentoAnteriorEmMinutos = converterParaMinutos(horarioAnterior.fechamento);

    if (fechamentoAnteriorEmMinutos < aberturaAnteriorEmMinutos) {
      // Caso a loja feche após a meia-noite do dia anterior
      if (horarioAtualEmMinutos < fechamentoAnteriorEmMinutos) {
        return [
          {
            status: "aberta",
            dia: diaSemanaAnterior,
            abertura: horarioAnterior.abertura,
            fechamento: horarioAnterior.fechamento,
          },
        ];
      }
    }
  }

  // Verificar se a loja está aberta no dia atual
  if (diaSemana in element) {
    const horarioFuncionamento = element[diaSemana];
    const aberturaEmMinutos = converterParaMinutos(horarioFuncionamento.abertura);
    const fechamentoEmMinutos = converterParaMinutos(horarioFuncionamento.fechamento);

    if (fechamentoEmMinutos < aberturaEmMinutos) {
      // Caso a loja feche após a meia-noite
      if (horarioAtualEmMinutos >= aberturaEmMinutos || horarioAtualEmMinutos < fechamentoEmMinutos) {
        return [
          {
            status: "Aberta",
            dia: diaSemana,
            abertura: horarioFuncionamento.abertura,
            fechamento: horarioFuncionamento.fechamento,
          },
        ];
      }
    } else {
      // Caso a loja feche no mesmo dia
      if (horarioAtualEmMinutos >= aberturaEmMinutos && horarioAtualEmMinutos <= fechamentoEmMinutos) {
        return [
          {
            status: "Aberta",
            dia: diaSemana,
            abertura: horarioFuncionamento.abertura,
            fechamento: horarioFuncionamento.fechamento,
          },
        ];
      }
    }
  }

  return [
    {
      status: "Fechada",
      dia: diaSemana,
      abertura: diaSemana in element ? element[diaSemana].abertura : null,
      fechamento: diaSemana in element ? element[diaSemana].fechamento : null,
    },
  ];
}

const atualizarStatusPedido = (pedido) => {
  if (pedido.status === "Aceitar pedido") {
    pedido.status = "Marcar como pronto";
  } else if (pedido.status === "Marcar como pronto") {
    pedido.status = "Despachar para entrega";
  } else if (pedido.status === "Despachar para entrega") {
    pedido.status = "Pedido concluído";
  }
};

io.on("connection", (socket) => {
  console.log("Um usuário se conectou");

  socket.on("atualizaPedido", async (id) => {
    try {
      const pedido = await Pedido.findById(id);
      if (pedido) {
        atualizarStatusPedido(pedido);
        await pedido.save();
        io.emit("confirmacaoAtualizacao", {
          success: true,
          pedido: {
            _id: pedido._id,
            status: pedido.status,
            nomeLoja: pedido.nomeLoja,
          },
        });

        if (pedido.status === "Pedido concluído") {
          io.emit("pedidoConcluido", pedido);
        }
      } else {
        socket.emit("confirmacaoAtualizacao", { success: false, message: "Pedido não encontrado" });
      }
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      socket.emit("confirmacaoAtualizacao", { success: false, message: "Erro ao atualizar pedido" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Um usuário se desconectou");
  });
});

// Outros
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
