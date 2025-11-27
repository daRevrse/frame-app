# Cadre Caritatif - Application de Partage de Cadres Photo

Application permettant d'uploader des cadres personnalisés et de les partager avec d'autres utilisateurs pour qu'ils ajoutent leurs photos.

## Fonctionnalités

- **Créer un cadre** : Uploadez votre propre cadre et obtenez un lien de partage unique
- **Utiliser un cadre** : Ajoutez votre photo dans un cadre partagé
- **Partage permanent** : Les cadres sont stockés sur le serveur et accessibles à tous
- **Édition photo** : Déplacez, zoomez et ajustez votre photo dans le cadre
- **Téléchargement** : Téléchargez le résultat final en haute qualité

## Installation

1. Installez les dépendances :
```bash
npm install
```

## Démarrage de l'application

L'application nécessite deux serveurs : le frontend (Vite) et le backend (Express).

### Option 1 : Démarrage dans deux terminaux séparés

**Terminal 1 - Frontend :**
```bash
npm run dev
```
Le frontend sera accessible sur [http://localhost:5174](http://localhost:5174)

**Terminal 2 - Backend :**
```bash
npm run server
```
Le backend sera accessible sur [http://localhost:3001](http://localhost:3001)

### Vérification

- Frontend : [http://localhost:5174](http://localhost:5174)
- Backend API : [http://localhost:3001/api/health](http://localhost:3001/api/health)

## Utilisation

### Pour créer et partager un cadre :

1. Ouvrez l'application à [http://localhost:5174](http://localhost:5174)
2. Cliquez sur "Créer un Cadre"
3. Uploadez votre image de cadre (PNG avec transparence recommandé)
4. Copiez le lien de partage généré
5. Partagez ce lien avec vos amis

### Pour utiliser un cadre partagé :

1. Cliquez sur le lien partagé (ex: `http://localhost:5174/?frame=abc123`)
2. Uploadez votre photo
3. Ajustez la position avec la souris (glisser-déposer)
4. Zoomez avec la molette de la souris ou le pinch sur mobile
5. Cliquez sur "Télécharger" pour sauvegarder le résultat

## Structure du projet

```
charity-frame-app/
├── src/                    # Code source frontend
│   ├── components/
│   │   ├── Home.jsx       # Page d'accueil
│   │   ├── FrameUploader.jsx  # Upload de cadre
│   │   └── PhotoEditor.jsx    # Éditeur de photo
│   └── App.jsx            # Configuration des routes
├── server/                # Code source backend
│   ├── index.js          # Serveur Express
│   ├── uploads/          # Cadres uploadés
│   └── frames.json       # Base de données des cadres
└── public/               # Fichiers statiques
```

## API Backend

### Endpoints disponibles

- `POST /api/frames/upload` - Upload un nouveau cadre
- `GET /api/frames/:id` - Récupère les informations d'un cadre
- `GET /api/frames` - Liste tous les cadres
- `GET /api/health` - Vérifie l'état du serveur

## Technologies utilisées

### Frontend
- React 19
- React Router DOM
- Konva / React Konva (pour l'édition d'image)
- Tailwind CSS
- Vite

### Backend
- Express 5
- Multer (gestion des uploads)
- CORS

## Notes importantes

- Les cadres sont stockés dans le dossier `server/uploads/`
- Les métadonnées des cadres sont dans `server/frames.json`
- Taille maximale des fichiers : 10MB
- Formats acceptés : JPG, PNG, GIF, WebP

## Développement

Pour le développement, assurez-vous de lancer les deux serveurs (frontend et backend) simultanément.

## Production

Pour déployer en production :

1. Buildez le frontend :
```bash
npm run build
```

2. Configurez les URLs de production dans les fichiers suivants :
   - `src/components/FrameUploader.jsx` (ligne 29 et 38)
   - `src/components/PhotoEditor.jsx` (ligne 66)
   - `server/index.js` (lignes 85, 102, 125)

3. Déployez le serveur backend et le build du frontend sur votre hébergement

## Licence

MIT
