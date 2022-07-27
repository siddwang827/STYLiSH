let api = "api/1.0";
const cdnDomain = 'https://di6i27gdqbz7x.cloudfront.net'

async function getCampaign() {
    const fetchResult = await fetch(`/${api}/marketing/campaigns`, {
        method: "GET",
    });
    const campaignData = (await fetchResult.json()).data;

    const campaignPicture = document.createElement("a");
    campaignPicture.href = `/product.html?id=${campaignData[0].product_id}`;
    campaignPicture.style.backgroundImage = `url(${cdnDomain}/img/stylish/campaign/${campaignData[0].picture.toString()})`;
    campaignPicture.classList.add("campaign", "campaign--active");

    const campaignStory = document.createElement("div");
    campaignStory.classList.add("campaign_story");
    campaignStory.innerHTML = `${campaignData[0].story.replaceAll("\\r\\n", "<br>")}`;

    campaignPicture.appendChild(campaignStory);
    // add campaign img and stroy to campaigns div
    const campaignsDiv = document.getElementById("campaigns");
    campaignsDiv.insertAdjacentElement("afterbegin", campaignPicture);
}

getCampaign();

async function getProductAll(category) {
    const fetchResult = await fetch(`/${api}/products/${category}`, { method: "GET" });
    const products = (await fetchResult.json()).data;
    const productsDiv = document.getElementById("products");
    if (products.length === 0) {
        productsDiv.innerHTML = "查無搜尋的商品!"
    }
    else {
        const productsFragment = new DocumentFragment();

        for (let product of products) {
            const productA = document.createElement("a");
            productA.classList.add("product");
            productA.href = `product.html?id=${product.id}`;

            const productImage = document.createElement("img");
            productImage.src = `${cdnDomain}${product.main_image}`;

            const productColor = document.createElement("div");
            productColor.classList.add("product_colors");
            product.colors.forEach((color) => {
                const colorDiv = document.createElement("div");
                colorDiv.classList.add("product_color");
                colorDiv.style.backgroundColor = color.code;
                productColor.appendChild(colorDiv);
            });

            const productTitle = document.createElement("div");
            productTitle.classList.add("product_title");
            productTitle.innerText = product.title;

            const productPrice = document.createElement("div");
            productPrice.classList.add("product_price");
            productPrice.innerText = `TWD.${product.price}`;

            productA.append(productImage, productColor, productTitle, productPrice);
            productsFragment.appendChild(productA);
        }
        productsDiv.appendChild(productsFragment);
    }
}

let category;
// catch url param keyword then classify
const paramString = new URL(window.location).searchParams;
const tag = paramString.get("tag");
if (!tag) { category = 'all' }
else if (tag === 'women' || tag === 'men' || tag === "accessories") { category = tag }
else { category = `search?keyword=${tag}` }
// listen enter keypress on search input
const inputSearch = document.getElementById('search-input');
inputSearch.addEventListener('keypress', event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        let keyword = event.target.value;
        window.location.href = `/?tag=${keyword}`
    }
})


getProductAll(category)