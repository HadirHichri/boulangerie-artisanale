/* ============================================
   GESTION DU MENU HAMBURGER RESPONSIVE
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const hamburger = document.querySelector('.hamburger');
    const navMobile = document.querySelector('.nav-mobile');
    const navLinks = document.querySelectorAll('.nav-mobile .nav-link');
    
    // Fonction pour ouvrir/fermer le menu
    function toggleMenu() {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        
        // Toggle de l'état aria-expanded
        hamburger.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle de l'état aria-hidden pour le menu mobile
        navMobile.setAttribute('aria-hidden', isExpanded);
    }
    
    // Événement sur le bouton hamburger
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
    
    // Fermer le menu lors du clic sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.setAttribute('aria-expanded', 'false');
            navMobile.setAttribute('aria-hidden', 'true');
        });
    });
    
    // Fermer le menu lors du clic en dehors (optionnel)
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMobile.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && navMobile.getAttribute('aria-hidden') === 'false') {
            hamburger.setAttribute('aria-expanded', 'false');
            navMobile.setAttribute('aria-hidden', 'true');
        }
    });
});

/* ============================================
   ANIMATION AU SCROLL (Optionnel - effet léger)
   ============================================ */

// Fonction pour observer les éléments et ajouter une animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les cartes produits et valeurs
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.product-card, .value-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

/* ============================================
   NAVIGATION ACTIVE AU SCROLL
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Ne fonctionne que si on est sur la page d'accueil avec des sections
    if (sections.length > 0) {
        function updateActiveNav() {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                // Ne mettre à jour que les liens avec des ancres (#)
                if (href && href.startsWith('#')) {
                    link.classList.remove('active');
                    if (href === `#${current}`) {
                        link.classList.add('active');
                    }
                }
            });
        }
        
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Appel initial
    }
});

