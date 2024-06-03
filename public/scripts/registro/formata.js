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