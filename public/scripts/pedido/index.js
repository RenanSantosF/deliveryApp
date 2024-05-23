import { apiPedidos } from "./pedidosApi.js";
import { criarDivPedido } from "./eachPedido.js";
import { modalPedido } from "./modalPedido.js";

const loja = document.getElementById("loja").textContent;
obterPedidos();

async function obterPedidos() {
  try {
    // Obtém os pedidos da API
    const pedidos = await apiPedidos();
    let pedidosData = pedidos.pedidos;

    console.log(pedidosData);
    const pedidosDiv = document.getElementById("pedidos");
    pedidosData.forEach((pedido) => {
      pedidosDiv.innerHTML += criarDivPedido(pedido);
      const btnModal = document.querySelectorAll(".btnModal");
      btnModal.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          let id = e.target.dataset.id;
          modalPedido(id, pedidosData);
          console.log("renan");
        });
      });
    });
  } catch (error) {
    console.error("Erro ao obter pedidos:", error);
  }
}
