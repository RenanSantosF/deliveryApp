import { apiPedidos } from "./pedidosApi.js";
import { criarDivPedido } from "./eachPedido.js";
import { modalPedido, modalPedido2 } from "./modalPedido.js";
const pedidosDiv = document.getElementById("pedidos");

const socket = io();

socket.on("connect", () => {
  console.log("connected to server");
});

socket.on("disconnect", () => {
  console.log("disconnected from server");
});

let pedidosData = []

socket.on("novoPedido", (novoPedido) => {
  SomNovoPedido();
  // pedidosData.push(novoPedido);
  // pedidosDiv.innerHTML += criarDivPedido(novoPedido);


  // const btnModal = document.querySelectorAll(".btnModal");
  // btnModal.forEach((btn) => {
  //   btn.addEventListener("click", (e) => {
  //     let id = e.target.dataset.id;
  //     if (pedidosData.some(pedido => pedido._id === id)) {
  //       modalPedido2(id, pedidosData);
  //     }
  //   });
  // });
  pedidosDiv.innerHTML = ``
  obterPedidos()
});

function SomNovoPedido() {
  const audio = new Audio("/sons/novoPedido.mp3");
  audio.play();
}

const loja = document.getElementById("loja").textContent;
obterPedidos();

async function obterPedidos() {
  try {
    // Obtém os pedidos da API
    const pedidos = await apiPedidos();
    pedidosData = pedidos.pedidos;

    console.log(pedidosData);

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
  } catch (error) {
    console.error("Erro ao obter pedidos:", error);
  }
}
