document.addEventListener("DOMContentLoaded", function() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <p>${item.name} - $${item.price} x ${item.quantity}</p>
                    <button onclick="removeItem(${index})">Remove</button>
                </div>
            `;
        });
        cartTotal.textContent = total;
        cartCount.textContent = cart.length;
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    
    window.removeItem = function(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    }
    
    updateCartDisplay();
});