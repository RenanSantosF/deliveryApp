export function enviaPedido(pedido) {
  fetch("/pedidos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pedido),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.message === "enviado!") {
        const pedidoConcluido = document.getElementById("pedidoConcluido");
        pedidoConcluido.classList.add("pedidoConcluidoActive");
      }
    })
    .catch((error) => {
      console.error("Erro ao enviar dados:", error);
    });
}
