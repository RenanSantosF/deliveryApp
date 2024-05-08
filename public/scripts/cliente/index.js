const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressWarn = document.getElementById("address-warn");
// const btnEntrega = document.getElementById("btnEntrega");
const containerEntrega = document.getElementById("containerEntrega");
// const imgEntrega = document.getElementById("imgEntrega");

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
    const offset = target.offsetTop + 15;

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

function fechaModalCarrinho() {
  cartModal.classList.remove("modalActive");
  cartModal.classList.add("modalDisable");
  setTimeout(() => {
    cartModal.classList.remove("modalDisable");
  }, 300);
}

// Fechar modal
cartModal.addEventListener("click", (ev) => {
  if (ev.target === cartModal) {
    fechaModalCarrinho()
  }
});

closeModalBtn.addEventListener("click", () => {
  fechaModalCarrinho()
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

    total +=
    item.valorTotalAdicional * item.quantityProduto +
    item.price * item.quantityProduto;
    let valor = item.valorTotalAdicional * item.quantityProduto +
    item.price * item.quantityProduto;

    cartItemElement.innerHTML = `
    <div class="itemCarrinho">
      <div class="atributosItemCarrinho">
        <p class="spanItemName">${item.name}</p>
        <ul id="listAdicionais">
        ${item.quantidadeNomeAdicionais.map(adicional => `<li><p>${adicional.quantidade}</p>${adicional.nome} - ${adicional.valor}</li>`).join('')}
      </ul>
        <p class="spanItemPrice">${valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}</p>
      </div>

      <div id="quantidade">
        <button data-name="${
          item.name
        }" class="remove-from-cart-btn btnSomaSubtrai">-</button>
        <span id="quantidadeTotalProduto">${item.quantityProduto}</span>
        <button data-name="${
          item.name
        }" class="add-from-cart-btn btnSomaSubtrai">+</button>
      </div>

    </div>

    `;



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
      fechaModalCarrinho()
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

// addressInput.addEventListener("input", (ev) => {
//   let inputValue = ev.target.value;

//   if (inputValue !== "") {
//     addressWarn.classList.remove("activeSpanAlert");
//     addressInput.classList.remove("ActiveAddress");
//   }
// });

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

// btnEntrega.addEventListener("click", (ev) => {
//   ev.preventDefault();
//   btnEntrega.style.display = "none";
//   containerEntrega.style.display = "grid";
//   imgEntrega.style.display = "none";
//   checkoutBtn.style.display = "flex";
// });

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

        valorSpan.textContent = `${Number(objeto.valorAdicional).toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          }
        )}`;
        valorSpan.classList.add("priceAdicional");
        const quantidadeSpan = document.createElement("span");
        quantidadeSpan.textContent = objeto.quantidade;
        quantidadeSpan.style.display = "none";

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "-";
        btnRemover.type = "button";
        btnRemover.style.display = "none";
        btnRemover.addEventListener("click", () => {
          if (objeto.quantidade === 1) {
            quantidadeSpan.style.display = "none";
            btnRemover.style.display = "none";
          }

          if (objeto.quantidade > 0) {
            objeto.quantidade--;
            btnAdicionar.style.background = "var(--cor-btnAdicional)";
            btnAdicionar.style.color = "#fff";
            btnAdicionar.style.border = "1px solid #e7e7e7";

            quantidadeSpan.textContent = objeto.quantidade;
            atualizarQuantidade(objeto, categoria, objeto.quantidade);
            atualizarValorTotal();
            subtraiValorAdicional(objeto)
          }
        });

        const divAlteraQuantidade = document.createElement("div");
        const divConteudo = document.createElement("div");
        divConteudo.classList.add("listAdicional");

        const btnAdicionar = document.createElement("button");
        btnAdicionar.textContent = "+";
        btnAdicionar.type = "button";
        btnAdicionar.addEventListener("click", () => {
          if (objeto.quantidade < 1) {
            quantidadeSpan.style.display = "flex";
            btnRemover.style.display = "flex";
          }
          if (objeto.quantidade < 10) {
            objeto.quantidade++;
            quantidadeSpan.textContent = objeto.quantidade;
            atualizarQuantidade(objeto, categoria, objeto.quantidade);
            atualizarValorTotal();
            aumentaValorAdicional(objeto);
          }
          if (objeto.quantidade === 10) {
            btnAdicionar.style.background = "transparent";
            btnAdicionar.style.color = "transparent";
            btnAdicionar.style.border = "1px solid transparent";
          }
        });

        divConteudo.append(textSpan, valorSpan);
        divAlteraQuantidade.append(btnRemover, quantidadeSpan, btnAdicionar);
        listItem.append(divConteudo, divAlteraQuantidade);

        divCategoria.appendChild(listItem);
      });
      container.appendChild(divCategoria);
    }

    function atualizarQuantidade(objeto, categoria, novaQuantidade) {
      produtoModal.listaAdicionais[categoria].find(
        (item) => item === objeto
      ).quantidade = novaQuantidade;
    }

    function aumentaValorAdicional(objeto) {
      // Verifica se o nome do adicional já está na lista
      const adicionalExistente = produtoModal.quantidadeNomeAdicionais.find(
        (adicional) => adicional.nome === objeto.nomeAdicional
      );
      if (adicionalExistente) {
        // Se o adicional já existe na lista, atualiza a quantidade
        adicionalExistente.quantidade += 1;
      } else {
        // Caso contrário, adiciona um novo objeto à lista
        produtoModal.quantidadeNomeAdicionais.push({
          quantidade: objeto.quantidade,
          nome: objeto.nomeAdicional,
          valor: parseFloat(objeto.valorAdicional).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        });
      }
      console.log(produtoModal);
    }

    function subtraiValorAdicional(objeto) {
      // Verifica se o nome do adicional já está na lista
      const adicionalExistente = produtoModal.quantidadeNomeAdicionais.find(
        (adicional) => adicional.nome === objeto.nomeAdicional
      );
      if (adicionalExistente) {
        // Se o adicional já existe na lista, atualiza a quantidade
        adicionalExistente.quantidade -= 1;
      } else {
        // Caso contrário, adiciona um novo objeto à lista
        produtoModal.quantidadeNomeAdicionais.push({
          quantidade: objeto.quantidade,
          nome: objeto.nomeAdicional,
          valor: parseFloat(objeto.valorAdicional).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        });
      }
      console.log(produtoModal);
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
  }, 50);
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
  addToCartCorreto();
  fechaModalProduto();
  carrinhoVazio();
});

