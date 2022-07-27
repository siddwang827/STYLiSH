const btnSubmit = document.getElementById("btn-upload")


btnSubmit.addEventListener('click', event => {
    const formData = new FormData(uploadForm);

    const category = document.getElementById("category");
    const title = document.getElementById("title");
    const description = document.getElementById("description");
    const price = document.getElementById("price");
    const texture = document.getElementById("texture");
    const wash = document.getElementById("wash");
    const place = document.getElementById("place");
    const note = document.getElementById("note");
    const story = document.getElementById("story");

    const mainImage = document.getElementById("main-image");
    const otherImage = document.getElementsByClassName("other-image");

    try {
        formData.append("category", category.value)
        formData.append("title", title.value)
        formData.append("description", description.value)
        formData.append("price", price.value)
        formData.append("texture", texture.value)
        formData.append("wash", wash.value)
        formData.append("place", place.value)
        formData.append("note", note.value)
        formData.append("story", story.value)

        if (mainImage.files.length > 0) {
            formData.append("mainImage", mainImage.files, "main.jpg")
        }

        if (otherImage.files.length > 0) {
            for (i = 0; i < otherImage.files.length; i++) {
                formData.append(

                )
            }
            formData.append()
        }
    }




