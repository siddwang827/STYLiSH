let api = 'api/1.0'
const basicSizeOption = ["S", "M", "L"]
const freight = 60
const cdnDomain = 'https://di6i27gdqbz7x.cloudfront.net'
const rgb2hex = (rgb) => `${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map((n) => parseInt(n, 10).toString(16).padStart(2, "0")).join("")}`

window.onload = async () => {
    // get product detail
    let params = new URL(window.location).searchParams
    let ID = params.get('id')
    const fetchResult = await fetch(`${api}/products/details?id=${ID}`)
    const resultParse = await fetchResult.json()
    const product = resultParse.data

    // render product to DOM
    let productDiv = (document.querySelector('#product')).cloneNode(true)
    let [productInfo, seperator, productStory] = productDiv.children
    let [productMainImageFrame, productDetail] = productInfo.children
    let [productTitle, productID, productPrice, productVariants,
        checkButton, productNote, productTexture, productDescription,
        productWash, productPlace] = productDetail.children

    productMainImageFrame.children[0].src = `${cdnDomain}${product.main_image}`
    productTitle.textContent = product.title
    productID.textContent = product.id.toString()
    productPrice.textContent = `TWD. ${product.price}`
    productNote.textContent = product.note
    productDescription.innerHTML = `${product.description.replaceAll("\\r\\n", "<br>")}`
    productTexture.textContent = product.texture
    productWash.textContent = product.Wash
    productPlace.textContent = product.place
    productStory.textContent = product.story

    const [productColors, productSizes, productQty] = (Array.from(productVariants.children)).map(variant => { return variant.children[1] })
    let maxStock = 0;
    let [reduceButton, qtyDiv, addButton] = productQty.children

    product.colors.forEach(color => {
        let colorDiv = document.createElement('div')
        colorDiv.classList.add("product_color")
        colorDiv.style.backgroundColor = `#${color.code}`
        colorDiv.addEventListener('click', colorClick)
        productColors.append(colorDiv)
    });

    basicSizeOption.forEach(size => {
        let sizeDiv = document.createElement('div')
        sizeDiv.classList.add('product_size', 'product_size_disable')
        sizeDiv.textContent = size
        sizeDiv.addEventListener('click', sizeClick)
        productSizes.appendChild(sizeDiv)
    })

    product.images.forEach(image => {
        let imgDiv = document.createElement('img')
        imgDiv.classList.add('product_image')
        imgDiv.src = `${cdnDomain}${image}`
        productDiv.appendChild(imgDiv)
    })

    checkButton.addEventListener('click', checkoutClick)
    document.querySelector('.btn_checkout').addEventListener('click', payClick);
    document.querySelector('.btn_cancel').addEventListener('click', cancelClick);
    document.getElementsByTagName('main')[0].replaceChild(productDiv, document.querySelector('#product'))

    function colorClick(event) {
        let colorSelect = event.target
        let colorhex = rgb2hex(colorSelect.style.backgroundColor).toUpperCase()
        let selectedColor = document.querySelector('.product_color_selected')
        if (selectedColor) selectedColor.classList.remove('product_color_selected')
        colorSelect.classList.add('product_color_selected');
        qtyDiv.textContent = '1';
        (Array.from(productSizes.children)).forEach(size => size.classList.add('product_size_disable'))
        product.variant.forEach(variant => {
            if (variant.color_code === colorhex) {
                (Array.from(productSizes.children)).forEach(size => {
                    if (size.textContent === variant.size) { size.classList.remove('product_size_disable') }
                })
            }
        })
    }

    function sizeClick(event) {
        let sizeSelect = event.target
        let cololorSelect = document.querySelector(".product_color_selected")
        let selectedSize = document.querySelector('.product_size_selected')
        if (selectedSize) selectedSize.classList.remove('product_size_selected')
        sizeSelect.classList.add('product_size_selected');
        qtyDiv.textContent = '1'
        product.variant.forEach(variant => {
            if (variant.color_code === rgb2hex(cololorSelect.style.backgroundColor).toUpperCase()
                && variant.size === sizeSelect.innerText) {
                maxStock = variant.stock
            }
        })
        reduceButton.addEventListener('click', reduceButtonClick)
        addButton.addEventListener('click', addButtonClick)
    }

    function reduceButtonClick() {
        let currentQty = parseInt(qtyDiv.textContent)
        if (currentQty > 1) {
            qtyDiv.textContent = currentQty - 1
            document.getElementsByTagName('span')[1].textContent = (currentQty - 1) * product.price
            document.getElementsByTagName('span')[2].textContent = (currentQty - 1) * product.price + freight
        }
    }

    function addButtonClick() {
        let currentQty = parseInt(qtyDiv.textContent)
        if (currentQty < maxStock) {
            qtyDiv.textContent = currentQty + 1
            document.getElementsByTagName('span')[1].textContent = (currentQty + 1) * product.price
            document.getElementsByTagName('span')[2].textContent = (currentQty + 1) * product.price + freight
        }
    }

    function checkoutClick() {
        if (!document.querySelector('.product_color_selected') || !document.querySelector('.product_size_selected')) {
            alert('Please select at least one color and one size!')
            return
        }
        const accessToken = localStorage.getItem('access_token')
        if (!accessToken) {
            alert('Please Sign In')
            return window.location.href = '/auth.html'
        }
        let currentQty = parseInt(document.getElementById('qty').textContent)
        document.getElementsByTagName('span')[1].textContent = currentQty * product.price
        document.getElementsByTagName('span')[2].textContent = currentQty * product.price + freight
        document.getElementById("checkout").classList.remove('checkout-disable');

    }

    function cancelClick() {
        document.getElementById("checkout").classList.add('checkout-disable');
    }


    async function payClick(event) {
        //get credit card status
        const tappayStatus = TPDirect.card.getTappayFieldsStatus()
        if (!tappayStatus.canGetPrime) { alert('請填入有效的信用卡資訊'); return }
        // get prime

        await TPDirect.card.getPrime(async (result) => {
            if (result.status !== 0) {
                alert('get prime error ' + result.msg)
                event.preventDefault()

            }
            const colors = product.colors
            const id = product.id
            const name = product.title
            const price = product.price
            const size = document.getElementsByClassName('product_size_selected')[0].textContent
            const qty = parseInt(document.getElementById('qty').textContent)
            const subtotal = price * qty
            const colorCodeDiv = document.getElementsByClassName("product_color_selected")[0]
            const colorCode = rgb2hex(colorCodeDiv.style.backgroundColor).toUpperCase()
            const colorName = (colors.filter(color => color.code === colorCode)[0]).name
            const access_token = localStorage.getItem('access_token')
            console.log(access_token)

            const list = [
                {
                    id: id,
                    name: name,
                    price: price,
                    color: {
                        "code": colorCode,
                        "name": colorName
                    },
                    size: size,
                    qty: qty
                }
            ]
            const order = {
                shipping: "delivery",
                payment: "credit_card",
                subtotal: subtotal,
                freight: 60,
                total: subtotal + freight,
                recipient: {
                    name: "Luke",
                    phone: "0987654321",
                    email: "luke@gmail.com",
                    address: "市政府站",
                    time: "morning"
                },
                list: list
            }

            const body = {
                prime: result.card.prime,
                order: order
            }

            try {

                const fetchResult = await fetch('/api/1.0/order/checkout', {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": access_token
                    }
                })

                const resultParse = await fetchResult.json()

                if (fetchResult.status === 200) {
                    localStorage.setItem('order', resultParse.data.number)
                    window.location.href = '/thankyou.html'
                }
                else if (fetchResult.status === 403) {
                    alert(`${resultParse.error}. Please log in!`)
                    window.location.href = '/auth.html'
                }
            }
            catch (err) {
                console.log(err)
            }
        })
    }
}



