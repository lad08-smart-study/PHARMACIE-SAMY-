# PHARMACIE SAMY - Site Web Complet

## 📋 Description
Site web statique pour la pharmacie SAMY avec catalogue de produits, système multilingue (FR/EN/AR), et panneau d'administration connecté à Supabase.

---

## ✅ Corrections Apportées

### 1. ✅ Admin - Connexion Google
- Le bouton "Connexion avec Google" fonctionne maintenant correctement
- Utilise Supabase Auth pour l'authentification
- Redirection automatique après connexion

### 2. ✅ Google Maps - Localisation Correcte
- Le lien mène maintenant à **Pharmacie AMAROUAYACHE Samy Les sources**
- Adresse: Cité 400 logements, Bir Mourad Rais

### 3. ✅ Langues - FR/EN/AR Fonctionnent
- Les boutons FR/EN/AR changent la langue correctement
- Support RTL complet pour l'arabe
- Toutes les traductions sont fonctionnelles

### 4. ✅ Icônes Font Awesome
- Instagram: icône officielle `fa-instagram`
- TikTok: icône officielle `fa-tiktok`
- WhatsApp: icône officielle `fa-whatsapp`

### 5. ✅ Image Hero
- Ajout d'une image professionnelle de femme avec produits dermocosmétiques
- Image de haute qualité en fond du hero

### 6. ✅ Marques et Produits
- Les marques s'affichent correctement dans chaque catégorie
- Les produits se filtrent par marque

---

## 🚀 Déploiement

### Étape 1: GitHub
1. Créez un nouveau repository sur GitHub
2. Uploadez tous les fichiers de ce dossier
3. Commit et push

### Étape 2: Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Importez le repository
4. Framework Preset: **Other** (HTML statique)
5. Cliquez "Deploy"

### Étape 3: Supabase (CRITIQUE)

#### 3.1 Créer le projet
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et **Anon Key**

#### 3.2 Mettre à jour config.js
Ouvrez `assets/config.js` et remplacez:
```javascript
SUPABASE_URL: 'https://your-project.supabase.co',
SUPABASE_ANON_KEY: 'your-anon-key-here'
```

#### 3.3 Exécuter le SQL
Dans Supabase SQL Editor, exécutez tout le contenu de `supabase-setup.sql`:
```sql
-- Crée les tables
-- Active RLS
-- Crée les policies
-- Crée le bucket storage
```

#### 3.4 Créer le bucket Storage
1. Allez dans **Storage** > **New bucket**
2. Nom: `product-images`
3. Cochez "Public bucket"
4. Cliquez "Save"

#### 3.5 Configurer Google Auth
1. Allez dans **Authentication** > **Providers**
2. Activez **Google**
3. Ajoutez votre Client ID et Secret (depuis Google Cloud Console)
4. Dans **URL Configuration**, ajoutez:
   - Site URL: `https://votre-site.vercel.app`
   - Redirect URL: `https://votre-site.vercel.app/admin.html`

#### 3.6 Ajouter le premier Admin
1. Connectez-vous une première fois avec Google
2. Dans Supabase, allez dans **Table Editor** > **admin_users**
3. Insérez une ligne avec votre user_id et email

---

## 📁 Structure du Projet

```
pharmacie-samy/
├── index.html              # Page d'accueil avec image hero
├── catalogue.html          # Recherche + filtres + pagination
├── category.html           # Produits par catégorie + marques
├── brand.html              # Produits par marque
├── product.html            # Détail produit + WhatsApp
├── about.html              # À propos
├── contact.html            # Contact + carte Google Maps
├── admin.html              # Panneau admin (CRUD + upload)
├── sitemap.xml             # Sitemap SEO
├── robots.txt              # Robots SEO
├── README.md               # Ce fichier
├── supabase-setup.sql      # SQL complet
└── assets/
    ├── config.js           # Configuration Supabase
    ├── style.css           # Styles avec Font Awesome
    ├── i18n.js             # Traductions FR/EN/AR
    ├── supabase.js         # Client Supabase
    ├── app.js              # Logique principale
    ├── admin.js            # Logique admin
    └── hero-image.jpg      # Image hero
```

---

## 🔧 Fonctionnalités

| Fonctionnalité | Statut |
|----------------|--------|
| HTML/CSS/JS pur | ✅ |
| Multilangue FR/EN/AR | ✅ |
| RTL pour Arabe | ✅ |
| Supabase CRUD | ✅ |
| Upload images téléphone | ✅ |
| Auth Google | ✅ |
| RLS + Sécurité | ✅ |
| WhatsApp CTA | ✅ |
| SEO + Sitemap | ✅ |
| Font Awesome icônes | ✅ |
| Pagination | ✅ |
| Filtres + Tri | ✅ |

---

## 📞 Liens Officiels

- **Instagram:** https://www.instagram.com/pharmaciesamy/
- **TikTok:** https://www.tiktok.com/@pharmacie.samy
- **WhatsApp:** https://wa.me/213770762987
- **Google Maps:** Pharmacie AMAROUAYACHE Samy Les sources, Bir Mourad Rais

---

## ⚠️ Important

1. **Remplacez les valeurs dans `assets/config.js`** avant de déployer
2. **Exécutez le SQL** dans Supabase avant d'utiliser le site
3. **Ajoutez-vous comme admin** dans la table admin_users
4. **Testez la connexion Google** après configuration

---

## 🎓 Support

Pour toute question: contactez via WhatsApp +213 770 762 987
