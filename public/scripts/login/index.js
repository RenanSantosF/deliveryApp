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
  input.parentNode.replaceChild(novoInput, input);
}
