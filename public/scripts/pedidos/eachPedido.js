// Função para gerar HTML de div com dados básicos do pedido
export function criarDivPedido(pedido) {
  return `
    <div class="pedido" data-id="${pedido.data}">
      <p>Nome: ${pedido.nome}</p>
      <p>Telefone: ${pedido.telefone}</p>
      <p>Valor Total: R$ ${pedido.valorTotal.toFixed(2)}</p>
      <button class="btnModal" data-id="${pedido._id}">Ver Detalhes</button>
    </div>
  `;
}