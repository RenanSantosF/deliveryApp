const valor = document.getElementById("valor");
const nome = document.getElementById("nome");
const btnEnviar = document.getElementById("btnEnviar");
const select = document.getElementById("select");

valor.addEventListener("input", () => {
  formatarValor(valor);
  retornaBordaOriginal(valor);
});
valor.addEventListener("blur", () => {
  formatarValorBlur(valor);
});

nome.addEventListener("input", () => {
  retornaBordaOriginal(nome);
});

select.addEventListener("change", () => {
  retornaBordaOriginal(select);
});

btnEnviar.addEventListener("click", (e) => {
  let erros = [];

  verificaVazio(nome, erros);
  verificaVazio(valor, erros);
  verificaSelect(erros);
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
}



function verificaSelect(arr) {
  const selectedOption = select.options[select.selectedIndex];
  if (selectedOption.value === "") {
    select.style.border = "2px solid var(--cor-alerta)";
    arr.push({ Erro: "Erro" });
  }
}

function formatarValor(input) {
  input.value = input.value.replace(/[^\d,]/g, "");

  input.value = input.value.replace(/^0+/g, "");

  input.value = input.value.replace(/(,.*?),/g, "$1");

  let partes = input.value.split(",");
  if (partes.length > 1) {
    partes[1] = partes[1].slice(0, 2);
    input.value = partes.join(",");
  }
}

function formatarValorBlur(input) {
  let partes = input.value.split(",");
  if (partes.length === 1) {
    // Adiciona a vírgula e completa com duas casas decimais com zeros, se necessário
    input.value = input.value.replace(/(\d+)(?:,(\d*))?/, function (match, p1, p2) {
      if (p2 === undefined) p2 = ""; // Se não houver parte decimal, define como vazio
      while (p2.length < 2) p2 += "0"; // Completa com zeros até ter duas casas decimais
      return p1 + "," + p2;
    });
  } else {
    // Completa com zeros caso haja apenas uma casa decimal
    if (partes[1].length === 1) {
      input.value += "0";
    }
  }
}
