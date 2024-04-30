// const btnEnviar = document.getElementById("btnEnviar");

// btnEnviar.addEventListener("click", enviarDados);

// function enviarDados() {
//   // Captura o arquivo da imagem do input
//   const imgProduto = document.getElementsByName("imgProduto").files[0];

//   // Captura os checkboxes marcados
//   var checkboxes = document.getElementsByName("adicionais");
//   var adicionaisSelecionados = [];

//   // Itera sobre os checkboxes para identificar os marcados
//   checkboxes.forEach(function (checkbox) {
//     if (checkbox.checked) {
//       adicionaisSelecionados.push({
//         nome: checkbox.value,
//         preco: "teste",
//       });
//     }
//   });

//   console.log(adicionaisSelecionados)

//   // Cria um objeto FormData e adiciona os dados do formulário
//   var formData = new FormData();
//   formData.append("imgProduto", imgProduto);
//   formData.append("titulo", document.getElementsByName("titulo").value);
//   formData.append("nomeLoja", "nomeLojaValue");
//   formData.append("slug", document.getElementsByName("slug").value);
//   formData.append("descricao", document.getElementsByName("descricao").value);
//   formData.append("preco", document.getElementsByName("preco").value);
//   formData.append("categoria", document.getElementsByName("categoria").value);
//   formData.append("adicionais", JSON.stringify(adicionaisSelecionados));

//   // Envia os dados para o backend

//   setTimeout(() => {
//     fetch(`/${nomeLoja}/admin/produtos/nova`, {
//       method: "POST",
//       body: formData,
//     })
//       .then(function (response) {
//         // Trata a resposta do servidor, se necessário
//         console.log(response);
//       })
//       .catch(function (error) {
//         // Trata erros de requisição, se necessário
//         console.error(error);
//       });
//   }, 5000)

// }

