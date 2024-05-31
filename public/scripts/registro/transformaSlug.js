function slugify(ev) {
  let text = ev.target.value
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  text = text.replace(/[^\w\s-]/g, '');
  text = text.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  text = text.toLowerCase();
  ev.target.value =  text;
}

export default slugify