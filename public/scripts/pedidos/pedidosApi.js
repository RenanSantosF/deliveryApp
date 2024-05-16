
export function apiPedidos() {
  const loja = document.getElementById("loja").textContent;
  // Retornando a promessa gerada pela função fetch
  return fetch(`http://localhost:3000/${loja}/admin/pedidosAPI`)
    .then((response) => {
      // Verificando se a requisição foi bem-sucedida
      if (!response.ok) {
        throw new Error("Erro ao fazer requisição");
      }
      return response.json();
    })
    .then((data) => {
      // Retornando os dados obtidos da resposta
      return data;
    })
    .catch((error) => {
      return {erro: error}
    });
}