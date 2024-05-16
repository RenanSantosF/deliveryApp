// Função para exibir detalhes do pedido em um modal
export function modalPedido(dataPedido, pedidos) {
  let pedido = pedidos.find((pedido) => pedido._id === dataPedido);

  console.log(pedido);
}
