// Importações
import { formataNumeroTelefone, verificaVazio, verificarSelectVazio, retornaBordaOriginal, formataCEP } from "./validacao.js";
import { enviaPedido } from "./enviaPedido.js";

const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressWarn = document.getElementById("address-warn");
const containerEntrega = document.getElementById("containerEntrega");
const nomeLoja = document.getElementById("nomeLoja");
const containerModalTroco = document.getElementById("modalTroco");
const FinalizaTroco = document.getElementById("FinalizaTroco");
const enderecoInputs = document.querySelectorAll("#containerEntrega input");
const valorSubtotal = document.getElementById("valorSubtotal");
const observacao = document.getElementById("observacao");

const totalPedidoValor = document.getElementById("totalPedidoValor");
const valorEntrega = document.getElementById("valorEntrega");
const inputTroco = document.getElementById("inputValorTroco");

const cep = document.getElementById("cep");
const rua = document.getElementById("rua");
const numero = document.getElementById("numero");
const meuSelect = document.getElementById("bairro");
const complemento = document.getElementById("complemento");
const pontoReferencia = document.getElementById("pontoReferencia");
const cidade = document.getElementById("cidade");
const uf = document.getElementById("uf");
const inputNome = document.getElementById("inputNome");

const inputTelefone = document.getElementById("inputTelefone");

let cart = [];

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll('a[href^="#"]').forEach((item) => {
      item.classList.remove("activeNav");
    });

    const nav = document.querySelector("nav");

    const linkPosition = this.getBoundingClientRect().left - nav.getBoundingClientRect().left;

    nav.scrollBy({
      left: linkPosition,
      behavior: "smooth",
    });

    const target = document.querySelector(this.getAttribute("href"));

    this.classList.add("activeNav");
    const offset = target.offsetTop + 15;

    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  });
});

cartBtn.addEventListener("click", () => {
  cartModal.classList.add("modalActive");
  updateCartModal();
});

function fechaModalCarrinho() {
  cartModal.classList.remove("modalActive");
  cartModal.classList.add("modalDisable");
  setTimeout(() => {
    cartModal.classList.remove("modalDisable");
  }, 300);
}

cartModal.addEventListener("click", (ev) => {
  if (ev.target === cartModal) {
    fechaModalCarrinho();
  }
});

closeModalBtn.addEventListener("click", () => {
  fechaModalCarrinho();
});

