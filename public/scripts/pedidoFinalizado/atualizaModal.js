import removeModal from "./modalPedido.js";

export default function atualizaModal() {
  const btnModalAtualiza = document.getElementById("btnModalAtualiza");

  if (btnModalAtualiza.textContent === "Marcar como pronto") {
    btnModalAtualiza.style.backgroundColor = "var(--cor-pedidoPronto)";
  }
  if (btnModalAtualiza.textContent === "Despachar para entrega") {
    btnModalAtualiza.style.backgroundColor = "var(--cor-DespacharPedido)";
  }
  if (btnModalAtualiza.textContent === "Pedido concluído") {
    removeModal()
  }
}
