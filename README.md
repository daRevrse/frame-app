# MyFrame - Plateforme SaaS de Partage de Cadres Photo

Application commerciale permettant d'uploader des cadres personnalisés et de les partager avec d'autres utilisateurs. Modèle freemium avec paiements via Stripe.

## Fonctionnalités

- **Créer un cadre** : Uploadez votre propre cadre et obtenez un lien de partage unique
- **Utiliser un cadre** : Ajoutez votre photo dans un cadre partagé
- **Modèle Freemium** : 1h gratuit, puis plans payants (24h, 7j, 1m, 6m, 1an)
- **Paiements Stripe** : Intégration complète avec Stripe Checkout
- **Gestion d'expiration** : Système automatique d'expiration des cadres
- **Pop-ups CTA** : Avertissements d'expiration et incitation à l'achat
- **Édition photo** : Déplacez, zoomez et ajustez votre photo dans le cadre
- **Téléchargement** : Téléchargez le résultat final en haute qualité

## Plans tarifaires

| Plan | Durée | Prix | Description |
|------|-------|------|-------------|
| **Gratuit** | 1 heure | 0€ | Essai gratuit |
| 24 Heures | 24h | 2,99€ | Parfait pour un événement |
| **7 Jours** | 7 jours | 9,99€ | Le plus populaire |
| 1 Mois | 30 jours | 19,99€ | Pour une campagne |
| 6 Mois | 180 jours | 49,99€ | Économisez 58% |
| 1 An | 365 jours | 79,99€ | Meilleure valeur |

## Installation

1. Clonez le repository :
```bash
git clone [url-du-repo]
cd charity-frame-app
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
cp .env.example .env
```

4. Éditez le fichier `.env` et ajoutez vos clés Stripe (voir section Configuration Stripe)

## Configuration Stripe

### 1. Créer un compte Stripe

Allez sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)

### 2. Obtenir les clés API

Dans le Dashboard Stripe :
- **Developers** > **API keys**
- Copiez vos clés `Publishable key` et `Secret key`
- Mode Test : `pk_test_...` et `sk_test_...`
- Mode Live : `pk_live_...` et `sk_live_...`
- Ajoutez-les dans le fichier `.env`

### 3. Créer les produits et prix

Dans le Dashboard Stripe :

1. **Products** > **Add product**
2. Créez un produit pour chaque plan payant :
   - **24 Heures** - 2,99€
   - **7 Jours** - 9,99€ (cochez "Popular")
   - **1 Mois** - 19,99€
   - **6 Mois** - 49,99€
   - **1 An** - 79,99€

3. Pour chaque produit, notez le **Price ID** (format `price_xxxxx`)

4. Mettez à jour les Price IDs dans `src/config.js` :
```javascript
STRIPE_PRICE_24H_TEST: 'price_test_xxxxx'
STRIPE_PRICE_7DAYS_TEST: 'price_test_xxxxx'
// etc...
```

### 4. Configurer les Webhooks (Production uniquement)

Dans le Dashboard Stripe :
- **Developers** > **Webhooks** > **Add endpoint**
- URL : `https://api.myframe.flowkraftagency.com/api/webhook/stripe`
- Événements à écouter : `checkout.session.completed`
- Copiez le **Webhook Secret** (`whsec_xxxxx`)
- Ajoutez-le dans `.env` : `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

## Démarrage de l'application

L'application nécessite deux serveurs : le frontend (Vite) et le backend (Express).

**Terminal 1 - Frontend :**
```bash
npm run dev
```
Frontend : [http://localhost:5174](http://localhost:5174)

**Terminal 2 - Backend :**
```bash
npm run server
```
Backend : [http://localhost:3001](http://localhost:3001)

### Vérification

- Frontend : [http://localhost:5174](http://localhost:5174)
- Backend API : [http://localhost:3001/api/health](http://localhost:3001/api/health)
- Stripe configuré : Vérifiez la console du backend (doit afficher "✅ Configuré")

## Structure du projet

```
charity-frame-app/
├── src/                          # Code source frontend
│   ├── components/
│   │   ├── Home.jsx             # Page d'accueil
│   │   ├── FrameUploader.jsx    # Upload de cadre avec modal pricing
│   │   ├── PhotoEditor.jsx      # Éditeur avec warnings d'expiration
│   │   ├── PricingModal.jsx     # Modal de sélection de plan
│   │   ├── ExpirationWarning.jsx # Pop-up d'avertissement
│   │   └── Success.jsx          # Page de succès après paiement
│   ├── config.js                # Configuration (URLs, plans, Stripe)
│   └── App.jsx                  # Configuration des routes
├── server/                      # Code source backend
│   ├── index.js                 # Serveur Express + Stripe
│   ├── uploads/                 # Cadres uploadés
│   └── frames.json              # Base de données des cadres
├── .env                         # Variables d'environnement (à créer)
├── .env.example                 # Template des variables
└── package.json
```

## Variables d'environnement

### Frontend (.env)
```env
# URLs
VITE_API_URL=http://localhost:3001
VITE_FRONTEND_URL=http://localhost:5174

