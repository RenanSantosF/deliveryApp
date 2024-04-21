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

// Abrir o modal do carrinho
cartBtn.addEventListener("click", () => {
  cartModal.style.display = "flex";
  updateCartModal();
});

// Fechar modal
cartModal.addEventListener("click", (ev) => {
  if (ev.target === cartModal) {
    cartModal.style.display = "none";
  }
});

closeModalBtn.addEventListener("click", () => {
  cartModal.style.display = "none";
});

menu.addEventListener("click", (ev) => {
  let parentButton = ev.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

//Função para adicionar no carrinho
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal();
}

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
        <p>Qtd: ${item.quantity}</p>
        <p class="spanItemPrice">R$ ${item.price.toFixed(2)}</p>
      </div>

      <button class="remove-from-cart-btn" data-name="${item.name}">
        Remover
      </button>

    </div>

    `;

    total += item.price * item.quantity;

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
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);

  if (index !== -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
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

  console.log(endereco);

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
      console.log(enderecoInput);
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
