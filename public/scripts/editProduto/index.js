import showMenu from "../mostraMenu.js";
showMenu("nav-toggle", "nav-menu");

function exibirImagem() {
  const inputImagem = document.getElementById("file");
  if (inputImagem.files && inputImagem.files[0]) {
    const url = URL.createObjectURL(inputImagem.files[0]);
    const imagemSelecionada = document.getElementById("imagemSelecionada");
    imagemSelecionada.src = url;
    imagemSelecionada.style.display = "block";
    const span = document.getElementById("span");
    const svg = document.getElementById("svg");
    span.style.display = "none";
    svg.style.display = "none";
  }
}

document.getElementById("file").addEventListener("change", () => {
  exibirImagem();
});

const input = document.getElementById("inputValue");
const titulo = document.getElementById("titulo");
const btnEnviar = document.getElementById("btnEnviar");
const select = document.getElementById("select");

input.addEventListener("input", () => {
  formatarValor(input);
  retornaBordaOriginal(input);
});
input.addEventListener("blur", () => {
  formatarValorBlur(input);
});

titulo.addEventListener("input", () => {
  retornaBordaOriginal(input);
});

select.addEventListener("change", () => {
  retornaBordaOriginal(select);
});

btnEnviar.addEventListener("click", (e) => {
  let erros = [];

  verificaVazio(titulo, erros);
  verificaVazio(input, erros);
  verificarCamposVazios(erros);
  verificarCamposVazios(erros);
  verificaSelect(erros);
  removerClasseEmptyAoDigitar();
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

function verificaSelect(arr) {
  const selectedOption = select.options[select.selectedIndex];
  if (selectedOption.value === "") {
    select.style.border = "2px solid var(--cor-alerta)";
    arr.push({ Erro: "Erro" });
  }
}

export function retornaBordaOriginal(input) {
  if (input.value !== "") {
    input.style.border = "1px solid #dddfe2";
  }
}

function formatarValor(input) {
  input.value = input.value.replace(/[^\d,]/g, "");

  input.value = input.value = input.value.replace(/^0+(?=\d)/, "");

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
    input.value = input.value.replace(/(\d+)(?:,(\d*))?/, function (match, p1, p2) {
      if (p2 === undefined) p2 = "";
      while (p2.length < 2) p2 += "0";
      return p1 + "," + p2;
    });
  } else {
    if (partes[1].length === 0) {
      input.value += "00";
    } else if (partes[1].length === 1) {
      input.value += "0";
    }
  }
}

document.querySelectorAll(".containerMinMax").forEach(function (container) {
  var minInput = container.querySelector(".minInput");
  var maxInput = container.querySelector(".maxInput");

  minInput.addEventListener("input", function () {
    if (parseInt(minInput.value) < 0) {
      minInput.value = 0;
    } else if (parseInt(minInput.value) > parseInt(maxInput.value)) {
      minInput.value = maxInput.value;
    }
  });

  maxInput.addEventListener("input", function () {
    if (parseInt(maxInput.value) < parseInt(minInput.value)) {
      maxInput.value = minInput.value;
    }
  });

  container.querySelector(".decrementaMinimo").addEventListener("click", function () {
    if (parseInt(minInput.value) > 0) {
      minInput.value = parseInt(minInput.value) - 1;
    }
  });

  container.querySelector(".incrementaMinimo").addEventListener("click", function () {
    if (parseInt(minInput.value) < parseInt(maxInput.value)) {
      minInput.value = parseInt(minInput.value) + 1;
    }
  });

  container.querySelector(".decrementaMaximo").addEventListener("click", function () {
    if (parseInt(maxInput.value) > parseInt(minInput.value)) {
      maxInput.value = parseInt(maxInput.value) - 1;
    }
  });

  container.querySelector(".incrementaMaximo").addEventListener("click", function () {
    maxInput.value = parseInt(maxInput.value) + 1;
  });
});

function verificarCamposVazios(erros) {
  document.querySelectorAll(".containerMinMax").forEach(function (container) {
    var minInput = container.querySelector(".minInput");
    var maxInput = container.querySelector(".maxInput");

    if (minInput.value.trim() === "") {
      minInput.classList.add("empty");
      erros.push("O campo mínimo está vazio.");
    }

    if (maxInput.value.trim() === "") {
      maxInput.classList.add("empty");
      erros.push("O campo máximo está vazio.");
    }
  });
}

function removerClasseEmptyAoDigitar() {
  document.querySelectorAll(".containerMinMax").forEach(function (container) {
    var minInput = container.querySelector(".minInput");
    var maxInput = container.querySelector(".maxInput");

    minInput.addEventListener("input", function () {
      if (minInput.value.trim() !== "") {
        minInput.classList.remove("empty");
      }
    });

    maxInput.addEventListener("input", function () {
      if (maxInput.value.trim() !== "") {
        maxInput.classList.remove("empty");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const idProduto = document.getElementById("idProduto").value;
  const nomeLoja = document.getElementById("nomeLoja").value;
  // Primeiro, buscamos o produto
  fetch(`/${nomeLoja}/admin/api/produto/${idProduto}`)
    .then((response) => response.json())
    .then((produto) => {
      preencherCamposAdicionais(produto);
      preencherSelectCategoria(produto.categoria); // Passa a categoria do produto
      habilitaBtnEditar()
    })
    .catch((error) => {
      console.error("Erro ao buscar o produto:", error);
    });

  function preencherCamposAdicionais(produto) {
    produto.adicionais.forEach((adicional) => {
      const minInput = document.getElementById(`minAdicionais-${adicional.categoriaAdicional}`);
      const maxInput = document.getElementById(`maxAdicionais-${adicional.categoriaAdicional}`);
      const checkbox = document.querySelector(`input[type="checkbox"][value="${adicional.adicionais}"][data-categoria="${adicional.categoriaAdicional}"]`);

      if (minInput) {
        minInput.value = adicional.minAdicionais;
      }

      if (maxInput) {
        maxInput.value = adicional.maxAdicionais;
      }

      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  function preencherSelectCategoria(categoriaProduto) {
    const selectCategoria = document.getElementById("select");
    const options = selectCategoria.options;

    for (let i = 0; i < options.length; i++) {
      if (options[i].value === categoriaProduto) {
        options[i].selected = true;
        break;
      }
    }
  }
});

function habilitaBtnEditar() {
  btnEnviar.disabled = false;
}

document.getElementById('produtoForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nomeLoja = document.getElementById("nomeLoja").value;
  const formData = new FormData(this);
  const fileInput = document.getElementById('file');

  // Adiciona o arquivo de imagem ao FormData
  if (fileInput.files[0]) {
    formData.append('imgProduto', fileInput.files[0]);
  }

  const adicionais = [];
  const adicionaisCategorias = [...document.querySelectorAll('[name^="adicionais-"]')].reduce((acc, input) => {
    const category = input.name.split('-')[1];
    if (!acc[category]) {
      acc[category] = [];
    }
    if (input.checked) {
      acc[category].push({
        adicionais: input.value,
        precoAdicional: input.getAttribute('data-preco'),
        categoriaAdicional: input.getAttribute('data-categoria')
      });
    }
    return acc;
  }, {});

  Object.keys(adicionaisCategorias).forEach(category => {
    adicionaisCategorias[category].forEach((adicional) => {
      adicional.minAdicionais = formData.get(`minAdicionais-${category}`);
      adicional.maxAdicionais = formData.get(`maxAdicionais-${category}`);
      adicional.produtoReferido = formData.get('titulo');
    });
    adicionais.push(...adicionaisCategorias[category]);
  });

  formData.append('adicionais', JSON.stringify(adicionais));

  const response = await fetch(`/${nomeLoja}/admin/produto/edit`, {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    window.location.href = `/${nomeLoja}/admin/produtos`;
  } else {
    alert('Houve um erro na edição do produto!');
  }
});



