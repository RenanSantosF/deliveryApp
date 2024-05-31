let iconChange = document.getElementById("iconChange");
let inputChange = document.getElementById("senha");

iconChange.addEventListener("click", () => {
  if (iconChange.src.match("/visualizarIcon.svg")) {
    iconChange.src = "../img/esconderIcon.svg";
    alterarTipoInput("text");
  } else {
    iconChange.src = "../img/visualizarIcon.svg";
    iconChange.setAttribute("type", "password");
    alterarTipoInput("password");
  }
});

function alterarTipoInput(value) {
  const input = document.getElementById("senha");
  let novoInput = document.createElement("input");
  novoInput.setAttribute("type", value);
  novoInput.setAttribute("id", "senha");
  novoInput.value = input.value;
  novoInput.placeholder = "Senha";
  novoInput.name = "senha";
  input.parentNode.replaceChild(novoInput, input);
}

const inputEmail = document.getElementById("email");
inputEmail.addEventListener("input", () => {
  retornaBordaOriginal(inputEmail);
});
const inputSenha = document.getElementById("senha");
inputSenha.addEventListener("input", () => {
  retornaBordaOriginal(inputSenha);
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
}



const btnLogar = document.getElementById("logar");

btnLogar.addEventListener("click", (e) => {
  let erros = [];
  verificaVazio(inputEmail, erros);
  verificaVazio(inputSenha, erros);
  if (erros.length >= 1) {
    e.preventDefault();
  }
  erros = [];
});
