// Função para gerar HTML de div com dados básicos do pedido
export function criarDivPedido(pedido) {
  return `
    <div class="card pedido" data-id="${pedido.data}">
      <div>
        <div class="headerPedido titulo">
          <p>PEDIDO # ${pedido.numeroPedido}</p>
          <p class="data">${pedido.data}</p>
        </div>
        <div class="section">
          <p>${pedido.nome}</p>
          <a href="https://wa.me://${pedido.telefone}"><p>Enviar mensagem</p></a>
          <p>${pedido.entrega ? `Entrega - Endereço:${pedido.rua} - Nº${pedido.numero}, ${pedido.bairro}, ${pedido.cidade} - ${pedido.uf}` : "Retirada no local"}</p>
        </div>
        
        <div class="footerPedido">
          <button class="btnModal" data-id="${pedido._id}">Ver Detalhes</button>
          <p>${pedido.valorTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</p>
        </div>
        
      </div>
    </div>
  `;
}


