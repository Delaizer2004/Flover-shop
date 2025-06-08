document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userInfo = document.getElementById('user-info');

    if (!userInfo) {
        console.error('[Products Page] Елемент #user-info не знайдено на сторінці.');
    } else {
        if (token && token !== "undefined" && token !== null) {
            fetch('/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().catch(() => {
                        throw new Error(`[Products Page] Помилка HTTP ${response.status}. Токен може бути недійсним або простроченим.`);
                    }).then(errorData => {
                        throw new Error(errorData.message || `[Products Page] Помилка HTTP! Статус: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(user => {
                if (user && user.email) {
                    userInfo.innerHTML = `<span class="nav-link text-white">${user.email}</span><button class="btn btn-sm btn-danger ms-2" onclick="logout()">Вийти</button>`;
                    updateCartCountNav();
                } else {
                    console.error('[Products Page] Дані користувача неповні або структура помилки у відповіді 200 OK:', user);
                    localStorage.removeItem('token');
                    displayLoginRegisterLinks(userInfo);
                    updateCartCountNav(0);
                }
            })
            .catch(error => {
                console.error('[Products Page] Помилка отримання даних користувача (можливо, токен недійсний):', error.message);
                localStorage.removeItem('token');
                displayLoginRegisterLinks(userInfo);
                updateCartCountNav(0);
            });
        } else {
            if (token === "undefined" || token === null) {
                localStorage.removeItem('token');
            }
            if (userInfo) displayLoginRegisterLinks(userInfo);
            updateCartCountNav(0);
        }
    }

    fetchProducts(); 

    const applyFiltersButton = document.getElementById('apply-filters');
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', () => {
            const name = document.getElementById('filter-name')?.value;
            const priceMin = document.getElementById('filter-price-min')?.value;
            const priceMax = document.getElementById('filter-price-max')?.value;

            const filters = {};
            if (name) filters.name = name;
            if (priceMin) filters.priceMin = priceMin;
            if (priceMax) filters.priceMax = priceMax;
            fetchProducts(filters);
        });
    }

    const ratingForm = document.getElementById('ratingForm');
    const ratingMessageElement = document.getElementById('ratingMessage');

    if (ratingForm && ratingMessageElement) {
        ratingForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const token = localStorage.getItem('token');
            
            const productId = document.getElementById('rateProductId').value;
            const productType = ratingForm.dataset.productType; 
            const rating = document.getElementById('ratingValue').value;
            const review = document.getElementById('ratingReview').value;
            const submitButton = ratingForm.querySelector('button[type="submit"]');

            if (!productId || !productType || !rating) {
                ratingMessageElement.textContent = "Не вдалося визначити товар або оцінку.";
                ratingMessageElement.className = 'mt-3 alert alert-warning';
                ratingMessageElement.style.display = 'block';
                return;
            }
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Надсилання...';

            try {
                const response = await fetch('/api/ratings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        productId: parseInt(productId), 
                        productType: productType,
                        rating: parseInt(rating), 
                        review 
                    })
                });

                const responseData = await response.json();
                if (response.ok) {
                    ratingMessageElement.textContent = responseData.message || 'Дякуємо за вашу оцінку!'; 
                    ratingMessageElement.className = 'mt-3 alert alert-success';
                    ratingForm.reset();
                    setTimeout(() => {
                       if(ratingModalInstance) ratingModalInstance.hide();
                    }, 1500);
                } else {
                    ratingMessageElement.textContent = `Помилка: ${responseData.message || 'Не вдалося надіслати оцінку.'}`;
                    ratingMessageElement.className = 'mt-3 alert alert-danger';
                }
            } catch (error) {
                console.error('Error submitting rating:', error);
                ratingMessageElement.textContent = 'Виникла помилка під час надсилання оцінки.';
                ratingMessageElement.className = 'mt-3 alert alert-danger';
            } finally {
                ratingMessageElement.style.display = 'block';
                submitButton.disabled = false;
                submitButton.innerHTML = 'Надіслати оцінку';
            }
        });
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

async function fetchProducts(filters = {}) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) {
        console.error('[Products Page] Елемент #products-container не знайдено!');
        return;
    }
    productsContainer.innerHTML = '<div class="text-center col-12"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Завантаження...</span></div></div>';

    try {
        let flowerQuery = '';
        let bouquetQuery = ''; 

        if (filters.name) {
            const encodedName = encodeURIComponent(filters.name);
            flowerQuery += `name=${encodedName}&`;
            bouquetQuery += `name=${encodedName}&`;
        }
        if (filters.priceMin) {
            const encodedPriceMin = encodeURIComponent(filters.priceMin);
            flowerQuery += `priceMin=${encodedPriceMin}&`;
            bouquetQuery += `priceMin=${encodedPriceMin}&`;
        }
        if (filters.priceMax) {
            const encodedPriceMax = encodeURIComponent(filters.priceMax);
            flowerQuery += `priceMax=${encodedPriceMax}&`;
            bouquetQuery += `priceMax=${encodedPriceMax}&`;
        }
        if (flowerQuery.endsWith('&')) flowerQuery = flowerQuery.slice(0, -1);
        if (bouquetQuery.endsWith('&')) bouquetQuery = bouquetQuery.slice(0, -1);

        const [flowerResponse, bouquetResponse] = await Promise.all([
            fetch(`/api/flowers${flowerQuery ? '?' + flowerQuery : ''}`),
            fetch(`/api/bouquets${bouquetQuery ? '?' + bouquetQuery : ''}`)
        ]);

        let flowers = [];
        let bouquets = [];

        if(flowerResponse.ok) {
            flowers = await flowerResponse.json();
        } else {
            console.error("Не вдалося завантажити квіти:", flowerResponse.status, await flowerResponse.text().catch(()=>"Не вдалося розпарсити помилку сервера для квітів."));
        }

        if(bouquetResponse.ok) {
            bouquets = await bouquetResponse.json();
        } else {
            console.error("Не вдалося завантажити букети:", bouquetResponse.status, await bouquetResponse.text().catch(()=>"Не вдалося розпарсити помилку сервера для букетів."));
        }

        productsContainer.innerHTML = '';

        if (flowers.length === 0 && bouquets.length === 0) {
            productsContainer.innerHTML = '<p class="text-center col-12">Товари за вашим запитом не знайдено.</p>';
            return;
        }

        if (flowers.length > 0) {
            const flowerSectionTitle = document.createElement('h2');
            flowerSectionTitle.textContent = 'Квіти';
            flowerSectionTitle.className = 'w-100 text-center my-3 products-section-title';
            productsContainer.appendChild(flowerSectionTitle);
            flowers.forEach(product => displayProductCard(product, 'flower', productsContainer));
        }

        if (bouquets.length > 0) {
            const bouquetSectionTitle = document.createElement('h2');
            bouquetSectionTitle.textContent = 'Букети';
            bouquetSectionTitle.className = 'w-100 text-center my-3 products-section-title';
            productsContainer.appendChild(bouquetSectionTitle);
            bouquets.forEach(product => displayProductCard(product, 'bouquet', productsContainer));
        }

    } catch (error) {
        console.error('[Products Page] Помилка завантаження товарів:', error);
        productsContainer.innerHTML = '<p class="text-center col-12">Не вдалося завантажити товари. Будь ласка, спробуйте оновити сторінку.</p>';
    }
}

let ratingModalInstance = null; 

function openRatingModal(productId, productName, productType) {
    const token = localStorage.getItem('token');
    if (!token || token === "undefined" || token === null) {
        alert('Будь ласка, увійдіть, щоб залишити оцінку.');
        return;
    }

    const rateProductNameEl = document.getElementById('rateProductName');
    const rateProductIdEl = document.getElementById('rateProductId');
    const ratingValueEl = document.getElementById('ratingValue');
    const ratingReviewEl = document.getElementById('ratingReview');
    const ratingMessageEl = document.getElementById('ratingMessage');
    const ratingFormEl = document.getElementById('ratingForm');


    if (rateProductNameEl) rateProductNameEl.textContent = productName;
    if (rateProductIdEl) rateProductIdEl.value = productId;
    if (ratingFormEl) ratingFormEl.dataset.productType = productType; 
    
    if (ratingValueEl) ratingValueEl.value = "5"; 
    if (ratingReviewEl) ratingReviewEl.value = "";
    if (ratingMessageEl) {
        ratingMessageEl.style.display = 'none';
        ratingMessageEl.textContent = '';
    }

    const ratingModalElement = document.getElementById('ratingModal');
    if (ratingModalElement && typeof bootstrap !== 'undefined') {
        ratingModalInstance = bootstrap.Modal.getOrCreateInstance(ratingModalElement);
        ratingModalInstance.show();
    } else {
        console.error("Елемент модального вікна #ratingModal не знайдено або Bootstrap не завантажено.");
    }
}

function displayProductCard(product, productType, container) {
    const productCol = document.createElement('div');
    productCol.className = 'col'; 

    const productCard = document.createElement('div');
    productCard.className = 'card h-100 shadow-sm product-card-item'; 

    const productImage = document.createElement('img');
    productImage.src = product.imageUrl || 'images/default-flower.jpg'; 
    productImage.alt = product.name;
    productImage.className = 'card-img-top product-image';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = product.name;

    const cardDescription = document.createElement('p');
    cardDescription.className = 'card-text text-muted small flex-grow-1';
    cardDescription.textContent = product.description ? (product.description.length > 70 ? product.description.substring(0, 70) + '...' : product.description) : 'Опис відсутній.';

    const cardPrice = document.createElement('p');
    cardPrice.className = 'card-text fw-bold'; 
    cardPrice.textContent = `Ціна: ${parseFloat(product.price).toFixed(2)} грн`;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'mt-auto d-grid gap-2'; 

    const addToCartButton = document.createElement('button');
    addToCartButton.className = 'btn btn-danger add-to-cart-btn'; 
    addToCartButton.textContent = 'Додати до кошика';
    addToCartButton.onclick = () => addToCart(product.id, productType, 1);
    buttonsContainer.appendChild(addToCartButton);

    const rateButton = document.createElement('button');
    rateButton.className = 'btn btn-sm btn-outline-primary rate-btn';
    rateButton.textContent = `Оцінити ${productType === 'flower' ? 'квітку' : 'букет'}`;
    rateButton.onclick = () => openRatingModal(product.id, product.name, productType);
    buttonsContainer.appendChild(rateButton);
    
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardDescription);
    cardBody.appendChild(cardPrice);
    cardBody.appendChild(buttonsContainer);

    productCard.appendChild(productImage);
    productCard.appendChild(cardBody);
    productCol.appendChild(productCard);
    container.appendChild(productCol);
}


async function addToCart(productId, productType, quantity) {
    const token = localStorage.getItem('token');
    if (!token || token === "undefined" || token === null) {
        alert('Будь ласка, увійдіть, щоб додати товари до кошика.');
        return;
    }

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, productType, quantity })
        });

        const responseData = await response.json().catch(() => ({ message: "Відповідь сервера не є JSON" }));

        if (response.ok) {
            alert(responseData.message || 'Товар успішно додано до кошика!');
            updateCartCountNav();
        } else {
            alert(`Помилка: ${responseData.message || 'Не вдалося додати товар до кошика.'}`);
            console.error('[Products Page] Error adding to cart:', response.status, responseData);
        }
    } catch (error) {
        alert('Виникла помилка під час додавання товару до кошика. Перевірте консоль.');
        console.error('[Products Page] Catch Error adding to cart:', error);
    }
}

async function updateCartCountNav() {
    const token = localStorage.getItem('token');
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    if (!token || token === "undefined" || token === null) {
        cartCountElement.textContent = "0";
        return;
    }

    try {
        const response = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
            const cartItems = await response.json();
            const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalQuantity;
        } else {
            cartCountElement.textContent = "0";
        }
    } catch (error) {
        console.error("Error updating cart count:", error);
        cartCountElement.textContent = "!";
    }
}