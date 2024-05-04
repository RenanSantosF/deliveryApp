const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressWarn = document.getElementById("address-warn");
const btnEntrega = document.getElementById("btnEntrega");
const containerEntrega = document.getElementById("containerEntrega");
const imgEntrega = document.getElementById("imgEntrega");

const addressInput = document.getElementById("address");
const enderecoInputs = document.querySelectorAll("#containerEntrega input");
const numeroInput = document.getElementById("numero");
const pontoReferenciaInput = document.getElementById("pontoReferencia");
const ruaInput = document.getElementById("rua");
const BairroInput = document.getElementById("Bairro");
const CidadeInput = document.getElementById("Cidade");
const UFInput = document.getElementById("UF");
const contatoInput = document.getElementById("contatoInput");

let cart = [];

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll('a[href^="#"]').forEach((item) => {
      item.classList.remove("activeNav");
    });

    const nav = document.querySelector("nav");

    const linkPosition =
      this.getBoundingClientRect().left - nav.getBoundingClientRect().left;

    // Rola horizontalmente para que o item clicado fique no canto esquerdo da tela
    nav.scrollBy({
      left: linkPosition,
      behavior: "smooth",
    });

    const target = document.querySelector(this.getAttribute("href"));

    this.classList.add("activeNav");
    const offset = target.offsetTop + -15;

    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  });
});

// Abrir o modal do carrinho
cartBtn.addEventListener("click", () => {
  cartModal.classList.add("modalActive");
  updateCartModal();
});

// Fechar modal
cartModal.addEventListener("click", (ev) => {
  if (ev.target === cartModal) {
    cartModal.classList.remove("modalActive");
    cartModal.classList.add("modalDisable");
    setTimeout(() => {
      cartModal.classList.remove("modalDisable");
    }, 300);
  }
});

closeModalBtn.addEventListener("click", () => {
  cartModal.classList.remove("modalActive");
  cartModal.classList.add("modalDisable");
  setTimeout(() => {
    cartModal.classList.remove("modalDisable");
  }, 300);
});

menu.addEventListener("click", (ev) => {
  let parentButton = ev.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

// Atualiza o carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("containerItemCarrinho");

    cartItemElement.innerHTML = `
    <div class="itemCarrinho">
      <div class="atributosItemCarrinho">
        <p class="spanItemName">${item.name}</p>
        <p>Adicionais: ${item.quantityProduto}</p>
        <p class="spanItemPrice">R$ ${item.price.toFixed(2)}</p>
      </div>

      <div id="quantidade">
        <img data-name="${
          item.name
        }" class="remove-from-cart-btn" src="./img/menos.png" />
        <span id="quantidadeTotalProduto">${item.quantityProduto}</span>
        <img data-name="${
          item.name
        }" class="add-from-cart-btn" src="./img/mais.png" />
      </div>

    </div>

    `;

    total +=
      item.valorTotalAdicional * item.quantityProduto +
      item.price * item.quantityProduto;

    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCounter.innerHTML = cart.length;
}

//Função para remover item do carrinho
cartItemsContainer.addEventListener("click", (ev) => {
  if (ev.target.classList.contains("remove-from-cart-btn")) {
    const name = ev.target.getAttribute("data-name");

    removeItemCart(name);
  }

  if (ev.target.classList.contains("add-from-cart-btn")) {
    const name = ev.target.getAttribute("data-name");

    addItemCart(name);
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

addressInput.addEventListener("input", (ev) => {
  let inputValue = ev.target.value;

  if (inputValue !== "") {
    addressWarn.classList.remove("activeSpanAlert");
    addressInput.classList.remove("ActiveAddress");
  }
});

//Finalizar pedido
checkoutBtn.addEventListener("click", () => {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "O restaurante está fechado",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background:
          "linear-gradient(90deg, rgba(255,95,109,1) 0%, rgba(196,91,38,1) 100%)",
      },
    }).showToast();

    return;
  }

  let shouldStop = false;
  if (cart.length === 0) return;

  enderecoInputs.forEach((enderecoInput) => {
    if (!enderecoInput.value) {
      addressWarn.classList.add("activeSpanAlert");
      enderecoInput.classList.add("ActiveAddress");

      shouldStop = true;
      return;
    }
  });
  if (shouldStop) {
    return;
  }

  // Enviar pedido para a api
  const cartItems = cart
    .map((item) => {
      return ` ${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price} |`;
    })
    .join("");

  const message = encodeURIComponent(cartItems);
  const phone = cartModal.dataset.contact;
  const endereco = {
    numero: numeroInput.value,
    pontoReferencia: pontoReferenciaInput.value,
    rua: ruaInput.value,
    Bairro: BairroInput.value,
    Cidade: CidadeInput.value,
    UF: UFInput.value,
    contato: contatoInput.value,
  };

  window.open(
    `https://wa.me/${phone}?text=${message} Endereço: Rua:${endereco.rua}, Nº:${endereco.numero}, Referência:${endereco.pontoReferencia}, Bairro: ${endereco.Bairro}, Cidade: ${endereco.Cidade}, UF: ${endereco.UF}`,
    "_blank"
  );

  cart = [];
  updateCartModal();
});

const spanItem = document.getElementById("date-span");

