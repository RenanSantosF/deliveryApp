// Função para exibir detalhes do pedido em um modal
const modalDetalhes = document.getElementById("modalContent");
const modalContainer = document.getElementById("modalDetalhes");

export function modalPedido(dataPedido, pedidos) {
  // Encontra o pedido específico
  let pedido = pedidos.find((pedido) => pedido._id === dataPedido);

  // Limpa o conteúdo anterior do modal
  modalDetalhes.innerHTML = "";

  // Função para criar e adicionar um elemento
  const addElement = (parent, tag, content, classList, href) => {
    const element = document.createElement(tag);
    element.classList.add(`${classList}`);
    element.textContent = content;
    element.href = href;
    element.target = "_blank";
    parent.appendChild(element);
  };

  const codigoData = document.createElement("div");
  codigoData.classList.add("codigoData");
  addElement(codigoData, "p", `PEDIDO # ${pedido._id}`);
  addElement(codigoData, "p", `${pedido.data}`);
  modalDetalhes.appendChild(codigoData);
  addElement(modalDetalhes, "p", `${pedido.nome}`, "texto2");
  addElement(modalDetalhes, "p", `${pedido.telefone}`, "texto2");
  addElement(modalDetalhes, "p", `${pedido.entrega ? "Entrega" : "Retirada na loja"}`, "texto2");
  if (pedido.entrega) {
    addElement(modalDetalhes, "p", `${pedido.rua}, ${pedido.numero} - ${pedido.bairro}, ${pedido.cidade} - ${pedido.uf}`, "texto2");
    addElement(modalDetalhes, "p", `Ponto de referência: ${pedido.referencia}`, "texto2");
  }
  // Adicionando dados do usuário

  addElement(modalDetalhes, "a", `Enviar mensagem`, "link", `https://wa.me://${pedido.telefone}`);

  addElement(modalDetalhes, "p", "PRODUTOS", "separador");
  // Adicionando itens do carrinho
  pedido.cart.forEach((item) => {
    addElement(modalDetalhes, "h3", `${item.quantityProduto}x - ${item.name}`);
    // addElement(modalDetalhes, "p", `Qnt: ${item.quantityProduto}`);

    modalContainer.classList.add("active");

    // Adicionais mapeados
    const adicionaisMapDiv = document.createElement("div");

    for (const [key, value] of Object.entries(item.listaAdicionais)) {
      // Filtra os adicionais que têm quantidade maior ou igual a 1
      const adicionaisValidos = value.filter((adicional) => adicional.quantidade >= 1);

      // Só cria a div da categoria se houver adicionais válidos
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

  // Totais
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
}

// Adicionando eventListener ao botão de fechar após a criação do botão
const closeButton = document.getElementById("close-modalDetalhesProduto-btn");
closeButton.addEventListener("click", () => {
  removeModal();
});

function removeModal() {
  modalContainer.classList.remove("active");
  modalContainer.classList.add("disable");
  setTimeout(() => {
    modalContainer.classList.remove("disable");
  }, 300);
}
