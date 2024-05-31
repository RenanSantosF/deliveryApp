import { apiPedidos } from "./pedidosApi.js";
import { criarDivPedido } from "./eachPedido.js";
import { modalPedido } from "./modalPedido.js";
import atualizaCor from "./atualizaCor.js";
import showMenu from "../mostraMenu.js";
import atualizaModal from "./atualizaModal.js";
showMenu("nav-toggle", "nav-menu");
const loja = document.getElementById("loja").textContent;

const pedidosDiv = document.getElementById("pedidos");

const socket = io();

socket.on("connect", () => {
  console.log("connected to server");
});

socket.on("disconnect", () => {
  console.log("disconnected from server");
});

let pedidosData = [];

socket.on("novoPedido", (novoPedido) => {
  if (novoPedido.nomeLoja === loja) {
    SomNovoPedido();
    pedidosDiv.innerHTML = ``;
    obterPedidos();
  }
});

function SomNovoPedido() {
  const audio = new Audio("/sons/novoPedido.mp3");
  audio.play();
}

obterPedidos();

async function obterPedidos() {
  try {
    const pedidos = await apiPedidos();
    pedidosData = pedidos.pedidos;

    console.log(pedidosData);

    pedidosData.forEach((pedido) => {

      pedidosDiv.innerHTML += criarDivPedido(pedido);
      const btnModal = document.querySelectorAll(".btnModal");

      btnModal.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          let nextBtn = e.target.nextElementSibling;
          if (nextBtn && nextBtn.tagName === "BUTTON") {
            let textDoProximoBotao = nextBtn.textContent;
            let id = e.target.dataset.id;
            modalPedido(id, pedidosData, socket, textDoProximoBotao);
          } else {
            console.log("Não há próximo botão ou não é um botão");
          }
        });
      });

      const btnAtualizaStatus = document.querySelectorAll(".btnAtualizaStatus");
      btnAtualizaStatus.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          let id = e.target.dataset.id;
          console.log(id);
          socket.emit("atualizaPedido", id);
        });
      });
    });

    atualizaCor();
  } catch (error) {
    console.error("Erro ao obter pedidos:", error);
  }
}

socket.on("confirmacaoAtualizacao", (data) => {
  if (data.success) {
    atualizaPedido(data);
    atualizaCor();
  } else {
    Toastify({
      text: `Erro ao atualizar status do pedido`,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(90deg, rgba(255,95,109,1) 0%, rgba(196,91,38,1) 100%)",
        borderRadius: "10px",
      },
    }).showToast();
  }
});

function atualizaPedido(data) {
  console.log(data.pedido.nomeLoja);
  console.log(loja);
  if (data.pedido.nomeLoja === loja) {
    const resultado = document.getElementById(`${data.pedido._id}`);
    resultado.textContent = data.pedido.status;
    if (data.pedido.status === "Marcar como pronto") {
      resultado.style.backgroundColor = "var(--cor-pedidoPronto)";
    }
    if (data.pedido.status === "Despachar para entrega") {
      resultado.style.backgroundColor = "var(--cor-DespacharPedido)";
    }
    if (data.pedido.status === "Pedido concluído") {
      pedidosDiv.innerHTML = ``;
      obterPedidos();
    }
    const btnModalAtualiza = document.getElementById("btnModalAtualiza");
    if (btnModalAtualiza) {
      btnModalAtualiza.textContent = data.pedido.status;
      atualizaModal();
    }
    console.log(data);
  }
}
