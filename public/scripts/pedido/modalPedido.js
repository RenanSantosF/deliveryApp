import atualizaModal from "./atualizaModal.js";

const modalDetalhes = document.getElementById("modalContent");
const modalContainer = document.getElementById("modalDetalhes");

export function modalPedido(dataPedido, pedidos, socket, text) {
  let pedido = pedidos.find((pedido) => pedido._id === dataPedido);

  modalDetalhes.innerHTML = "";

  const addElement = (parent, tag, content, classList, href, id, idHTML) => {
    const element = document.createElement(tag);
    element.classList.add(`${classList}`);
    element.textContent = content;
    element.href = href;
    element.dataset.id = id;
    element.id = idHTML;
    element.target = "_blank";
    parent.appendChild(element);
  };

  const codigoData = document.createElement("div");
  codigoData.classList.add("codigoData");
  addElement(codigoData, "p", `PEDIDO # ${pedido.numeroPedido}`);
  addElement(codigoData, "p", `${pedido.data}`);
  modalDetalhes.appendChild(codigoData);
  addElement(modalDetalhes, "p", `${pedido.nome}`, "texto2");
  addElement(modalDetalhes, "p", `${pedido.telefone}`, "texto2");
  addElement(modalDetalhes, "p", `${pedido.entrega ? "Entrega" : "Retirada na loja"}`, "texto2");
  if (pedido.entrega) {
    addElement(modalDetalhes, "p", `${pedido.rua}, ${pedido.numero} - ${pedido.bairro}, ${pedido.cidade} - ${pedido.uf}`, "texto2");
    addElement(modalDetalhes, "p", `Ponto de referência: ${pedido.referencia}`, "texto2");
  }

  addElement(modalDetalhes, "a", `Enviar mensagem`, "link", `https://wa.me://${pedido.telefone}`);

  addElement(modalDetalhes, "p", "PRODUTOS", "separador");
  pedido.cart.forEach((item) => {
    addElement(modalDetalhes, "h3", `${item.quantityProduto}x - ${item.name}`);

    modalContainer.classList.add("active");

    const adicionaisMapDiv = document.createElement("div");

    for (const [key, value] of Object.entries(item.listaAdicionais)) {
      const adicionaisValidos = value.filter((adicional) => adicional.quantidade >= 1);

      if (adicionaisValidos.length > 0) {
        const keyDiv = document.createElement("div");
        keyDiv.classList.add("divAdicionais");
        keyDiv.innerHTML = `<span>${key}</span>`;

        adicionaisValidos.forEach((adicional) => {
          addElement(keyDiv, "p", `${adicional.quantidade}x - ${adicional.nomeAdicional}`);
        });

        adicionaisMapDiv.appendChild(keyDiv);
      }
    }

    modalContainer.classList.add("active");
    modalDetalhes.appendChild(adicionaisMapDiv);
  });

  addElement(modalDetalhes, "p", "TOTAL", "separador");
  const totalDiv = document.createElement("div");
  totalDiv.classList.add("totalDiv");

  addElement(
    totalDiv,
    "p",
    `Taxa ${pedido.taxa.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`,
    "valor"
  );
  addElement(
    totalDiv,
    "p",
    `Subtotal ${pedido.subtotal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`,
    "valor"
  );
  addElement(
    totalDiv,
    "p",
    `Valor Total ${pedido.valorTotal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`,
    "total"
  );
  modalDetalhes.appendChild(totalDiv);
  addElement(modalDetalhes, "p", "Forma de pagamento", "separador");
  addElement(modalDetalhes, "p", `${pedido.pagamento}`, "spanPagamento");
  if (pedido.pagamento === "dinheiro" || pedido.pagamento === "Dinheiro") {
    if (pedido.valorTroco === 0) {
      addElement(modalDetalhes, "p", `Não é necessário troco`, "spanPagamento");
    } else {
      addElement(
        modalDetalhes,
        "p",
        `Troco para ${pedido.valorTroco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}`,
        "spanPagamento"
      );
    }
  }

  const footerDiv = document.createElement("div");
  footerDiv.classList.add("footerModalPedido");
  addElement(footerDiv, "button", `${pedido.status}`, "btnAtualizaStatus", "", pedido._id, "btnModalAtualiza");
  modalDetalhes.appendChild(footerDiv);

  const btnModalAtualiza = document.getElementById("btnModalAtualiza");
  if (btnModalAtualiza) {
    btnModalAtualiza.textContent = text;
    atualizaModal();
    btnModalAtualiza.addEventListener("click", function () {
      socket.emit("atualizaPedido", pedido._id);
      atualizaModal();
    });
  }
}

const closeButton = document.getElementById("close-modalDetalhesProduto-btn");
closeButton.addEventListener("click", () => {
  removeModal();
});

export default function removeModal() {
  modalContainer.classList.remove("active");
  modalContainer.classList.add("disable");
  setTimeout(() => {
    modalContainer.classList.remove("disable");
  }, 300);
}
