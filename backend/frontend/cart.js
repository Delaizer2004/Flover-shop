document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userInfo = document.getElementById('user-info');
    if (token) {
        fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            
            userInfo.innerHTML = `<span>${user.email}</span><button onclick="logout()">Logout</button>`;
        })
        .catch(error => {
            console.error('Error fetching user:', error);
            userInfo.innerHTML = `<a href="login.html">Login  </a> <a href="register.html">  Register</a>`;
        });
    }else{
        userInfo.innerHTML = `<a href="login.html">Login  </a> <a href="register.html">  Register</a>`;
    }
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'shopping_cart.html';
}

async function fetchCart() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        const cartItems = await response.json();
        const cartContainer = document.getElementById('cart-container');
        const cartTotal = document.getElementById('cart-total');

        cartContainer.innerHTML = ''; // Clear existing content
        let total = 0;

        if (cartItems.length > 0) {
            cartItems.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h2>${item.name}</h2>
                        <p>${item.description}</p>
                        <p>Price: $${item.price}</p>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                `;
                cartContainer.appendChild(cartItem);

                total += item.price * item.quantity;
            });

            cartTotal.innerHTML = `Total: $${total.toFixed(2)}`;
        } else {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotal.innerHTML = '';
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}

async function removeFromCart(id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/cart/remove/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            fetchCart();
        } else {
            console.error('Error removing from cart:', response.statusText);
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

fetchCart();