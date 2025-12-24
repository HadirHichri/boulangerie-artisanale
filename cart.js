/* ============================================
   SYSTÈME DE PANIER COMPLET - OPTIMISÉ
   Gestion du panier avec localStorage
   ============================================ */

// Clé pour le stockage local
const CART_STORAGE_KEY = 'artisan_boulangerie_cart';

// Cache pour éviter les appels répétés à localStorage
let cartCache = null;
let cacheValid = false;

// Fonction pour obtenir le panier depuis localStorage (avec cache)
function getCart() {
    if (cacheValid && cartCache !== null) {
        return cartCache;
    }
    
    try {
        const cartJson = localStorage.getItem(CART_STORAGE_KEY);
        if (!cartJson) {
            cartCache = [];
            cacheValid = true;
            return cartCache;
        }
        const cart = JSON.parse(cartJson);
        if (!Array.isArray(cart)) {
            console.warn('Cart data is not an array, resetting cart');
            cartCache = [];
            cacheValid = true;
            return cartCache;
        }
        // Normaliser les IDs et valider les données
        cartCache = cart.map(item => ({
            id: String(item.id || ''),
            name: String(item.name || ''),
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1,
            image: String(item.image || '')
        })).filter(item => item.id && item.name && item.price > 0 && item.quantity > 0);
        cacheValid = true;
        return cartCache;
    } catch (error) {
        console.error('Error reading cart from localStorage:', error);
        cartCache = [];
        cacheValid = true;
        return cartCache;
    }
}

// Fonction pour sauvegarder le panier dans localStorage
function saveCart(cart) {
    try {
        if (!Array.isArray(cart)) {
            console.error('Attempted to save non-array cart');
            return;
        }
        // Normaliser les données avant sauvegarde
        const normalizedCart = cart.map(item => ({
            id: String(item.id || ''),
            name: String(item.name || ''),
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1,
            image: String(item.image || '')
        })).filter(item => item.id && item.name && item.price > 0 && item.quantity > 0);
        
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedCart));
        // Mettre à jour le cache
        cartCache = normalizedCart;
        cacheValid = true;
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        cacheValid = false;
    }
}

// Invalider le cache
function invalidateCache() {
    cacheValid = false;
    cartCache = null;
}

// Fonction pour ajouter un produit au panier
function addToCart(productId, productName, productPrice, productImage) {
    const normalizedId = String(productId);
    const cart = getCart();
    
    const existingProduct = cart.find(item => String(item.id) === normalizedId);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
        // définir l'image si elle est absente
        if (!existingProduct.image && productImage) existingProduct.image = String(productImage);
    } else {
        cart.push({
            id: normalizedId,
            name: productName,
            price: parseFloat(productPrice),
            quantity: 1,
            image: productImage ? String(productImage) : ''
        });
    }
    
    saveCart(cart);
    updateCartUI();
    showNotification(`${productName} ajouté au panier`);
}

// Fonction pour retirer un produit du panier (diminuer la quantité)
function removeFromCart(productId) {
    const normalizedId = String(productId);
    const cart = getCart();
    const product = cart.find(item => String(item.id) === normalizedId);
    
    if (!product) return;
    
    if (product.quantity > 1) {
        product.quantity -= 1;
        saveCart(cart);
        
        // Mise à jour optimisée de l'UI sans re-render complet
        const quantityEl = document.querySelector(`.cart-item[data-product-id="${normalizedId}"] .cart-item-quantity`);
        if (quantityEl) {
            quantityEl.textContent = product.quantity;
            quantityEl.classList.add('updating');
            setTimeout(() => quantityEl.classList.remove('updating'), 300);
        }
        
        const cartItem = document.querySelector(`.cart-item[data-product-id="${normalizedId}"]`);
        if (cartItem) {
            const itemTotalEl = cartItem.querySelector('.cart-item-total span');
            if (itemTotalEl) {
                itemTotalEl.textContent = (product.price * product.quantity).toFixed(3) + ' DT';
            }
        }
        
        updateCartTotals();
        updateCartIcon();
    } else {
        deleteFromCart(normalizedId);
    }
}

