function slugify(ev) {
  let text = ev.target.value
  // Retira acentos
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Remove caracteres que não são letras, números, espaços ou hífens.
  text = text.replace(/[^\w\s-]/g, '');
  // Transforma espaço em hífen e 2 ou mais hífens em um único.
  text = text.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  // Converte para minúsculas
  text = text.toLowerCase();
  ev.target.value =  text;
}

export default slugify