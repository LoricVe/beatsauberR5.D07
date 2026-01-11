# Beat Saber - Version Web Three.js

Version web du célèbre jeu de rythme Beat Saber, développée avec Three.js.

## Description

Beat Saber est un jeu de rythme immersif où le joueur doit découper des cubes colorés au rythme de la musique, en suivant des directions précises. Cette adaptation web conserve les mécaniques de gameplay principales tout en les adaptant aux interactions souris/clavier d'un navigateur.

## Fonctionnalités

### Gameplay
- Découpage de cubes colorés (rouge et bleu) avec des sabres laser virtuels
- Système de directions (haut, bas, gauche, droite, diagonales)
- Détection de collision précise avec raycasting
- Système de combo et multiplicateur de score
- Effets visuels et particules lors des impacts

### Niveaux de Difficulté
- **Débutant**: Cubes espacés, rythme lent (vitesse 0.8x)
- **Normal**: Rythme moyen, directions variées (vitesse 1.0x)
- **Expert**: Rythme rapide, patterns complexes (vitesse 1.3x)
- **Expert+**: Très rapide, nombreux obstacles (vitesse 1.6x)

### Système de Scoring
- Découpe parfaite: +115 points
- Bonne découpe: +100 points
- Découpe correcte: +70 points
- Cube manqué: -10 points
- Mauvaise couleur: -20 points
- Multiplicateurs de combo: x2, x3, x4

### Contrôles
- **Souris**: Déplacement des sabres laser
- **Clic gauche**: Activation du sabre gauche (bleu)
- **Clic droit**: Activation du sabre droit (rouge)
- **V**: Changer de vue caméra
- **R**: Réinitialiser la position de la caméra
- **Espace**: Pause/Reprendre
- **Échap**: Retour au menu

### Effets Visuels
- Environnement néon cyberpunk
- Bloom et post-processing
- Particules lors des découpes réussies
- Trail effect sur les sabres laser
- Éclairage dynamique

## Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Lancement en mode développement

```bash
npm run dev
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
