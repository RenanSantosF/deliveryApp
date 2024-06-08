import showMenu from "../mostraMenu.js";
showMenu("nav-toggle", "nav-menu");

document.addEventListener("DOMContentLoaded", function () {
  const openModalElements = document.querySelectorAll(".openModal");

  openModalElements.forEach((openModalElement) => {
    const img = openModalElement.querySelector(".abre");
    const modal = openModalElement.nextElementSibling;

    img.addEventListener("click", (event) => {
      if (modal) {
        const rect = img.getBoundingClientRect();
        const offsetTop = -10;
        const offsetLeft = -120;
        modal.style.top = `${rect.top + window.scrollY + offsetTop}px`;
        modal.style.left = `${rect.right + window.scrollX + offsetLeft}px`; // Ajuste de deslocamento à direita
        modal.classList.toggle("active");
      }
    });

    document.addEventListener("click", (event) => {
      if (!img.contains(event.target) && !modal.contains(event.target)) {
        modal.classList.remove("active");
      }
    });
  });
});




