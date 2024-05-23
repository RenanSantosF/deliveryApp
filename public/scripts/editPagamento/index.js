const nome = document.getElementById("nome");
const btnEnviar = document.getElementById("btnEnviar");

nome.addEventListener("input", () => {
  retornaBordaOriginal(nome);
});

btnEnviar.addEventListener("click", (e) => {
  let erros = [];
  console.log("renan");
  verificaVazio(nome, erros);
  if (erros.length >= 1) {
    e.preventDefault();
    erros = [];
  }
});

function verificaVazio(input, arr) {
  if (input.value === "") {
    input.style.border = "2px solid var(--cor-alerta)";
    arr.push({ Erro: "Erro" });
  }
}

export function retornaBordaOriginal(input) {
  if (input.value !== "") {
    input.style.border = "1px solid #dddfe2";
  }
  console.log(input);
}
