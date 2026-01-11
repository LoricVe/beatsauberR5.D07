# Démarrage Rapide - Beat Saber Three.js

## Installation et Lancement en 3 Étapes

### 1. Installation des Dépendances

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
npm install
```

Cette commande va installer :
- Three.js (r170) pour le rendu 3D
- Vite pour le serveur de développement

### 2. Lancement du Jeu

Une fois l'installation terminée, lancez le serveur de développement :

```bash
npm run dev
```

Le jeu sera automatiquement ouvert dans votre navigateur par défaut à l'adresse : [http://localhost:5173](http://localhost:5173)

### 3. Jouer !

- Cliquez sur le bouton "Démarrer le Jeu"
- Utilisez votre souris pour contrôler les sabres laser
- Clic gauche = sabre bleu (gauche)
- Clic droit = sabre rouge (droite)
- Découpez les cubes de la bonne couleur dans la bonne direction !

---

## Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances |
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Créer un build de production |
| `npm run preview` | Prévisualiser le build de production |

---

## Contrôles du Jeu

### Souris
- **Déplacement** : Contrôle les deux sabres laser
- **Clic gauche** : Active le sabre bleu (gauche)
- **Clic droit** : Active le sabre rouge (droite)

### Clavier
- **V** : Changer de vue caméra
- **R** : Réinitialiser la caméra
- **Espace** : Pause/Reprendre
- **Échap** : Menu principal

---

## Configuration Système Recommandée

### Minimum
- Processeur : Intel Core i3 / AMD équivalent
- RAM : 4 GB
- Navigateur : Chrome 90+, Firefox 88+, Edge 90+
- Connexion : Internet (pour charger Three.js via CDN)

### Recommandé
- Processeur : Intel Core i5 / AMD équivalent
- RAM : 8 GB
- Carte graphique : Carte dédiée avec support WebGL 2.0
- Navigateur : Version la plus récente de Chrome ou Edge
- Écran : 1920x1080 ou supérieur

---

## Dépannage Rapide

### Le serveur ne démarre pas
```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules
npm install
npm run dev
```

### Le jeu ne charge pas
- Vérifiez votre connexion Internet (Three.js est chargé via CDN)
- Actualisez la page (F5)
- Videz le cache du navigateur (Ctrl + Shift + Delete)

### Performances faibles
- Fermez les autres onglets du navigateur
- Fermez les applications inutiles
- Utilisez Chrome ou Edge pour de meilleures performances
- Vérifiez que l'accélération matérielle est activée dans votre navigateur

### L'audio ne fonctionne pas
- Vérifiez le volume système
- Autorisez la lecture audio sur le site (certains navigateurs bloquent l'audio automatique)
- Cliquez dans la fenêtre du jeu pour lui donner le focus

---

## Structure du Projet

```
beatsauber/
├── index.html              # Page principale
├── package.json           # Configuration npm
├── vite.config.js         # Configuration Vite
├── README.md              # Documentation complète
├── GUIDE.md               # Guide du joueur
├── LIVRABLE.md           # Document de conformité
├── DEMARRAGE_RAPIDE.md   # Ce fichier
└── src/
    ├── main.js           # Point d'entrée
    ├── GameManager.js    # Logique du jeu
    ├── CubeManager.js    # Gestion des cubes
    ├── SaberController.js # Contrôle des sabres
    ├── LevelManager.js   # Gestion des niveaux
    ├── AudioManager.js   # Gestion audio
    ├── ParticleSystem.js # Effets de particules
    ├── CameraController.js # Contrôle caméra
    └── UIManager.js      # Interface utilisateur
```

---

## Prochaines Étapes

1. **Testez le jeu** sur [http://localhost:5173](http://localhost:5173)
2. **Lisez le GUIDE.md** pour apprendre toutes les mécaniques
3. **Consultez le README.md** pour la documentation technique complète
4. **Essayez tous les niveaux** de difficulté (Débutant à Expert+)
5. **Explorez les différentes vues caméra** avec la touche V

---

## Build pour Production

Pour créer une version optimisée pour le déploiement :

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

Pour tester le build de production localement :

```bash
npm run preview
```

---

## Déploiement

Le projet peut être déployé gratuitement sur :
- **GitHub Pages** : Hébergement gratuit via GitHub
- **Netlify** : Drag & drop le dossier dist/
- **Vercel** : Connexion directe avec le repo GitHub

---

## Support

Pour toute question ou problème :
1. Consultez le README.md pour la documentation complète
2. Consultez le GUIDE.md pour l'aide au gameplay
3. Vérifiez la console du navigateur (F12) pour les erreurs
4. Consultez le LIVRABLE.md pour les détails techniques

---

## Bon Jeu ! 🎮✨

Profitez de votre expérience Beat Saber en 3D ! N'hésitez pas à essayer tous les niveaux de difficulté et à viser le rang SS !
