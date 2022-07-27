const moreImg = document.getElementById("moreimg");
const imgInfo = document.getElementById("img-info");
const btnSubmit = document.getElementById("btn-upload");
const moreStock = document.getElementById("morestock");
const variantContainer = document.getElementById("variant-container");

const getColorNames = async () => {
  const response = await fetch("/api/1.0/products/get-colorname", {
    method: "get",
  });
  const body = await response.json();
  return body;
};

const createColorNameOptions = async () => {
  const colorNames = await getColorNames();
  const selectNames = document.getElementsByClassName("colorName");
  colorNames.forEach((color) => {
    let option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    selectNames[selectNames.length - 1].appendChild(option);
  });
};

createColorNameOptions();

moreImg.addEventListener("click", (event) => {
  const infoRow = document.createElement("div");
  const newImgLabel = document.createElement("label");
  const newImgInput = document.createElement("input");

  infoRow.classList.add("info-row");
  newImgLabel.textContent = "Other image ";
  newImgLabel.for = "otherImage";
  newImgInput.type = "file";
  newImgInput.name = "otherImage";
  newImgInput.accept = ".jpg";
  newImgInput.classList.add("other-image");

  [newImgLabel, newImgInput].forEach((ele) => ele.classList.add("info-item"));
  infoRow.append(newImgLabel, newImgInput);

  imgInfo.append(infoRow);
});

moreStock.addEventListener("click", (event) => {
  event.preventDefault();

  const variantBlock = document.createElement("div");
  variantBlock.classList.add("variant-info");

  const colorNameBlock = document.createElement("div");
  colorNameBlock.classList.add("info-row");
  colorNameBlock.innerHTML = `
		<label class="info-item" for="colorName" form="createform">color </label>
		<select class="info-item colorName" name="colorName" id="colorName" form="createform" />
  `;

  const sizeBlock = document.createElement("div");
  const index = document.getElementsByClassName("variant-info").length;
  sizeBlock.classList.add("info-row");
  sizeBlock.innerHTML = `
  <div class="info-item"><span class="size-title">size </span></div>
  <div class="info-item checkbox-row">
    <div class="checkbox">
      <input class="checkbox-input" name="size[${index}][]" type="checkbox" value="XS" form="createform" />
      <label>XS</label>
    </div>
    <div class="checkbox">
      <input class="checkbox-input" name="size[${index}][]" type="checkbox" value="S" form="createform" />
      <label>S</label>
    </div>
    <div class="checkbox">
      <input class="checkbox-input" name="size[${index}][]" type="checkbox" value="M" form="createform" />
      <label>M</label>
    </div>
    <div class="checkbox">
      <input class="checkbox-input" name="size[${index}][]" type="checkbox" value="L" form="createform" />
      <label>L</label>
    </div>
    <div class="checkbox">
      <input class="checkbox-input" name="size[${index}][]" type="checkbox" value="XL" form="createform" />
      <label>XL</label>
    </div>
    <div class="checkbox">
      <input class="checkbox-input" name="size[${index}][]" type="checkbox" value="F" form="createform" />
      <label>F</label>
    </div>
  </div>
  `;
  const stockBlock = document.createElement("div");
  stockBlock.classList.add("info-row");
  stockBlock.innerHTML = `
    <label class="info-item" for="variants-stock">stock </label>
    <input class="info-item" name="variantStock" id="variantStock" form="createform" />
  `;

  variantBlock.append(colorNameBlock, sizeBlock, stockBlock);

  variantContainer.appendChild(variantBlock);
  createColorNameOptions();
});

btnSubmit.addEventListener("click", (event) => {
  event.preventDefault();

  // rename other images
  const uploadForm = document.getElementById("createform");
  const otherImage = document.getElementsByClassName("other-image");
  const fd = new FormData(uploadForm);

  if (otherImage in fd) {
    fd.delete("otherImage");

    let otherImageName = [];
    if (otherImage[0].files.length) {
      for (i = 0; i < otherImage.length; i++) {
        fd.append("otherImage", otherImage[i].files[0], `${i + 1}.jpg`);
        otherImageName.push(`${i + 1}.jpg`);
      }
    }
    fd.append("otherImage", JSON.stringify(otherImageName));
  }

  fetch("/admin/create-product", {
    method: "POST",
    body: fd,
  })
    .then(console.log("send to server sucess!"))
    .catch((err) => {
      console.log(err);
    });
});


async function viewImage(element) {
  var file = element.files[0];
  var reader = new FileReader();
  reader.onloadend = function () {
    console.log('RESULT', reader.result)
    const img = new Image(250)
    img.src = reader.result
    document.getElementById("view").append(img)
  }
  reader.readAsDataURL(file);
}