// Verifica hora e manipula o card horário
function checkRestaurantOpen() {
  if (spanItem.dataset.status === "aberta") {
    return true;
  } else {
    return false;
  }
}

const isOpen = checkRestaurantOpen();

if (isOpen == true) {
  spanItem.style.backgroundColor = "rgb(31, 148, 31)";
} else {
  spanItem.style.backgroundColor = "rgb(206, 28, 28)";
}

function defineFundoImg() {
  const img = document.getElementById("headerImgFundo");
  const dataImg = img.dataset.img;
  const cssString = `url("${dataImg}")`;
  img.style.backgroundImage = cssString;
}
defineFundoImg();

btnEntrega.addEventListener("click", (ev) => {
  ev.preventDefault();
  btnEntrega.style.display = "none";
  containerEntrega.style.display = "grid";
  imgEntrega.style.display = "none";
  checkoutBtn.style.display = "flex";
});

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
    const price = parseFloat(parentButton.getAttribute("data-price"));
    const descricao = parentButton.getAttribute("data-descricao");
    const imgProduto = parentButton.getAttribute("data-imgProduto");
    listaAdicionais = {};
    adicionaisLista.forEach((item) => {
      if (item.dataset.produtoreferido == name) {
        adicionarProduto(item.dataset.categoria, {
          nomeAdicional: item.textContent,
          valorAdicional: item.dataset.value,
          quantidade: 0,
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

    produtoModal = {
      valorTotalAdicional: 0,
      name: name,
      price: price,
      descricao: descricao,
      imgProduto: imgProduto,
      quantityProduto: 1,
      listaAdicionais: listaAdicionais,
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
        const listItem = document.createElement("li");
        listItem.textContent = `${objeto.nomeAdicional}: R$ ${objeto.valorAdicional}`;

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "-";
        btnRemover.type = "button";
        btnRemover.addEventListener("click", () => {
          if (objeto.quantidade > 0) {
            objeto.quantidade--;
            quantidadeSpan.textContent = objeto.quantidade;
            atualizarQuantidade(objeto, categoria, objeto.quantidade);
            atualizarValorTotal();
          }
        });
        listItem.appendChild(btnRemover);

        const quantidadeSpan = document.createElement("span");
        quantidadeSpan.textContent = objeto.quantidade;
        listItem.appendChild(quantidadeSpan);

        const btnAdicionar = document.createElement("button");
        btnAdicionar.textContent = "+";
        btnAdicionar.type = "button";
        btnAdicionar.addEventListener("click", () => {
          if (objeto.quantidade < 10) {
            objeto.quantidade++;
            quantidadeSpan.textContent = objeto.quantidade;
            atualizarQuantidade(objeto, categoria, objeto.quantidade);
            atualizarValorTotal();
          }
        });
        listItem.appendChild(btnAdicionar);

        divCategoria.appendChild(listItem);
      });
      container.appendChild(divCategoria);
    }

    function atualizarQuantidade(objeto, categoria, novaQuantidade) {
      produtoModal.listaAdicionais[categoria].find(
        (item) => item === objeto
      ).quantidade = novaQuantidade;
    }

    exibeDadosProduto();
    exibeModalProduto();
  }
}

function exibeModalProduto() {
  document.getElementById("modalProduto").classList.add("modalProdutoActive");
  document
    .getElementById("modalProduto")
    .classList.remove("modalProdutoDisable");
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
    document
      .getElementById("modalProduto")
      .classList.remove("modalProdutoActive");
    document
      .getElementById("modalProduto")
      .classList.add("modalProdutoDisable");
    setTimeout(function () {
      document
        .getElementById("modalProduto")
        .classList.remove("modalProdutoDisable");

      const container = document.getElementById("adicionalProduto");
      container.innerHTML = "";
    }, 300);
  }, 100);
}

function exibeDadosProduto() {
  const nomeProduto = document.getElementById("nomeProduto");
  const descricaoProduto = document.getElementById("descricaoProduto");
  const valorProduto = document.getElementById("valorProduto");
  const imgModalProduto = document.getElementById("imgModalProduto");
  const quantidadeTotalProduto = document.getElementById(
    "quantidadeTotalProduto"
  );

  valorProduto.textContent = produtoModal.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  imgModalProduto.src = `./uploads/${produtoModal.imgProduto}`;
  quantidadeTotalProduto.textContent = produtoModal.quantityProduto;
  nomeProduto.textContent = produtoModal.name;
  descricaoProduto.textContent = produtoModal.descricao;
}

document.getElementById("somaItem").addEventListener("click", () => {
  produtoModal.quantityProduto += 1;

  exibeDadosProduto();
});

document.getElementById("subtraiItem").addEventListener("click", () => {
  if (produtoModal.quantityProduto > 1) {
    produtoModal.quantityProduto -= 1;

    exibeDadosProduto();
  }
});

document.getElementById("adicionarProduto").addEventListener("click", () => {
  addToCartCorreto();
  fechaModalProduto();
});

function addToCartCorreto() {
  const existingItem = cart.find((item) => item.name === produtoModal.name);

  if (existingItem) {
    existingItem.quantityProduto += produtoModal.quantityProduto;
    console.log(cart);
  } else {
    cart.push(produtoModal);
    console.log(cart);
  }

  updateCartModal();
}
