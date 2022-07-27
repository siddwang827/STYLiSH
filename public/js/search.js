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
