document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userInfo = document.getElementById('user-info'); 

    if (!userInfo) {
        console.error('Елемент #user-info не знайдено на сторінці shopping_cart.html.');
    } else {
        if (token && token !== "undefined" && token !== null) {
            fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` }})
            .then(response => {
                if (!response.ok) {
                     return response.json().catch(() => { throw new Error(`HTTP помилка ${response.status}`); }).then(errData => { throw new Error(errData.message || `HTTP помилка ${response.status}`) });
                }
                return response.json();
            })
            .then(user => {
                if (user && user.email) {
                    userInfo.innerHTML = `<span class="nav-link text-white">${user.email}</span><button class="btn btn-sm btn-danger ms-2" onclick="logout()">Вийти</button>`;
                } else {
                    localStorage.removeItem('token');
                    displayLoginRegisterLinks(userInfo);
                }
            })
            .catch(error => {
                console.error('Помилка отримання даних користувача в cart.js:', error.message);
                localStorage.removeItem('token');
                displayLoginRegisterLinks(userInfo);
            });
        } else {
            if (token === "undefined" || token === null) localStorage.removeItem('token');
            if (userInfo) displayLoginRegisterLinks(userInfo);
        }
    }
    
    fetchCart(); 

    const checkoutButton = document.getElementById('checkout');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
});

function displayLoginRegisterLinks(userInfoElement) {
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <a class="nav-link text-white" href="login.html">Увійти</a>
            <a class="nav-link text-white" href="register.html">Зареєструватися</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}


async function fetchCart() {
    const token = localStorage.getItem('token');
    const cartContainer = document.getElementById('cart-container');
    const cartTotalElement = document.getElementById('cart-total'); 
    const checkoutButton = document.getElementById('checkout');

    if (!cartContainer || !cartTotalElement || !checkoutButton) {
        console.error("Необхідні елементи кошика не знайдено на сторінці.");
        return;
    }
    cartContainer.innerHTML = '<div class="text-center col-12"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Завантаження кошика...</span></div></div>';


    if (!token || token === "undefined" || token === null) {
        cartContainer.innerHTML = '<p class="text-center fs-5 mt-3">Будь ласка, <a href="login.html" class="text-decoration-none">увійдіть</a>, щоб переглянути свій кошик.</p>';
        cartTotalElement.innerHTML = 'Загалом: 0.00 грн';
        checkoutButton.style.display = 'none';
        updateCartCountNav(0);
        return;
    }

    try {
        const response = await fetch('/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        cartContainer.innerHTML = '';

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Не вдалося розпарсити помилку сервера."}));
            throw new Error(errorData.message || `HTTP помилка! Статус: ${response.status}.`);
        }

        const cartItems = await response.json();
        window.currentCartItems = cartItems; 

        let total = 0;
        let totalQuantityNav = 0;

        if (cartItems.length > 0) {
            cartItems.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item d-flex align-items-center p-3 mb-3 border rounded shadow-sm bg-white text-dark'; 
                cartItemDiv.innerHTML = `
                    <img src="${item.imageUrl || 'images/default-flower.jpg'}" alt="${item.name}" class="img-fluid rounded me-3" style="width:100px; height:100px; object-fit: cover;">
                    <div class="cart-item-details flex-grow-1">
                        <h5 class="mb-1">${item.name} <span class="badge bg-secondary ms-1">${item.productType === 'flower' ? 'Квітка' : 'Букет'}</span></h5>
                        <p class="small text-muted mb-1">${item.description ? (item.description.length > 80 ? item.description.substring(0, 80) + '...' : item.description) : ''}</p>
                        <p class="mb-1"><strong>Ціна:</strong> ${parseFloat(item.price).toFixed(2)} грн</p>
                        <p class="mb-0"><strong>Кількість:</strong> ${item.quantity}</p>
                    </div>
                    <div class="cart-item-actions ms-3">
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">Видалити</button>
                    </div>
                `;
                cartContainer.appendChild(cartItemDiv);
                total += item.price * item.quantity;
                totalQuantityNav += item.quantity;
            });
            cartTotalElement.innerHTML = `<strong>Загалом: ${total.toFixed(2)} грн</strong>`;
            checkoutButton.style.display = 'block';
            checkoutButton.disabled = false;
        } else {
            cartContainer.innerHTML = '<p class="text-center fs-5 mt-3">Ваш кошик порожній.</p>';
            cartTotalElement.innerHTML = 'Загалом: 0.00 грн';
            checkoutButton.style.display = 'none';
        }
        updateCartCountNav(totalQuantityNav);
    } catch (error) {
        console.error('Помилка завантаження кошика:', error);
        cartContainer.innerHTML = `<p class="text-center text-danger fs-5 mt-3">Не вдалося завантажити кошик: ${error.message}. Спробуйте пізніше.</p>`;
        updateCartCountNav(0);
    }
}

async function removeFromCart(cartItemId) {
    const token = localStorage.getItem('token');
    if (!confirm("Ви впевнені, що хочете видалити цей товар з кошика?")) return;

    try {
        const response = await fetch(`/api/cart/remove/${cartItemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            fetchCart(); 
        } else {
            const errorData = await response.json().catch(()=>({message: "Не вдалося розпарсити помилку сервера."}));
            alert(`Помилка видалення: ${errorData.message || 'Не вдалося видалити товар.'}`);
        }
    } catch (error) {
        console.error('Помилка видалення з кошика:', error);
        alert('Виникла помилка під час видалення товару.');
    }
}

function updateCartCountNav(count = null) { 
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    if (count !== null) {
        cartCountElement.textContent = count;
        return;
    }
    const token = localStorage.getItem('token');
     if (!token || token === "undefined" || token === null) {
        cartCountElement.textContent = "0";
        return;
    }
    fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.resolve([]))
        .then(cartItems => {
            const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalQuantity;
        })
        .catch(() => cartCountElement.textContent = "!");
}


async function handleCheckout() {
    const token = localStorage.getItem('token');
    if (!token || !window.currentCartItems || window.currentCartItems.length === 0) {
        alert("Кошик порожній або ви не авторизовані для оформлення замовлення.");
        return;
    }

    const checkoutButton = document.getElementById('checkout');
    const originalButtonText = checkoutButton.textContent;
    checkoutButton.disabled = true;
    checkoutButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Обробка...';

    const orderPayload = {}; 

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload) 
        });

        const responseData = await response.json();
        if (response.ok) {
            alert(`Замовлення #${responseData.id} успішно створено!`);
            window.currentCartItems = []; 
            fetchCart(); 
        } else {
            alert(`Помилка створення замовлення: ${responseData.message || 'Невідома помилка.'}`);
        }
    } catch (error) {
        console.error('Помилка оформлення замовлення:', error);
        alert('Виникла серйозна помилка під час оформлення замовлення. Будь ласка, спробуйте ще раз або зв\'яжіться з підтримкою.');
    } finally {
        checkoutButton.disabled = false;
        checkoutButton.textContent = originalButtonText;
    }
}