// Fonction pour supprimer complètement un produit du panier
function deleteFromCart(productId) {
    const normalizedId = String(productId);
    const cartItem = document.querySelector(`.cart-item[data-product-id="${normalizedId}"]`);
    
    if (cartItem) {
        cartItem.classList.add('removing');
        setTimeout(() => {
            const cart = getCart();
            const filteredCart = cart.filter(item => String(item.id) !== normalizedId);
            saveCart(filteredCart);
            updateCartUI();
        }, 300);
    } else {
        const cart = getCart();
        const filteredCart = cart.filter(item => String(item.id) !== normalizedId);
        saveCart(filteredCart);
        updateCartUI();
    }
}

// Fonction pour calculer le total du panier
function calculateTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        return total + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0);
}

// Fonction pour obtenir le nombre total d'articles dans le panier
function getTotalItems() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        return total + parseInt(item.quantity);
    }, 0);
}

// Fonction pour mettre à jour l'icône panier (compteur)
function updateCartIcon() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const totalItems = getTotalItems();
    const previousCount = parseInt(cartCount.textContent) || 0;
    
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    if (totalItems !== previousCount && totalItems > 0) {
        cartCount.classList.add('updated');
        setTimeout(() => cartCount.classList.remove('updated'), 400);
    }
}

// Fonction pour afficher les articles dans le modal panier
function renderCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    const cartEmpty = document.getElementById('cart-empty');
    
    if (!cartItemsContainer) {
        console.error('cart-items container not found');
        return;
    }
    
    if (cart.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'flex';
        if (cartFooter) cartFooter.style.display = 'none';
        
        const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
        existingItems.forEach(item => item.remove());
        
        if (cartEmpty && !cartItemsContainer.contains(cartEmpty)) {
            cartItemsContainer.appendChild(cartEmpty);
        }
        return;
    }
    
    // Panier avec articles
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartFooter) cartFooter.style.display = 'block';
    
    // Supprimer uniquement les articles existants
    const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
    existingItems.forEach(item => item.remove());
    
    // Créer un fragment pour améliorer les performances
    const fragment = document.createDocumentFragment();
    
    cart.forEach((item, index) => {
        const normalizedId = String(item.id);
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-product-id', normalizedId);
        cartItem.innerHTML = `
            <div class="cart-item-image">
                ${item.image ? `<a class="cart-item-image-link" href="produits.html#${normalizedId}"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"></a>` : `<div class="cart-item-placeholder cart-item-placeholder-${normalizedId}"></div>`}
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
                <p class="cart-item-price">${item.price.toFixed(3)} DT</p>
            </div>
            <div class="cart-item-controls">
                <button class="cart-item-btn cart-item-decrease" data-product-id="${normalizedId}" aria-label="Diminuer la quantité">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="cart-item-quantity">${item.quantity}</span>
                <button class="cart-item-btn cart-item-increase" data-product-id="${normalizedId}" aria-label="Augmenter la quantité">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="cart-item-btn cart-item-delete" data-product-id="${normalizedId}" aria-label="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="cart-item-total">
                <span>${(item.price * item.quantity).toFixed(3)} DT</span>
            </div>
        `;
        fragment.appendChild(cartItem);
        
        // Animation d'apparition
        setTimeout(() => {
            cartItem.classList.add('visible');
        }, index * 30);
    });
    
    cartItemsContainer.appendChild(fragment);
    updateCartTotals();
    
    // Réinitialiser les moyens de paiement une seule fois
    if (typeof setupPaymentMethods === 'function') {
        setTimeout(() => setupPaymentMethods(), 50);
    }
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fonction pour mettre à jour les totaux
function updateCartTotals() {
    const subtotal = calculateTotal();
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    
    if (subtotalEl && totalEl) {
        subtotalEl.textContent = subtotal.toFixed(3) + ' DT';
        totalEl.textContent = subtotal.toFixed(3) + ' DT';
    }
}

// Fonction pour mettre à jour toute l'interface du panier
function updateCartUI() {
    updateCartIcon();
    renderCartItems();
}

// Fonction pour afficher une notification
function showNotification(message) {
    let notification = document.getElementById('cart-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'cart-notification';
        notification.setAttribute('aria-live', 'polite');
        notification.setAttribute('aria-atomic', 'true');
        notification.innerHTML = '<span class="cart-notification-text"></span>';
        document.body.appendChild(notification);
    }
    
    const notificationText = notification.querySelector('.cart-notification-text');
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Variable globale pour la sélection de paiement
window.selectedPayment = null;

// Fonction optimisée pour gérer la sélection des moyens de paiement
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    // Utiliser la délégation d'événements au lieu de cloner les éléments
    paymentMethods.forEach(method => {
        // Retirer les anciens listeners en créant un nouveau nœud
        const newMethod = method.cloneNode(true);
        method.parentNode.replaceChild(newMethod, method);
        
        newMethod.addEventListener('click', function() {
            // Retirer la classe active de tous
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            // Ajouter la classe active au sélectionné
            this.classList.add('active');
            window.selectedPayment = this.getAttribute('data-payment');
        });
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour l'interface du panier
    updateCartUI();
    
    // Gestion de l'icône panier
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = cartModal ? cartModal.querySelector('.cart-modal-overlay') : null;
    
    if (cartIcon && cartModal) {
        cartIcon.addEventListener('click', function() {
            cartModal.setAttribute('aria-hidden', 'false');
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Réinitialiser la sélection du moyen de paiement
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            window.selectedPayment = null;
        });
    }
    
    function closeCartModal() {
        if (cartModal) {
            cartModal.setAttribute('aria-hidden', 'true');
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    if (cartClose) {
        cartClose.addEventListener('click', closeCartModal);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCartModal);
    }
    
    // Fermer avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartModal && cartModal.classList.contains('active')) {
            closeCartModal();
        }
    });
    
    // Gestion des boutons d'ajout au panier
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-cart')) {
            const button = e.target.closest('.btn-cart');
            const productItem = button.closest('.product-item');
            
            if (productItem) {
                e.preventDefault();
                const productId = productItem.getAttribute('data-product-id');
                const productName = productItem.getAttribute('data-product-name');
                const productPrice = productItem.getAttribute('data-product-price');
                
                if (productId && productName && productPrice) {
                    let imageSrc = '';
                    const imgEl = productItem.querySelector('img');
                    if (imgEl) {
                        imageSrc = imgEl.getAttribute('src');
                    } else {
                        const vid = productItem.querySelector('video');
                        if (vid) {
                            imageSrc = vid.getAttribute('poster') || productItem.dataset.productImage || '';
                        } else {
                            imageSrc = productItem.dataset.productImage || '';
                        }
                    }
                    addToCart(productId, productName, productPrice, imageSrc);
                    
                    // Animation du bouton
                    button.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 150);
                }
            }
        }
    });
    
    // Déléguation d'événements pour les contrôles du panier (une seule fois)
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const productId = target.getAttribute('data-product-id');
            if (!productId) return;
            
            const normalizedId = String(productId);
            
            if (target.classList.contains('cart-item-increase')) {
                e.preventDefault();
                const cart = getCart();
                const product = cart.find(item => String(item.id) === normalizedId);
                if (product) {
                    target.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        target.style.transform = '';
                    }, 150);
                    
                    addToCart(normalizedId, product.name, product.price);
                }
            } else if (target.classList.contains('cart-item-decrease')) {
                e.preventDefault();
                target.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    target.style.transform = '';
                }, 150);
                removeFromCart(normalizedId);
            } else if (target.classList.contains('cart-item-delete')) {
                e.preventDefault();
                target.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    target.style.transform = '';
                }, 150);
                deleteFromCart(normalizedId);
            }
        });

        // Clicking thumbnail: open products page or scroll to product if on page
        cartItemsContainer.addEventListener('click', function(e) {
            const link = e.target.closest('.cart-item-image-link');
            if (!link) return;
            e.preventDefault();
            const href = link.getAttribute('href');
            const hash = href && href.split('#')[1];
            if (!hash) return;
            const targetEl = document.getElementById(hash);
            if (targetEl && (window.location.pathname.endsWith('produits.html') || window.location.href.includes('produits.html'))) {
                // scroll into view and close modal
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const cartModal = document.getElementById('cart-modal');
                if (cartModal) {
                    cartModal.setAttribute('aria-hidden', 'true');
                    cartModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            } else {
                // navigate to the product page
                window.location.href = href;
            }
        });
    }
    
    // Initialiser les moyens de paiement
    setupPaymentMethods();
    
    // Video fallback for save-data / slow connections or small screens
    function applyVideoFallbacks() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
        const saveData = conn.saveData;
        const effectiveType = conn.effectiveType || '';
        const slowConn = saveData || /2g/.test(effectiveType) || effectiveType === 'slow-2g';
        const smallScreen = window.innerWidth < 600;
        const disableVideos = slowConn || smallScreen;

        document.querySelectorAll('.product-video').forEach(video => {
            const productImage = video.closest('.product-image');
            const placeholder = productImage ? productImage.querySelector('.product-placeholder') : null;

            if (disableVideos) {
                try { video.pause(); } catch (e) {}
                video.removeAttribute('autoplay');
                video.style.display = 'none';
                if (placeholder) {
                    placeholder.style.display = 'flex';
                    placeholder.style.zIndex = 2;
                }
            } else {
                video.style.display = '';
                if (placeholder) {
                    placeholder.style.zIndex = '';
                    placeholder.style.display = '';
                }
            }
        });
    }

    // Apply once and listen for changes
    applyVideoFallbacks();
    if (navigator.connection && typeof navigator.connection.addEventListener === 'function') {
        navigator.connection.addEventListener('change', applyVideoFallbacks);
    }
    window.addEventListener('resize', applyVideoFallbacks);

    // Bouton commander
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = getCart();
            if (cart.length === 0) {
                showNotification('Votre panier est vide');
                return;
            }
            
            if (!window.selectedPayment) {
                showNotification('Veuillez sélectionner un moyen de paiement');
                return;
            }
            
            showOrderConfirmation();
        });
    }
});

/* ============================================
   MODAL DE CONFIRMATION DE COMMANDE
   ============================================ */

function showOrderConfirmation() {
    let confirmationModal = document.getElementById('order-confirmation-modal');
    
    if (!confirmationModal) {
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'order-confirmation-modal';
        confirmationModal.className = 'order-confirmation-modal';
        confirmationModal.setAttribute('aria-hidden', 'true');
        confirmationModal.innerHTML = `
            <div class="order-confirmation-overlay"></div>
            <div class="order-confirmation-content">
                <div class="order-confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 class="order-confirmation-title">Merci pour votre commande !</h2>
                <p class="order-confirmation-message">
                    Merci pour votre commande !<br>
                    Votre commande a bien été prise en compte.
                </p>
                <button class="btn btn-primary order-confirmation-btn" id="confirm-ok-btn">
                    Parfait
                </button>
            </div>
        `;
        document.body.appendChild(confirmationModal);
        
        const overlay = confirmationModal.querySelector('.order-confirmation-overlay');
        const okBtn = confirmationModal.querySelector('#confirm-ok-btn');
        
        function closeConfirmation() {
            confirmationModal.setAttribute('aria-hidden', 'true');
            confirmationModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        if (overlay) {
            overlay.addEventListener('click', closeConfirmation);
        }
        
        if (okBtn) {
            okBtn.addEventListener('click', function() {
                closeConfirmation();
                saveCart([]);
                invalidateCache();
                updateCartUI();
                const cartModal = document.getElementById('cart-modal');
                if (cartModal) {
                    cartModal.setAttribute('aria-hidden', 'true');
                    cartModal.classList.remove('active');
                }
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && confirmationModal.classList.contains('active')) {
                closeConfirmation();
            }
        });
    }
    
    confirmationModal.setAttribute('aria-hidden', 'false');
    confirmationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
