import { apiPedidos } from "./pedidosApi.js";
import { criarDivPedido } from "./eachPedido.js";
import { modalPedido } from "./modalPedido.js";
import atualizaCor from "./atualizaCor.js";
import showMenu from "../mostraMenu.js";
showMenu("nav-toggle", "nav-menu");
const loja = document.getElementById("loja").textContent;

const pedidosDiv = document.getElementById("pedidos");

const socket = io();

socket.on("connect", () => {
});

socket.on("disconnect", () => {
});

let pedidosData = [];

socket.on("pedidoConcluido", (novoPedido) => {
  if (novoPedido.nomeLoja === loja) {
    pedidosDiv.innerHTML = ``;
    obterPedidos();
  }
});

obterPedidos();
async function obterPedidos() {
  try {
    const pedidos = await apiPedidos();
    pedidosData = pedidos.pedidos;

    pedidosData.forEach((pedido) => {
      pedidosDiv.innerHTML += criarDivPedido(pedido);
      const btnModal = document.querySelectorAll(".btnModal");

      btnModal.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            let id = e.target.dataset.id;
            modalPedido(id, pedidosData);
        });
      });
    });

    atualizaCor();
  } catch (error) {
    console.error("Erro ao obter pedidos:", error);
  }
}