# Stripe Public Keys
VITE_STRIPE_PUBLIC_KEY_TEST=pk_test_...
VITE_STRIPE_PUBLIC_KEY_LIVE=pk_live_...
```

### Backend (.env)
```env
# Environment
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:5174
API_URL=http://localhost:3001
PORT=3001

# Stripe Secret Keys
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Déploiement sur LWS / cPanel

### 1. Build du frontend
```bash
npm run build
```

Le dossier `dist/` contient les fichiers statiques à déployer.

### 2. Configuration cPanel

#### Frontend (app.myframe.flowkraftagency.com)
1. Uploadez le contenu de `dist/` via FTP
2. Pointez le domaine vers ce dossier

#### Backend (api.myframe.flowkraftagency.com)
1. Uploadez le dossier `server/` via FTP
2. Créez une application Node.js dans cPanel
3. Point d'entrée : `server/index.js`
4. Variables d'environnement : Ajoutez toutes les variables du `.env`

### 3. Variables d'environnement de production

Remplacez dans votre `.env` de production :

**Frontend :**
```env
VITE_API_URL=https://api.myframe.flowkraftagency.com
VITE_FRONTEND_URL=https://app.myframe.flowkraftagency.com
VITE_STRIPE_PUBLIC_KEY_LIVE=pk_live_...
```

**Backend :**
```env
NODE_ENV=production
FRONTEND_URL=https://app.myframe.flowkraftagency.com
API_URL=https://api.myframe.flowkraftagency.com
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Configurer le Webhook Stripe en production

Dans Stripe Dashboard :
- URL : `https://api.myframe.flowkraftagency.com/api/webhook/stripe`
- Événement : `checkout.session.completed`

## API Endpoints

### Cadres
- `POST /api/frames/upload` - Upload un nouveau cadre (gratuit 1h)
- `GET /api/frames/:id` - Récupère un cadre (vérifie expiration)
- `GET /api/frames` - Liste tous les cadres actifs

### Paiements
- `POST /api/checkout/create-session` - Créer une session Stripe Checkout
- `POST /api/webhook/stripe` - Webhook pour les paiements confirmés

### Utilitaires
- `GET /api/health` - Santé du serveur

## Technologies utilisées

### Frontend
- React 19
- React Router DOM
- Konva / React Konva (édition d'image)
- Stripe.js (paiements)
- Tailwind CSS
- Vite

### Backend
- Express 5
- Stripe SDK (paiements)
- Multer (gestion des uploads)
- CORS
- dotenv

## Développement

### Mode Test Stripe
- Utilisez les clés de test (`pk_test_` et `sk_test_`)
- Carte de test : `4242 4242 4242 4242`
- Date d'expiration : n'importe quelle date future
- CVC : n'importe quel 3 chiffres

### Mode Production Stripe
- Activez votre compte Stripe
- Utilisez les clés live (`pk_live_` et `sk_live_`)
- Configurez le webhook avec l'URL de production

## Notes importantes

- Les cadres gratuits expirent après **1 heure**
- Les pop-ups d'avertissement apparaissent **15 minutes avant** expiration
- Stripe gère tous les paiements de manière sécurisée
- Les cadres sont stockés dans `server/uploads/`
- Les métadonnées dans `server/frames.json`

## Support

Pour toute question ou problème :
- Documentation Stripe : [https://stripe.com/docs](https://stripe.com/docs)
- Issues GitHub : [Créer une issue](#)

## Licence

MIT
