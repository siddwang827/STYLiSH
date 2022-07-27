const btnSubmit = document.getElementById("btn-upload");

const getProductID = async () => {
  const response = await fetch("/api/1.0/products/get-productID", {
    method: "get",
  });
  const body = await response.json();
  return body;
};

const createIDOptions = async () => {
  const productIDArray = await getProductID();
  const selectID = document.getElementById("productID");
  productIDArray.forEach((id) => {
    let option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    selectID.appendChild(option);
  });
};

createIDOptions();

btnSubmit.addEventListener("click", (event) => {
  event.preventDefault();

  const uploadForm = document.querySelector("form");
  const formData = new FormData(uploadForm);

  for (var pair of formData.entries()) {
    console.log(pair);
  }

  fetch("/admin/create-campaign", {
    method: "POST",
    body: formData,
  })
    .then(console.log("send to server sucess!"))
    .catch((err) => {
      console.log(err);
    });
});
