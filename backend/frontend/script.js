document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userInfo = document.getElementById('user-info');
  
  if (!token) {
    userInfo.innerHTML = `
      <a href="login.html">Увійти</a>
      <a href="register.html">Реєстрація</a>
    `;
    return;
  }

  try {
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Не вдалося отримати дані користувача');
    }
    
    const user = await response.json();
    
    userInfo.innerHTML = `
      <span>${user.email}</span>
      <button onclick="logout()">Вийти</button>
    `;
    
  } catch (error) {
    console.error('Помилка:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    userInfo.innerHTML = `
      <a href="login.html">Увійти</a>
      <a href="register.html">Реєстрація</a>
    `;
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

async function fetchProducts(filters = {}) {
    try {
        let query = '';
        if (filters.name) {
            query += `name=${filters.name}&`;
        }
        if (filters.priceMin) {
            query += `priceMin=${filters.priceMin}&`;
        }
        if (filters.priceMax) {
            query += `priceMax=${filters.priceMax}&`;
        }

        const response = await fetch(`/api/flowers?${query}`);
        const products = await response.json();
        const productsContainer = document.getElementById('products-container');

        productsContainer.innerHTML = ''; // Clear existing content

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p>Price: $${product.price}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            productsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function addToCart(flowerId) {
    const token = localStorage.getItem('token');
    const quantity = 1; // Можна додати логіку для вибору кількості

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ flowerId, quantity })
        });

        if (response.ok) {
            alert('Added to cart');
        } else {
            console.error('Error adding to cart:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

document.getElementById('apply-filters').addEventListener('click', () => {
    const name = document.getElementById('filter-name').value;
    const priceMin = document.getElementById('filter-price-min').value;
    const priceMax = document.getElementById('filter-price-max').value;

    const filters = {
        name: name || undefined,
        priceMin: priceMin || undefined,
        priceMax: priceMax || undefined
    };

    fetchProducts(filters);
});

fetchProducts();