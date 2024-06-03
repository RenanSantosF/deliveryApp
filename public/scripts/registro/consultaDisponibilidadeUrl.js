const usernameInput = document.getElementById("nomeLoja");
function checkUsernameAvailability(arr) {
  const usernameStatus = document.getElementById("username-status");
  const username = usernameInput.value;

  if (username.length < 1) {
    usernameStatus.textContent = "";
    return;
  }

  fetch(`/usuarios/check-username?username=${username}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.available) {
        usernameStatus.textContent = "Este link está disponível";
        usernameStatus.style.color = "green";
        arr = []
      } else {
        usernameStatus.textContent = "Este link não está disponível";
        usernameStatus.style.color = "red";
        arr.push("URL do cardápio indisponível. Por favor, escolha outra!")
      }
    })
    .catch((err) => {
      console.error("Error checking username availability:", err);
      arr.push({Error: "URL do cardápio indisponível. Por favor, escolha outra!"})
    });
}

export default checkUsernameAvailability;
