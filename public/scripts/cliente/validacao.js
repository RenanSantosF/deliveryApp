export function formataNumeroTelefone(e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.substring(0, 11);

  let formattedValue;
  if (value.length > 6) {
    formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
  } else if (value.length > 2) {
    formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}`;
  } else if (value.length > 0) {
    formattedValue = `(${value}`;
  } else {
    formattedValue = value;
  }
  e.target.value = formattedValue;
}

export function verificaVazio(input, arr) {
  if (input.value.trim() === "") {
    input.style.border = "2px solid var(--cor-alerta)";
    arr.push({ erro: `o campo é vazio` });
  }
}

export function verificarSelectVazio(select, arr) {
  if (select.value === "") {
    select.style.border = "2px solid var(--cor-alerta)";
    arr.push({ erro: `o campo é vazio` });
  }
}

export function retornaBordaOriginal(input) {
  if (input.value !== "") {
    input.style.border = "1px solid #dddfe2";
  }
}

export function formataCEP(e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 8) value = value.substring(0, 8);

  if (value.length > 5) {
    value = value.substring(0, 5) + "-" + value.substring(5);
  }
  e.target.value = value;
}