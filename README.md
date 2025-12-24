# 🥐 Artisan Boulangerie - Site E-commerce

Ce projet représente le site web d'une boulangerie artisanale, incluant une vitrine de produits et un système de panier d'achat (e-commerce). Il met l'accent sur un design chaleureux et une expérience utilisateur fluide.

## 🌟 Aperçu du Projet

* **Nom :** Artisan Boulangerie
* **Description :** Site vitrine et e-commerce pour une boulangerie traditionnelle, spécialisée dans le pain et les viennoiseries faits maison.
* **Technologies :** HTML5, CSS3, JavaScript.

## 📁 Structure du Projet

Le projet est organisé autour des fichiers principaux suivants :

| Fichier | Description |
| :--- | :--- |
| `index.html` | Page d'accueil principale du site. |
| `produits.html` | Page affichant la liste des produits (pains, viennoiseries, etc.). |
| `contact.html` | Page de contact avec formulaire d'envoi. |
| `styles.css` | Ensemble des styles CSS (couleurs, mise en page, responsive). |
| `script.js` | Logique JavaScript générale (menu mobile, animations, navigation). |
| `cart.js` | Système complet de gestion du panier d'achat (localStorage, ajout, suppression, total, modal de confirmation). |
| `produits.js` | Logique spécifique à la page produits (gestion du bouton d'ajout au panier et notifications). |
| `README.md` | Ce fichier de documentation. |

## ✨ Fonctionnalités Clés

* **Design Responsive :** Mise en page adaptée à tous les types d'écrans (mobile, tablette, desktop).
* **Système de Panier :**
    * Utilisation de **LocalStorage** pour la persistance du panier (`cart.js`).
    * Affichage d'un total de commande et de la liste des articles.
    * Modal de confirmation de commande.
* **Formulaire de Contact :** Validation basique de l'email et du message (`contact.html`).
* **Notifications :** Affichage d'une notification après l'ajout d'un produit au panier (`produits.js`).
* **Accessibilité :** Utilisation d'attributs `aria` pour le menu mobile et la confirmation de commande.
