export function criarDivPedido(pedido) {
  // Verificar se o status do pedido é "Pedido concluído"
  if (pedido.status !== "Pedido concluído") {
    return ''; // Retornar uma string vazia se o pedido estiver concluído
  }

  return `
    <div class="card pedido" data-id="${pedido.data}">
      <div>
        <div class="headerPedido titulo">
          <p>PEDIDO # ${pedido.numeroPedido}</p>
          <p class="data">${pedido.data}</p>
        </div>
        <div class="section">
          <p>${pedido.nome}</p>
          <a href="https://wa.me/${pedido.telefone}"><p>Enviar mensagem</p></a>
          <p>${pedido.entrega ? `Entrega - Endereço:${pedido.rua} - Nº${pedido.numero}, ${pedido.bairro}, ${pedido.cidade} - ${pedido.uf}` : "Retirada no local"}</p>
        </div>
        
        <div class="footerPedido">
        <div>
          <button class="btnModal" data-id="${pedido._id}">Ver Detalhes</button>
          <button class="btnAtualizaStatus" id="${pedido._id}" data-id="${pedido._id}">${pedido.status}</button>
        </div>
          
          <p>${pedido.valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</p>
        </div>
      </div>
    </div>
  `;
}

