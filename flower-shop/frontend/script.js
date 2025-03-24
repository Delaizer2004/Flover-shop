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
