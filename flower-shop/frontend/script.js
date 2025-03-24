document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("http://localhost:5000/products");
    const products = await response.json();

    const productList = document.getElementById("product-list");
    products.forEach(product => {
        const div = document.createElement("div");
        div.innerHTML = `<h2>${product.name}</h2><p>${product.price} грн</p>`;
        productList.appendChild(div);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();

    document.getElementById("search").addEventListener("input", (event) => {
        fetchProducts(event.target.value);
    });
});

function fetchProducts(query = "") {
    fetch(`/api/products?search=${query}`)
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById("product-list");
            productList.innerHTML = "";
            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card");
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price}</p>
                    <button onclick="addToCart(${product.id})">Додати в кошик</button>
                `;
                productList.appendChild(productCard);
            });
        })
        .catch(error => console.error("Помилка завантаження товарів:", error));
}

function addToCart(productId) {
    alert(`Товар ${productId} додано до кошика!`);
}
