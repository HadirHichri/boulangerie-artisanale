/* ============================================
   GESTION DE L'AJOUT AU PANIER
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const cartButtons = document.querySelectorAll('.btn-cart');
    const notification = document.getElementById('cart-notification');
    const notificationText = notification.querySelector('.cart-notification-text');
    
    // Fonction pour afficher la notification
    function showNotification(productName) {
        notificationText.textContent = `${productName} ajouté au panier`;
        notification.classList.add('show');
        
        // Masquer la notification après 3 secondes
        setTimeout(function() {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Ajouter un événement sur chaque bouton panier
    cartButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Récupérer le nom du produit depuis l'attribut data-product
            const productItem = button.closest('.product-item');
            const productName = productItem.getAttribute('data-product');
            
            // Animation du bouton
            button.style.transform = 'scale(0.9)';
            setTimeout(function() {
                button.style.transform = '';
            }, 150);
            
            // Afficher la notification
            showNotification(productName);
            
            // Ici, vous pourriez ajouter la logique pour stocker le produit dans le panier
            // Par exemple : addToCart(productName, price);
        });
    });
});