menu.addEventListener("click", (ev) => {
  let parentButton = ev.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let totalPedido = 0;
  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("containerItemCarrinho");

    totalPedido += item.valorTotalAdicional * item.quantityProduto + item.price * item.quantityProduto;
    let valor = item.valorTotalAdicional * item.quantityProduto + item.price * item.quantityProduto;

    cartItemElement.innerHTML = `
    <div class="itemCarrinho">
      <div class="atributosItemCarrinho">
        <p class="spanItemName">${item.name}</p>
        <ul id="listAdicionais">
        ${item.quantidadeNomeAdicionais
          .map(
            (adicional) =>
              `<li><p>${adicional.quantidade}</p>${adicional.nome} - ${adicional.valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}</li>`
          )
          .join("")}
      </ul>
        <p class="spanItemPrice">${valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}</p>
      </div>

      <div id="quantidade">
        <button data-name="${item.name}" class="remove-from-cart-btn btnSomaSubtrai">-</button>
        <span id="quantidadeTotalProduto">${item.quantityProduto}</span>
        <button data-name="${item.name}" class="add-from-cart-btn btnSomaSubtrai">+</button>
      </div>

    </div>

    `;

    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = totalPedido.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  if (meuSelect.value) {
    let valorTotalPedido = totalPedido + parseFloat(meuSelect.value);
    totalPedidoValor.textContent = valorTotalPedido.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } else {
    totalPedidoValor.textContent = totalPedido.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    valorSubtotal.textContent = totalPedido.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  cartCounter.innerHTML = cart.length;
}

cartItemsContainer.addEventListener("click", (ev) => {
  if (ev.target.classList.contains("remove-from-cart-btn")) {
    const name = ev.target.getAttribute("data-name");

    removeItemCart(name);
  }

  if (ev.target.classList.contains("add-from-cart-btn")) {
    const name = ev.target.getAttribute("data-name");

    addItemCart(name);
    carrinhoVazio();
  }
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);

  if (index !== -1) {
    const item = cart[index];

    if (item.quantityProduto > 1) {
      item.quantityProduto -= 1;
      updateCartModal();
      return;
    }
    if (cart.length === 1) {
      fechaModalCarrinho();
      footer.style.display = "none";
      menu.style.margin = "0 0 15px 0";
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

function addItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);

  if (index !== -1) {
    const item = cart[index];

    if (item.quantityProduto >= 1) {
      item.quantityProduto += 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

const spanItem = document.getElementById("date-span");

function checkRestaurantOpen() {
  if (spanItem.dataset.status === "Aberta") {
    return true;
  } else {
    return false;
  }
}

const isOpen = checkRestaurantOpen();

if (isOpen == true) {
  spanItem.style.backgroundColor = "var(--cor-open)";
} else {
  spanItem.style.backgroundColor = "var(--cor-close)";
}

function defineFundoImg() {
  const img = document.getElementById("headerImgFundo");
  const dataImg = img.dataset.img;
  const cssString = `url("${dataImg}")`;
  img.style.backgroundImage = cssString;
}
defineFundoImg();

function VerificaInputsEntrega() {
  enderecoInputs.forEach((enderecoInput) => {
    if (!enderecoInput.value) {
      addressWarn.classList.add("activeSpanAlert");
      enderecoInput.classList.add("ActiveAddress");
    }
  });
}

enderecoInputs.forEach((enderecoInput) => {
  enderecoInput.addEventListener("input", () => {
    if (enderecoInput.value) {
      addressWarn.classList.remove("activeSpanAlert");
      enderecoInput.classList.remove("ActiveAddress");
    }
  });
});

let produtoModal = {};
let listaAdicionais = {};
let adicional = {};
let total = 0;

menu.addEventListener("click", (ev) => {
  capturaProdutoParaModal(ev);
});

function atualizarValorTotal() {
  total = 0;
  for (const categoria in produtoModal.listaAdicionais) {
    const lista = produtoModal.listaAdicionais[categoria];
    lista.forEach((objeto) => {
      total += objeto.valorAdicional * objeto.quantidade;
      produtoModal.valorTotalAdicional = total;
    });
  }
}

function capturaProdutoParaModal(ev) {
  const adicionaisLista = document.querySelectorAll(".adicionaisLista");
  let parentButton = ev.target.closest(".containerProduto");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    let price = parentButton.getAttribute("data-price");
    const descricao = parentButton.getAttribute("data-descricao");
    const imgProduto = parentButton.getAttribute("data-imgProduto");
    listaAdicionais = {};
    adicionaisLista.forEach((item) => {
      if (item.dataset.produtoreferido == name) {
        adicionarProduto(item.dataset.categoria, {
          nomeAdicional: item.textContent,
          valorAdicional: item.dataset.value.replace(/\,/g, "."),
          quantidade: 0,
          minCategoria: parseFloat(item.dataset.mincategoria),
          maxCategoria: parseFloat(item.dataset.maxcategoria),
        });

        function adicionarProduto(categoria, produto) {
          if (listaAdicionais.hasOwnProperty(categoria)) {
            listaAdicionais[categoria].push(produto);
          } else {
            listaAdicionais[categoria] = [produto];
          }
        }
      }
    });

    price = parseFloat(price.replace(",", "."));

    produtoModal = {
      valorTotalAdicional: 0,
      name: name,
      price: price,
      descricao: descricao,
      imgProduto: imgProduto,
      quantityProduto: 1,
      listaAdicionais: listaAdicionais,
      quantidadeNomeAdicionais: [],
    };

    const container = document.getElementById("adicionalProduto");

    for (const categoria in produtoModal.listaAdicionais) {
      const divCategoria = document.createElement("div");
      divCategoria.className = "categoria";
      divCategoria.innerHTML = "";

      const tituloCategoria = document.createElement("h2");
      tituloCategoria.textContent = categoria;
      divCategoria.appendChild(tituloCategoria);

      const lista = produtoModal.listaAdicionais[categoria];

      lista.forEach((objeto) => {
        const valorSpan = document.createElement("span");
        const textSpan = document.createElement("span");
        const listItem = document.createElement("li");
        textSpan.textContent = `${objeto.nomeAdicional}`;

        if (objeto.valorAdicional !== "0.00") {
          valorSpan.textContent = `${Number(objeto.valorAdicional).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}`;
        }

        valorSpan.classList.add("priceAdicional");
        const quantidadeSpan = document.createElement("span");
        quantidadeSpan.textContent = objeto.quantidade;
        quantidadeSpan.style.display = "none";
        quantidadeSpan.style.alignItems = "center";

        const btnRemover = document.createElement("button");
        btnRemover.innerHTML = `<i class="ri-indeterminate-circle-fill"></i>`;
        btnRemover.type = "button";
        btnRemover.style.display = "none";
        btnRemover.addEventListener("click", () => {
          if (objeto.quantidade === 1) {
            quantidadeSpan.style.display = "none";
            btnRemover.style.display = "none";
          }

          if (objeto.quantidade > 0) {
            objeto.quantidade--;
            quantidadeSpan.textContent = objeto.quantidade;
            atualizarQuantidade(objeto, categoria, objeto.quantidade);
            atualizarValorTotal();
            subtraiValorAdicional(objeto);

            const listaCategoria = produtoModal.listaAdicionais[categoria];
            const somaQuantidades = listaCategoria.reduce((total, item) => total + item.quantidade, 0);
            if (somaQuantidades < objeto.maxCategoria) {
              desabilitarBotoesAdicionar(categoria, false);
            }
          }
        });

        const divAlteraQuantidade = document.createElement("div");
        const divConteudo = document.createElement("div");
        divConteudo.classList.add("listAdicional");

        const btnAdicionar = document.createElement("button");
        btnAdicionar.innerHTML = `<i class="ri-add-circle-fill"></i>`;

        btnAdicionar.type = "button";
        btnAdicionar.addEventListener("click", () => {
          const listaCategoria = produtoModal.listaAdicionais[categoria];
          const somaQuantidades = listaCategoria.reduce((total, item) => total + item.quantidade, 0);

          if (objeto.quantidade < 1) {
            quantidadeSpan.style.display = "flex";
            btnRemover.style.display = "flex";
          }

          if (somaQuantidades < objeto.maxCategoria) {
            objeto.quantidade++;
            quantidadeSpan.textContent = objeto.quantidade;
            atualizarQuantidade(objeto, categoria, objeto.quantidade);
            atualizarValorTotal();
            aumentaValorAdicional(objeto);

            if (somaQuantidades + 1 === objeto.maxCategoria) {
              desabilitarBotoesAdicionar(categoria, true);
            }
          }
        });

        objeto.elementoBtnAdicionar = btnAdicionar;

        divConteudo.append(textSpan, valorSpan);
        divAlteraQuantidade.append(btnRemover, quantidadeSpan, btnAdicionar);
        listItem.append(divConteudo, divAlteraQuantidade);

        divCategoria.appendChild(listItem);
      });
      container.appendChild(divCategoria);
    }

    function atualizarQuantidade(objeto, categoria, novaQuantidade) {
      produtoModal.listaAdicionais[categoria].find((item) => item.nomeAdicional === objeto.nomeAdicional).quantidade = novaQuantidade;
    }

    function aumentaValorAdicional(objeto) {
      const adicionalExistente = produtoModal.quantidadeNomeAdicionais.find((adicional) => adicional.nome === objeto.nomeAdicional);
      if (adicionalExistente) {
        adicionalExistente.quantidade += 1;
      } else {
        produtoModal.quantidadeNomeAdicionais.push({
          quantidade: objeto.quantidade,
          nome: objeto.nomeAdicional,
          valor: parseFloat(objeto.valorAdicional),
        });
      }
    }

    function subtraiValorAdicional(objeto) {
      const adicionalExistenteIndex = produtoModal.quantidadeNomeAdicionais.findIndex((adicional) => adicional.nome === objeto.nomeAdicional);

      if (adicionalExistenteIndex !== -1) {
        const adicionalExistente = produtoModal.quantidadeNomeAdicionais[adicionalExistenteIndex];

        adicionalExistente.quantidade -= 1;

        if (adicionalExistente.quantidade === 0) {
          produtoModal.quantidadeNomeAdicionais.splice(adicionalExistenteIndex, 1);
        }
      } else {
        produtoModal.quantidadeNomeAdicionais.push({
          quantidade: objeto.quantidade,
          nome: objeto.nomeAdicional,
          valor: parseFloat(objeto.valorAdicional).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        });
      }
    }

    function desabilitarBotoesAdicionar(categoria, desabilitar) {
      const listaCategoria = produtoModal.listaAdicionais[categoria];
      listaCategoria.forEach((item) => {
        const btnAdicionar = item.elementoBtnAdicionar;
        if (desabilitar) {
          btnAdicionar.style.opacity = "0";
          btnAdicionar.disabled = true;
        } else {
          btnAdicionar.style.opacity = "1";
          btnAdicionar.disabled = false;
        }
      });
    }

    exibeDadosProduto();
    exibeModalProduto();
  }
}

function exibeModalProduto() {
  document.getElementById("modalProduto").classList.add("modalProdutoActive");
  document.getElementById("modalProduto").classList.remove("modalProdutoDisable");
}

document.getElementById("btnVoltar").addEventListener("click", () => {
  fechaModalProduto();
});

function fechaModalProduto() {
  produtoModal = {};
  const addProdutoBtn = document.getElementById("adicionarProduto");
  addProdutoBtn.disabled = true;
  setTimeout(() => (addProdutoBtn.disabled = false), 300);

  setTimeout(() => {
    document.getElementById("modalProduto").classList.remove("modalProdutoActive");
    document.getElementById("modalProduto").classList.add("modalProdutoDisable");
    setTimeout(function () {
      document.getElementById("modalProduto").classList.remove("modalProdutoDisable");

      observacao.value = "";
      const container = document.getElementById("adicionalProduto");
      container.innerHTML = "";
    }, 300);
  }, 50);
}

function exibeDadosProduto() {
  const nomeProduto = document.getElementById("nomeProduto");
  const descricaoProduto = document.getElementById("descricaoProduto");
  const valorProduto = document.getElementById("valorProduto");
  const imgModalProduto = document.getElementById("imgModalProduto");
  const quantidadeTotalProduto = document.getElementById("quantidadeTotalProduto");

  valorProduto.textContent = produtoModal.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  imgModalProduto.src = `./uploads/${produtoModal.imgProduto}`;
  quantidadeTotalProduto.textContent = produtoModal.quantityProduto;
  nomeProduto.textContent = produtoModal.name;
  descricaoProduto.textContent = produtoModal.descricao;
}

const subtraiItem = document.getElementById("subtraiItem");
const somaItem = document.getElementById("somaItem");
subtraiItem.style.color = "transparent";

somaItem.addEventListener("click", () => {
  produtoModal.quantityProduto += 1;
  subtraiItem.style.color = "#000";
  exibeDadosProduto();
});

subtraiItem.addEventListener("click", () => {
  if (produtoModal.quantityProduto > 1) {
    produtoModal.quantityProduto -= 1;
    exibeDadosProduto();
  }
  if (produtoModal.quantityProduto === 1) {
    subtraiItem.style.color = "transparent";
    exibeDadosProduto();
  }
});

document.getElementById("adicionarProduto").addEventListener("click", () => {
  const sucesso = verificaQuantidadeMinima();
  if (!sucesso) {
    return;
  }
  produtoModal.observacao = observacao.value;

  addToCartCorreto();
  fechaModalProduto();
  carrinhoVazio();
});

function verificaQuantidadeMinima() {
  const totalNecessarioPorCategoria = {};

  for (const categoria in listaAdicionais) {
    const adicionaisCategoria = listaAdicionais[categoria];
    const primeiroAdicional = adicionaisCategoria[0];
    totalNecessarioPorCategoria[categoria] = primeiroAdicional.minCategoria;
  }

  for (const categoria in listaAdicionais) {
    const adicionaisCategoria = listaAdicionais[categoria];
    let quantidadeTotalCategoria = 0;
    for (const adicional of adicionaisCategoria) {
      quantidadeTotalCategoria += adicional.quantidade;
    }
    if (quantidadeTotalCategoria < totalNecessarioPorCategoria[categoria]) {
      Toastify({
        text: `Escolha ao menos ${totalNecessarioPorCategoria[categoria]} item na categoria "${categoria}"`,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(90deg, rgba(255,95,109,1) 0%, rgba(196,91,38,1) 100%)",
          borderRadius: "10px",
        },
      }).showToast();

      return false;
    }
  }

  return true;
}

function addToCartCorreto() {
  const existingItem = cart.find((item) => {
    if (item.name !== produtoModal.name) {
      return false;
    }

    if (item.quantidadeNomeAdicionais.length !== produtoModal.quantidadeNomeAdicionais.length) {
      return false;
    }

    for (let i = 0; i < item.quantidadeNomeAdicionais.length; i++) {
      const existingAdicional = item.quantidadeNomeAdicionais[i];
      const newAdicional = produtoModal.quantidadeNomeAdicionais[i];

      if (existingAdicional.nome !== newAdicional.nome || existingAdicional.quantidade !== newAdicional.quantidade) {
        return false;
      }
    }

    return true;
  });

  if (existingItem) {
    existingItem.quantityProduto += produtoModal.quantityProduto;
  } else {
    cart.push(produtoModal);
  }

  updateCartModal();
}

const footer = document.querySelector("footer");
footer.style.display = "none";
function carrinhoVazio() {
  if (cart.length == 0) {
    footer.style.display = "none";
    menu.style.margin = "0 0 15px 0";
  } else {
    footer.style.display = "flex";
    menu.style.margin = "0 0 45px 0";
  }
}

const addMaisItens = document.getElementById("addMaisItens");
addMaisItens.addEventListener("click", () => {
  fechaModalCarrinho();
});

const addEndereco = document.getElementById("addEndereco");
const modalEndereco = document.getElementById("modalEndereco");
addEndereco.addEventListener("click", (ev) => {
  ev.preventDefault();

  modalEndereco.classList.add("modalEnderecoActive");
});

function fechaModalEndereco() {
  const modalEndereco = document.getElementById("modalEndereco");

  modalEndereco.classList.remove("modalEnderecoActive");
  modalEndereco.classList.add("modalEnderecoDisable");
  setTimeout(() => {
    modalEndereco.classList.remove("modalEnderecoDisable");
  }, 300);
}

const closeModalEnderecoBtn = document.getElementById("close-modalEndereco-btn");
closeModalEnderecoBtn.addEventListener("click", () => {
  fechaModalEndereco();
});

const spanEntrega = document.getElementById("spanEntrega");
const spanRetirada = document.getElementById("spanRetirada");
spanEntrega.addEventListener("click", () => {
  spanEntrega.dataset.entrega = "true";
  verificarSelecaoEntrega();
});
spanRetirada.addEventListener("click", () => {
  spanEntrega.dataset.entrega = "false";
  verificarSelecaoRetirada();
});

const entrega = document.getElementById("inputRadioEntrega");
const containerEntregaEndereco = document.getElementById("containerEntrega");
if (entrega.checked) {
  containerEntrega.classList.add("containerEntregaActive");
}

const containerRetiradaEndereco = document.getElementById("containerRetirada");
const formaPagamento = document.querySelector(".formaPagamento");
let selecionaEntrega = true;
function verificarSelecaoRetirada() {
  const retirar = document.getElementById("inputRadioRetirada");
  if (entrega.checked) {
    entrega.checked = false;
    retirar.checked = true;
    selecionaEntrega = false;
    animationDisplayClose(containerEntregaEndereco, "containerEntregaActive", "containerEntregaDisable");

    containerRetiradaEndereco.classList.add("containerRetiradaActive");
  }

  meuSelect.selectedIndex = 0;

  resetaValorTotal();
}

function resetaValorTotal() {
  let totalPedido = 0;
  cart.forEach((item) => {
    totalPedido += item.valorTotalAdicional * item.quantityProduto + item.price * item.quantityProduto;
  });
  valorEntrega.textContent = parseFloat(0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  totalPedidoValor.textContent = totalPedido.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
function verificarSelecaoEntrega() {
  const retirar = document.getElementById("inputRadioRetirada");
  if (retirar.checked) {
    retirar.checked = false;
    entrega.checked = true;

    animationDisplayClose(containerRetiradaEndereco, "containerRetiradaActive", "containerRetiradaDisable");

    containerEntrega.classList.add("containerEntregaActive");
  }
}

function animationDisplayClose(element, classActive, classDisable) {
  element.classList.remove(`${classActive}`);
  element.classList.add(`${classDisable}`);
  element.classList.remove(`${classDisable}`);
}

valorEntrega.textContent = "R$ 0,00";

meuSelect.addEventListener("change", () => {
  let totalPedido = 0;
  cart.forEach((item) => {
    totalPedido += item.valorTotalAdicional * item.quantityProduto + item.price * item.quantityProduto;
  });
  if (meuSelect.value) {
    valorEntrega.textContent = parseFloat(meuSelect.value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    let valorTotalPedido = totalPedido + parseFloat(meuSelect.value);
    totalPedidoValor.textContent = valorTotalPedido.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } else {
    valorEntrega.textContent = parseFloat(0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    totalPedidoValor.textContent = totalPedido.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
});

const radioGroup = document.querySelector(".radio-group");
const openCloseFormaPagamento = document.getElementById("open-close-FormaPagamento");
openCloseFormaPagamento.addEventListener("click", () => {
  radioGroup.classList.toggle("radio-groupActive");
  const alteraImgFormaPagamento = document.getElementById("alteraImgFormaPagamento");
  alteraImgFormaPagamento.classList.toggle("ri-arrow-down-wide-line");
  alteraImgFormaPagamento.classList.toggle("ri-arrow-up-wide-line");
});

function formaDePagamentoSelecionada() {
  const radios = document.querySelectorAll(".radio-input");
  let selectedRadio = null;
  radios.forEach(function (radio) {
    if (radio.checked) {
      selectedRadio = radio;
    }
  });
  return selectedRadio;
}

const confirmaEndereco = document.getElementById("confirmaEndereco");
confirmaEndereco.addEventListener("click", () => {
  let erros = [];
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "O restaurante está fechado",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(90deg, rgba(255,95,109,1) 0%, rgba(196,91,38,1) 100%)",
        borderRadius: "10px",
      },
    }).showToast();
    return;
  }

  function entrega() {
    if (spanEntrega.dataset.entrega === "true") {
      return "Entrega";
    } else {
      return "Retirada";
    }
  }
  let formaEntrega = entrega();

  if (formaEntrega == "Entrega") {
    verificaVazio(inputTelefone, erros);
    verificaVazio(rua, erros);
    verificaVazio(numero, erros);
    verificaVazio(cidade, erros);
    verificaVazio(uf, erros);
    verificaVazio(inputNome, erros);
    verificarSelectVazio(meuSelect, erros);

    if (erros.length >= 1) {
      Toastify({
        text: "Verifique os campos vazios",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(90deg, rgba(255,112,35,1) 0%, rgba(231,131,16,1) 100%)",
          background: "rgb(255,112,35)",
          borderRadius: "10px",
        },
      }).showToast();
    }

    setTimeout(() => {
      erros = [];
    }, 2000);
  }

  if (formaEntrega == "Retirada") {
    verificaVazio(inputTelefone, erros);
    verificaVazio(inputNome, erros);

    if (erros.length >= 1) {
      Toastify({
        text: "Verifique os campos vazios",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(90deg, rgba(255,112,35,1) 0%, rgba(231,131,16,1) 100%)",
          background: "rgb(255,112,35)",
          borderRadius: "10px",
        },
      }).showToast();
    }

    setTimeout(() => {
      erros = [];
    }, 2000);
  }

  if (erros.length >= 1) {
    return;
  }

  let taxa = meuSelect.value ? parseFloat(meuSelect.value) : 0;
  let subtotal = 0;

  const cartItems = cart
    .map((item) => {
      const produtoString = `*${item.quantityProduto}x ${item.name}*\n*Preço: ${item.price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}*\n`;

      let totalAdicionais = 0;
      const categorizedAddons = {};

      for (const category in item.listaAdicionais) {
        categorizedAddons[category] = [];

        item.listaAdicionais[category].forEach((addon, index) => {
          if (addon.quantidade > 0) {
            const precoAdicional = parseFloat(addon.valorAdicional) * addon.quantidade;
            totalAdicionais += precoAdicional;
            categorizedAddons[category].push(
              `_${addon.quantidade} - ${addon.nomeAdicional}_ (${precoAdicional.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })})`
            );
          }
        });
      }

      const totalLanche = item.price + totalAdicionais;
      subtotal += totalLanche;

      let adicionaisString = "";
      for (const category in categorizedAddons) {
        if (categorizedAddons[category].length > 0) {
          adicionaisString += `*${category.toUpperCase()}*\n${categorizedAddons[category].join("\n")}\n`;
        }
      }

      const observacaoString = item.observacao && item.observacao.trim() !== "" ? `*Observação:*\n${item.observacao}\n` : "";

      return (
        produtoString +
        (adicionaisString ? `*Adicionais:*\n${adicionaisString}\n` : "") +
        observacaoString +
        `*Total do pedido: ${totalLanche.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}*`
      );
    })
    .join("\n\n");

  const total = subtotal + taxa;
  const phone = cartModal.dataset.contact;

  const resumoFinal = `

  *Taxa: ${taxa.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}*
  *Subtotal: ${subtotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}*
  *Total: ${total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}*
`;

  const mensagemFinal = `${cartItems}\n\n${resumoFinal}`;

  const endereco = {
    cep: cep.value,
    numero: numero.value,
    pontoReferencia: pontoReferencia.value,
    rua: rua.value,
    Bairro: meuSelect.options[meuSelect.selectedIndex].text,
    Cidade: cidade.value,
    UF: uf.value,
    contato: inputTelefone.value,
  };

  const nomeDaLoja = document.getElementById("nomeDaLoja");
  const loja = `
    *${nomeDaLoja.textContent}*
  `;

  const enderecoFormatted = `
    *Endereço de entrega:*
    *Número: ${endereco.numero}*
    *Ponto de Referência: ${endereco.pontoReferencia}*
    *Rua: ${endereco.rua}*
    *Bairro: ${endereco.Bairro}*
    *Cidade: ${endereco.Cidade}*
    *UF: ${endereco.UF}*
`;

  let totalPedido = 0;
  cart.forEach((item) => {
    totalPedido += item.valorTotalAdicional * item.quantityProduto + item.price * item.quantityProduto;
  });

  if (formaEntrega == "Entrega") {
    totalPedido += parseFloat(meuSelect.value);
  }

  let selectedRadio = formaDePagamentoSelecionada();
  if (selectedRadio === null) {
    Toastify({
      text: "Defina a forma de pagamento",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(90deg, rgba(255,112,35,1) 0%, rgba(231,131,16,1) 100%)",
        background: "rgb(255,112,35)",
        borderRadius: "10px",
      },
    }).showToast();
    return;
  }

  const dataAtual = new Date();
  const dataFormatada = `${dataAtual.getDate().toString().padStart(2, "0")}/${(dataAtual.getMonth() + 1).toString().padStart(2, "0")}/${dataAtual.getFullYear()}`;
  const horaFormatada = `${dataAtual.getHours().toString().padStart(2, "0")}:${dataAtual.getMinutes().toString().padStart(2, "0")}`;
  const telefoneFormatado = inputTelefone.value.replace(/\D/g, "");

  if (selectedRadio.id === "Dinheiro" || selectedRadio.id === "dinheiro") {
    let erros = [];

    containerModalTroco.classList.add("activeModalTroco");

    FinalizaTroco.addEventListener("click", () => {
      const valorTroco = parseFloat(inputTroco.value.replace(/,/g, "."));

      if (inputRadioTrocoSim.checked) {
        verificaVazio(inputTroco, erros);

        if (parseFloat(valorTroco) <= total) {
          erros.push({ erro: "erro" });
          Toastify({
            text: "O valor do pagamento precisa ser maior que o valor do pedido",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: {
              background: "linear-gradient(90deg, rgba(255,112,35,1) 0%, rgba(231,131,16,1) 100%)",
              background: "rgb(255,112,35)",
              borderRadius: "10px",
            },
          }).showToast();
        }
      }

      if (erros.length === 0) {
        finalizaPedido(valorTroco);

        containerModalTroco.classList.remove("activeModalTroco");
      }
      erros = [];
    });
  } else {
    finalizaPedido();
  }

  function finalizaPedido(troco) {
    const pedido = {
      nomeLoja: nomeLoja.textContent,
      nome: inputNome.value,
      status: "Aceitar pedido",
      telefone: telefoneFormatado,
      taxa: taxa,
      valorTroco: troco ? troco : false,
      subtotal: subtotal,
      valorTotal: totalPedido.toFixed(2),
      pagamento: selectedRadio.id,
      entrega: formaEntrega == "Entrega" ? true : false,
      numero: endereco.numero,
      referencia: endereco.pontoReferencia,
      rua: endereco.rua,
      bairro: meuSelect.options[meuSelect.selectedIndex].text,
      cidade: endereco.Cidade,
      uf: endereco.UF,
      cart: cart,
      data: `${dataFormatada} ${horaFormatada}`,
    };
    let valorTroco = troco ? `troco para R$ ${troco}` : "Não Precisa de troco";
    let precisaTroco = selectedRadio.id === "Dinheiro" || selectedRadio.id === "dinheiro" ? valorTroco : "";
    const pedidoFormatted = `
    *Nome: ${inputNome.value}*
      *Número de Telefone: ${inputTelefone.value}*
      *Valor Total do Pedido: ${totalPedido.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}*
      *Forma de Pagamento: ${selectedRadio.id}*
      ${precisaTroco}
      *Entrega ou Retirada? ${formaEntrega}*
    `;

    let isEntrega = formaEntrega == "Retirada" ? `${pedidoFormatted}` : `${enderecoFormatted}\n\n${pedidoFormatted}`;

    const message = encodeURIComponent(`${loja}\n\n${mensagemFinal}\n\n${isEntrega}`);

    enviaPedido(pedido);
    setTimeout(() => {
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    }, 2000);

    cart = [];
    updateCartModal();
  }
});

inputTelefone.addEventListener("input", (e) => {
  formataNumeroTelefone(e);
});

cep.addEventListener("input", (e) => {
  formataCEP(e);
});

inputTelefone.addEventListener("input", () => retornaBordaOriginal(inputTelefone));
rua.addEventListener("input", () => retornaBordaOriginal(rua));
complemento.addEventListener("input", () => retornaBordaOriginal(complemento));
cep.addEventListener("input", () => retornaBordaOriginal(cep));
numero.addEventListener("input", () => retornaBordaOriginal(numero));
pontoReferencia.addEventListener("input", () => retornaBordaOriginal(pontoReferencia));
cidade.addEventListener("input", () => retornaBordaOriginal(cidade));
uf.addEventListener("input", () => retornaBordaOriginal(uf));
meuSelect.addEventListener("change", () => retornaBordaOriginal(meuSelect));
inputNome.addEventListener("change", () => retornaBordaOriginal(inputNome));

const pedidoConcluido = document.getElementById("pedidoConcluido");
pedidoConcluido.addEventListener("click", () => {
  pedidoConcluido.classList.remove("pedidoConcluidoActive");
  setTimeout(() => {
    window.location.reload();
  }, 2000);
});

const inputRadioTrocoSim = document.getElementById("inputRadioTrocoSim");
const inputRadioTrocoNao = document.getElementById("inputRadioTrocoNao");
const valorTroco = document.getElementById("valorTroco");
const sectionFinaliza = document.querySelector(".sectionFinaliza");

inputRadioTrocoSim.addEventListener("change", modalTroco);
inputRadioTrocoNao.addEventListener("change", modalTroco);

selecionaCheck();
modalTroco();
function selecionaCheck() {
  inputRadioTrocoSim.checked = true;
}
function modalTroco() {
  if (inputRadioTrocoSim.checked) {
    valorTroco.classList.add("display-flex");
    sectionFinaliza.classList.add("display-flex");
  } else {
    valorTroco.classList.remove("display-flex");
    sectionFinaliza.classList.add("display-flex");
    inputTroco.value = "";
  }

  if (inputRadioTrocoNao.checked) {
    valorTroco.classList.remove("display-flex");
  }
}

inputTroco.addEventListener("input", () => {
  formatarValor(inputTroco);
  retornaBordaOriginal(inputTroco);
});
inputTroco.addEventListener("blur", () => {
  formatarValorBlur(inputTroco);
});

inputNome.addEventListener("input", () => {
  retornaBordaOriginal(inputNome);
});

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

cep.addEventListener("input", function () {
  const cep = this.value.replace(/\D/g, "");
  if (cep.length === 8) {
    consultarCEP(cep);
  }
});

function consultarCEP(cep) {
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then((response) => response.json())
    .then((data) => {
      if (data.erro) {
      } else {
        rua.value = data.logradouro;
        cidade.value = data.localidade;
        uf.value = data.uf;
      }
    })
    .catch((error) => {
      console.error("Ocorreu um erro ao consultar o CEP:", error);
    });
}
