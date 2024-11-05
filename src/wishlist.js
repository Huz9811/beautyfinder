document.addEventListener('DOMContentLoaded', () => {
    const wishlistItems = document.getElementById('wishlistItems');

    function displayWishlist() {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistItems.innerHTML = '';

        if (wishlist.length === 0) {
            wishlistItems.innerHTML = '<p>Your wishlist is empty.</p>';
            return;
        }

        wishlist.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wishlist-item';
            itemElement.innerHTML = `
                <div class="wishlist-item-details">
                    <img src="${item.image}" alt="${item.name}" class="wishlist-item-image">
                    <div class="wishlist-item-info">
                        <h3>${item.name}</h3>
                        <p>Brand: ${item.brand}</p>
                        <p>Price: $${item.price}</p>
                        <p>
                            Quantity: 
                            <input type="number" min="1" value="${item.quantity || 1}" 
                                   onchange="updateWishlistItem(${index}, this.value)">
                        </p>
                        <div class="wishlist-buttons">
                            <button class="button remove-btn" onclick="removeFromWishlist(${index})">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                            <button class="button add-to-cart-btn" onclick="addToCartFromWishlist(${index})">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="button update-btn" onclick="updateWishlistItem(${index}, document.querySelector('input[type=number]').value)">
                                <i class="fas fa-sync"></i> Update
                            </button>
                        </div>
                    </div>
                </div>
            `;
            wishlistItems.appendChild(itemElement);
        });
    }

    window.removeFromWishlist = function(index) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const removedItem = wishlist[index];
        wishlist.splice(index, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        displayWishlist();
        showNotification(`${removedItem.name} has been removed from your wishlist`);
    }

    window.addToCartFromWishlist = function(index) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const itemToMove = wishlist[index];
        cart.push({...itemToMove, quantity: itemToMove.quantity || 1});
        localStorage.setItem('cart', JSON.stringify(cart));
        
        removeFromWishlist(index);
        showNotification(`${itemToMove.name} has been moved to your cart`);
    }

    window.updateWishlistItem = function(index, newQuantity) {
        if (newQuantity < 1) {
            showNotification('Quantity must be at least 1');
            return;
        }

        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const oldQuantity = wishlist[index].quantity || 1;
        wishlist[index].quantity = parseInt(newQuantity);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        displayWishlist();
        showNotification(`Quantity updated from ${oldQuantity} to ${newQuantity}`);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Calculate and display wishlist total
    function updateWishlistTotal() {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const total = wishlist.reduce((sum, item) => {
            return sum + (item.price * (item.quantity || 1));
        }, 0);

        const totalElement = document.getElementById('wishlistTotal');
        if (totalElement) {
            totalElement.textContent = `Total: $${total.toFixed(2)}`;
        }
    }

    // Initial display
    displayWishlist();
    updateWishlistTotal();
});

// CSS for the notifications and styling
const styles = `
    .wishlist-item {
        border: 1px solid #ddd;
        margin: 10px 0;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .wishlist-item-details {
        display: flex;
        gap: 20px;
    }

    .wishlist-item-image {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 4px;
    }

    .wishlist-item-info {
        flex-grow: 1;
    }

    .wishlist-buttons {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .remove-btn {
        background-color: #ff4444;
        color: white;
    }

    .add-to-cart-btn {
        background-color: #4CAF50;
        color: white;
    }

    .update-btn {
        background-color: #2196F3;
        color: white;
    }

    .notification {
        position: fixed;
        bottom: -100px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        transition: bottom 0.5s;
        z-index: 1000;
    }

    .notification.show {
        bottom: 20px;
    }

    input[type="number"] {
        width: 60px;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);