function addToCartCorreto() {
  const existingItem = cart.find((item) => {
      // Verifica se o nome principal é igual
      if (item.name !== produtoModal.name) {
          return false;
      }

      // Verifica se os arrays quantidadeNomeAdicionais têm o mesmo comprimento
      if (item.quantidadeNomeAdicionais.length !== produtoModal.quantidadeNomeAdicionais.length) {
          return false;
      }

      // Verifica cada objeto dentro dos arrays quantidadeNomeAdicionais
      for (let i = 0; i < item.quantidadeNomeAdicionais.length; i++) {
          const existingAdicional = item.quantidadeNomeAdicionais[i];
          const newAdicional = produtoModal.quantidadeNomeAdicionais[i];
          
          // Verifica se o nome e a quantidade são iguais para cada adicional
          if (existingAdicional.nome !== newAdicional.nome || existingAdicional.quantidade !== newAdicional.quantidade) {
              return false;
          }
      }

      // Se todas as verificações passarem, os itens são iguais
      return true;
  });

  if (existingItem) {
      existingItem.quantityProduto += produtoModal.quantityProduto;
      console.log(cart);
  } else {
      cart.push(produtoModal);
      console.log(cart);
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


// modal carrinho
const addMaisItens = document.getElementById("addMaisItens")
addMaisItens.addEventListener("click", () => {
  fechaModalCarrinho()
})


// modal endereço
const addEndereco = document.getElementById("addEndereco")
const modalEndereco = document.getElementById("modalEndereco")
addEndereco.addEventListener("click", (ev) => {
  ev.preventDefault()
  modalEndereco.classList.add("modalEnderecoActive")
})




function fechaModalEndereco() {
  const modalEndereco = document.getElementById("modalEndereco")
  
  modalEndereco.classList.remove("modalEnderecoActive");
  modalEndereco.classList.add("modalEnderecoDisable");
  setTimeout(() => {
    modalEndereco.classList.remove("modalEnderecoDisable");
  }, 300);
}

const closeModalEnderecoBtn = document.getElementById("close-modalEndereco-btn")
closeModalEnderecoBtn.addEventListener("click", () => {
  fechaModalEndereco()
});