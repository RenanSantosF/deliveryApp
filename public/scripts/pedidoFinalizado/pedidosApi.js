
export function apiPedidos() {
  const loja = document.getElementById("loja").textContent;
  return fetch(`/${loja}/admin/pedidosFinalizadosAPI`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao fazer requisição");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return {erro: error}
    });
}