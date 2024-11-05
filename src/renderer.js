let allProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// Get DOM elements
const loading = document.getElementById('loading');
const productList = document.getElementById('productList');
const searchInput = document.getElementById('searchInput');
const loadProductsBtn = document.getElementById('loadProducts');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

async function loadProducts() {
    try {
        showLoading();
        const response = await fetch('http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline');
        allProducts = await response.json();
        displayProducts(allProducts);
        initializeFilters(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    } finally {
        hideLoading();
    }
}

function displayProducts(products) {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    productList.innerHTML = '';
    
    paginatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        productList.appendChild(productCard);
    });
    
    displayPagination(products.length);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const defaultImage = 'placeholder.jpg';
    const imageUrl = product.image_link || defaultImage;
    
    const productString = JSON.stringify(product).replace(/"/g, '&quot;');
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${escapeHtml(product.name)}" onerror="this.src='${defaultImage}'" loading="lazy">
        <h3>${escapeHtml(product.name)}</h3>
        <p class="brand">Brand: ${escapeHtml(product.brand)}</p>
        <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
        <p class="description">${escapeHtml(product.description)}</p>
        <p class="rating">Rating: ${product.rating ? product.rating : 'N/A'}</p>
        <p class="product-type">Type: ${escapeHtml(product.product_type)}</p>
        <div class="product-links">
            <a href="${escapeHtml(product.website_link)}" target="_blank">Website</a>
            <a href="${escapeHtml(product.product_link)}" target="_blank">Product Link</a>
        </div>
        <div class="product-buttons">
            <button class="add-to-cart" data-product='${productString}'>Add to Cart</button>
            <button class="add-to-wishlist" data-product='${productString}'>Add to Wishlist</button>
        </div>
    `;
    
    card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));
    card.querySelector('.add-to-wishlist').addEventListener('click', () => addToWishlist(product));
    
    return card;
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function addToCart(product) {
    try {
        if (!validateProduct(product)) {
            throw new Error('Invalid product data');
        }
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === product.id);
        
        if (existingProduct) {
            existingProduct.quantity = (existingProduct.quantity || 1) + 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        showMessageBox('Product added to cart successfully!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showMessageBox('Failed to add product to cart', 'error');
    }
}

function addToWishlist(product) {
    try {
        if (!validateProduct(product)) {
            throw new Error('Invalid product data');
        }
        
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const existingProduct = wishlist.find(item => item.id === product.id);
        
        if (!existingProduct) {
            wishlist.push(product);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            showMessageBox('Product added to wishlist successfully!');
        } else {
            showMessageBox('Product is already in your wishlist!', 'info');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showMessageBox('Failed to add product to wishlist', 'error');
    }
}

function showMessageBox(message, type = 'success') {
    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = () => messageBox.remove();
    
    messageBox.appendChild(closeButton);
    document.body.appendChild(messageBox);
    
    setTimeout(() => {
        messageBox.remove();
    }, 5000);
}

function displayPagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-button');
        if (i === currentPage) pageButton.classList.add('active');
        
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayProducts(allProducts);
        });
        
        paginationContainer.appendChild(pageButton);
    }
}

function displayCart() {
    const cartContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartContainer.innerHTML = '';
    cartTotal.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        const itemElement = createCartItem(item, index);
        cartContainer.appendChild(itemElement);
        total += item.price * (item.quantity || 1);
    });

    displayCartTotal(total);
}

function createCartItem(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    
    itemDiv.innerHTML = `
        <img src="${item.image_link}" alt="${escapeHtml(item.name)}">
        <div class="cart-item-details">
            <h3>${escapeHtml(item.name)}</h3>
            <p>Price: $${parseFloat(item.price).toFixed(2)}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
            <div class="quantity-controls">
                <button class="decrease-quantity">-</button>
                <span>${item.quantity || 1}</span>
                <button class="increase-quantity">+</button>
            </div>
            <button class="remove-button">Remove</button>
        </div>
    `;
    
    itemDiv.querySelector('.decrease-quantity').addEventListener('click', () => updateCartQuantity(index, (item.quantity || 1) - 1));
    itemDiv.querySelector('.increase-quantity').addEventListener('click', () => updateCartQuantity(index, (item.quantity || 1) + 1));
    itemDiv.querySelector('.remove-button').addEventListener('click', () => removeFromCart(index));
    
    return itemDiv;
}

function displayCartTotal(total) {
    const totalElement = document.createElement('div');
    totalElement.className = 'cart-total';
    totalElement.innerHTML = `
        <h3>Total: $${total.toFixed( 2)}</h3>
        <button onclick="checkout()">Checkout</button>
    `;
    document.getElementById('cartTotal').appendChild(totalElement);
}

// Wishlist functionality
function displayWishlist() {
    const wishlistContainer = document.getElementById('wishlistItems');
    if (!wishlistContainer) return;

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlistContainer.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty</p>';
        return;
    }

    wishlist.forEach((item, index) => {
        const itemElement = createWishlistItem(item, index);
        wishlistContainer.appendChild(itemElement);
    });
}

function createWishlistItem(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'wishlist-item';
    
    itemDiv.innerHTML = `
        <img src="${item.image_link}" alt="${escapeHtml(item.name)}">
        <div class="wishlist-item-details">
            <h3>${escapeHtml(item.name)}</h3>
            <p>Price: $${parseFloat(item.price).toFixed(2)}</p>
            <button onclick="moveToCart(${index})">Move to Cart</button>
            <button onclick="removeFromWishlist(${index})">Remove</button>
        </div>
    `;
    
    return itemDiv;
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
}

// Utility functions
function updateCartQuantity(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (newQuantity < 1) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQuantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function removeFromWishlist(index) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    displayWishlist();
}

function moveToCart(index) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemToMove = {...wishlist[index], quantity: 1};
    cart.push(itemToMove);
    
    wishlist.splice(index, 1);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    displayWishlist();
    showMessageBox('Item moved to cart!');
}

function checkout() {
    alert('Proceeding to checkout... (This is a placeholder)');
    // Implement actual checkout logic here
}

function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validateProduct(product) {
    return product 
        && typeof product === 'object'
        && product.id 
        && typeof product.price === 'string'
        && !isNaN(parseFloat(product.price));
}

function setupEventListeners() {
    loadProductsBtn.addEventListener('click', loadProducts);
    searchInput.addEventListener('input', handleSearch);
    
    // Add event listeners for filters
    document.getElementById('brandFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const filteredProducts = allProducts.filter(product => {
        return (
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
            (product.product_type && product.product_type.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    });
    
    currentPage = 1; // Reset to first page for search results
    displayProducts(filteredProducts);
}
function initializeFilters(products) {
    const brands = [...new Set(products.map(p => p.brand))];
    const categories = [...new Set(products.map(p => p.category))];
    
    populateFilterOptions('brandFilter', brands);
    populateFilterOptions('categoryFilter', categories);
}

function populateFilterOptions(filterId, options) {
    const filter = document.getElementById(filterId);
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        filter.appendChild(optionElement);
    });
}

function applyFilters() {
    const brandFilter = document.getElementById('brandFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;

    let filteredProducts = [...allProducts]; // Create a copy of allProducts

    // Apply brand filter
    if (brandFilter) {
        filteredProducts = filteredProducts.filter(product => product.brand === brandFilter);
    }

    // Apply category filter
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }

    // Apply price filter
    if (priceFilter) {
        const [minPrice, maxPrice] = priceFilter.split('-').map(Number);
        filteredProducts = filteredProducts.filter(product => {
            const price = parseFloat(product.price);
            return price >= minPrice && price <= maxPrice;
        });
    }

    // Apply sorting
    if (sortFilter) {
        filteredProducts.sort((a, b) => {
            switch(sortFilter) {
                case 'price-asc':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-desc':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });
    }

    currentPage = 1; // Reset to first page when filters are applied
    displayProducts(filteredProducts);
}
function resetFilters() {
    document.getElementById('brandFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortFilter').value = '';
    searchInput.value = '';
    displayProducts(allProducts);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
    
    // Check if we're on the cart or wishlist page and display accordingly
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    } else if (window.location.pathname.includes('wishlist.html')) {
        displayWishlist();
    }
});