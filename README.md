# Beat Saber - Version Web Three.js

Version web du célèbre jeu de rythme Beat Saber, développée avec Three.js.

## Demo en ligne

Testez le jeu directement: [https://loricve.github.io/beatsauberR5.D07/](https://loricve.github.io/beatsauberR5.D07/)

## Description

Beat Saber est un jeu de rythme immersif où le joueur doit découper des cubes colorés au rythme de la musique, en suivant des directions précises. Cette adaptation web conserve les mécaniques de gameplay principales tout en les adaptant aux interactions souris/clavier d'un navigateur.

## But du jeu

Le but de BeatSaber est de frapper les cubes qui arrivent à l'écran au bon moment, en rythme avec la musique, pour marquer un maximum de points. Plus vous êtes précis, plus votre score sera élevé. Attention au cooldown entre chaque frappe !

## Fonctionnalités

- Système de score en temps réel
- Plusieurs modes de difficulté (débutant, avancé, expert)
- Redémarrage de la partie sans recharger la page
- Gestion du cooldown entre les frappes de cubes
- Affichage des meilleurs scores
- Effets visuels lors des frappes
- Support clavier

## Contrôles

- **Flèche gauche** : Frapper à gauche
- **Flèche droite** : Frapper à droite
- **Flèche haut** : Frapper en haut
- **Flèche bas** : Frapper en bas
- **Espace** : Démarrer/redémarrer la partie
- **Entrée** : Valider une sélection/menu

## Comment jouer

1. Lancez le jeu.
2. Sélectionnez un mode de difficulté.
3. Utilisez les flèches du clavier pour frapper les cubes dans la direction indiquée lorsqu'ils arrivent sur la ligne cible.
4. Essayez d'enchaîner les frappes précises pour augmenter votre score.
5. Vous pouvez redémarrer la partie à tout moment avec **Espace**.

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/ton-utilisateur/beatsauber-R5.D07.git
   ```
2. Installez les dépendances si nécessaire :
   ```bash
   npm install
   ```
3. Lancez le jeu :
   ```bash
   npm start
   ```

Le jeu sera accessible sur [http://localhost:5173](http://localhost:5173)

### Build pour la production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## Architecture du Projet

```
beatsauber/
├── index.html              # Page principale
├── package.json           # Configuration npm
├── README.md             # Documentation
└── src/
    ├── main.js           # Point d'entrée, initialisation Three.js
    ├── GameManager.js    # Gestion de l'état du jeu et scoring
    ├── CubeManager.js    # Création et gestion des cubes
    ├── SaberController.js # Contrôle des sabres laser
    ├── LevelManager.js   # Chargement et génération des niveaux
    ├── AudioManager.js   # Gestion audio et synchronisation
    ├── ParticleSystem.js # Système de particules
    ├── CameraController.js # Gestion des vues caméra
    └── UIManager.js      # Interface utilisateur et GUI
```

## Technologies Utilisées

- **Three.js (r170)**: Rendu 3D et WebGL
- **Web Audio API**: Lecture et analyse audio
- **Vite**: Build tool et serveur de développement
- **Post-processing**: Effets visuels (bloom, etc.)

## Optimisations

- Object pooling pour les cubes
- Instancing pour objets répétitifs
- Frustum culling
- Limitation des particules
- Performance ciblée: 60 FPS minimum

## Développement

### Structure modulaire
Le projet suit une architecture modulaire avec séparation claire des responsabilités:
- Chaque classe gère un aspect spécifique du jeu
- Communication via événements et callbacks
- Facilite la maintenance et l'évolution

### Évolutions futures possibles
- Mode multijoueur local
- Éditeur de niveaux personnalisés
- Support de musiques personnalisées
- Classement en ligne
- Support VR avec WebXR

## Auteur

**Loric Verrez**

## Licence

MIT

## Déploiement

Le projet peut être déployé sur GitHub Pages:

```bash
npm run build
# Déployez le contenu du dossier dist/
```

## Notes de Développement

Ce projet a été développé dans le cadre d'un TP universitaire sur Three.js et démontre:
- La maîtrise de scènes 3D complexes
- Un système de détection de collision précis
- La synchronisation audio-visuelle
- La création d'une expérience utilisateur fluide et immersive

Livrable conforme au cahier des charges du 17 décembre 2025.
