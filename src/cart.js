document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    function displayCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p>Brand: ${item.brand}</p>
                        <p>Price: $<span id="price-${index}">${item.price}</span></p>
                        <div class="quantity-control">
                            <label>Quantity:</label>
                            <input type="number" min="1" value="${item.quantity || 1}" 
                                onchange="updateQuantity(${index}, this.value)">
                        </div>
                        <button class="button" onclick="removeFromCart(${index})">Remove</button>
                        <button class="button" onclick="moveToWishlist(${index})">Move to Wishlist</button>
                        <button class="button" onclick="updateItemPrice(${index})">Update Price</button>
                    </div>
                </div>
            `;

            cartItems.appendChild(itemElement);
            total += (item.price * (item.quantity || 1));
        });

        cartTotal.innerHTML = `
            <div class="cart-summary">
                <h2>Cart Summary</h2>
                <p>Total Items: ${cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}</p>
                <p>Total Amount: $${total.toFixed(2)}</p>
                <button class="button checkout-button" onclick="checkout()">Proceed to Checkout</button>
                <button class="button clear-cart-button" onclick="clearCart()">Clear Cart</button>
            </div>
        `;
    }

    window.updateQuantity = function(index, quantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart[index].quantity = parseInt(quantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }

    window.removeFromCart = function(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }

    window.moveToWishlist = function(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        wishlist.push(cart[index]);
        cart.splice(index, 1);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        displayCart();
        alert('Item moved to wishlist!');
    }

    window.clearCart = function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            localStorage.setItem('cart', JSON.stringify([]));
            displayCart();
        }
    }

    window.checkout = function() {
        alert('Proceeding to checkout...');
        // Add your checkout logic here
    }

    // New update functions

    window.updateItemPrice = function(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let newPrice = prompt("Enter new price:", cart[index].price);
        
        if (newPrice !== null && !isNaN(newPrice) && newPrice > 0) {
            cart[index].price = parseFloat(newPrice);
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        } else if (newPrice !== null) {
            alert("Please enter a valid price.");
        }
    }

    window.updateItemName = function(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let newName = prompt("Enter new name:", cart[index].name);
        
        if (newName !== null && newName.trim() !== "") {
            cart[index].name = newName.trim();
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        } else if (newName !== null) {
            alert("Please enter a valid name.");
        }
    }

    window.updateItemBrand = function(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let newBrand = prompt("Enter new brand:", cart[index].brand);
        
        if (newBrand !== null && newBrand.trim() !== "") {
            cart[index].brand = newBrand.trim();
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        } else if (newBrand !== null) {
            alert("Please enter a valid brand.");
        }
    }

    displayCart();
});