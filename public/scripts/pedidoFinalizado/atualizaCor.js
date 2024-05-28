export default function atualizaCor() {
  const btnAtualizaStatus = document.querySelectorAll(".btnAtualizaStatus");
  btnAtualizaStatus.forEach((btn) => {
    if (btn.textContent === "Marcar como pronto") {
      btn.style.backgroundColor = "var(--cor-pedidoPronto)";
    }
    if (btn.textContent === "Despachar para entrega") {
      btn.style.backgroundColor = "var(--cor-DespacharPedido)";
    }
  });
}