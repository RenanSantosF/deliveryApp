import checkUsernameAvailability from "./consultaDisponibilidadeUrl.js";
import slugify from "./transformaSlug.js";
import { formataNumeroTelefone } from "./formata.js";

let erros = [];

document.getElementById("nomeLoja").addEventListener("input", (ev) => {
  slugify(ev);
  checkUsernameAvailability(erros);
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registration-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const erros = [];

    const fieldNames = ["nome", "email", "senha", "senha2", "nomeDaLoja", "nomeLoja", "telefone", "estado", "cidade", "bairro", "rua", "numero", "pontoReferencia"];

    fieldNames.forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input.value.trim()) {
        erros.push(`O campo ${name} é obrigatório.`);
      }
    });

    const senha = form.querySelector('[name="senha"]').value;
    const senha2 = form.querySelector('[name="senha2"]').value;

    if (senha !== senha2) {
      erros.push("As senhas não conferem.");
    }

    if (senha.length < 4) {
      erros.push("A senha deve ter pelo menos 4 caracteres.");
    }

    if (erros.length > 0) {
      erros.forEach((erro) => {
        setTimeout(() => {
          Toastify({
            text: `${erro}`,
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
        }, 30);
      });
    } else {
      form.submit();
    }
  });
});

const telefone = document.getElementById("telefone");
telefone.addEventListener("input", (e) => {
  formataNumeroTelefone(e);
});
