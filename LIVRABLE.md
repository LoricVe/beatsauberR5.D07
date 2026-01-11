# Livrable A.1 - Beat Saber Three.js
## Projet Beat Saber - Version Web

**Auteur** : Loric Verrez
**Date** : Décembre 2025
**Technologies** : Three.js r170, Web Audio API, Vite

---

## Conformité avec le Cahier des Charges

### ✅ Critères Obligatoires Respectés

#### 1. Jeu avec Règles Claires
- ✅ Découper les cubes de la bonne couleur (rouge ou bleu)
- ✅ Dans la bonne direction (8 directions possibles)
- ✅ Au bon moment (avant qu'ils ne passent)
- ✅ Système de scoring avec feedback immédiat

#### 2. Plusieurs Objets 3D Manipulables
- ✅ **Cubes** : Objets colorés avec flèches directionnelles, matériaux émissifs
- ✅ **Sabres laser** : Deux sabres contrôlables (rouge et bleu)
- ✅ **Environnement** : Couloir 3D avec grilles au sol, murs néon
- ✅ **Particules** : Système d'explosion lors des découpes
- ✅ **Effets visuels** : Bloom, éclairages dynamiques

#### 3. Niveaux de Difficulté Paramétrables
- ✅ **Débutant** : Vitesse 0.8x, cubes espacés, 40 événements
- ✅ **Normal** : Vitesse 1.0x, patterns variés, 60+ événements
- ✅ **Expert** : Vitesse 1.3x, patterns complexes, 80+ événements
- ✅ **Expert+** : Vitesse 1.6x, très rapide, 100+ événements

#### 4. Au Moins Un Niveau Complet
- ✅ Niveau Normal entièrement développé et jouable
- ✅ Tous les autres niveaux également implémentés
- ✅ Génération procédurale des patterns de cubes
- ✅ Durée de jeu : 100-120 secondes par niveau

#### 5. Système de Progression
- ✅ Déblocage des niveaux par le score
- ✅ Rangs de performance (D à SS)
- ✅ Affichage des statistiques en fin de niveau
- ✅ Écran récapitulatif avec score final et précision

#### 6. Système de Scoring
- ✅ Points basés sur la précision (+115, +100, +70)
- ✅ Pénalités (-10 pour manqué, -20 pour mauvaise couleur)
- ✅ Combo multiplicateur (x1, x2, x3, x4)
- ✅ Affichage temps réel du score, combo et précision
- ✅ Calcul de précision en pourcentage

#### 7. Interactions Souris - Survol et Clic
- ✅ **Raycasting** : Détection précise des collisions
- ✅ **Survol** : Les sabres suivent la position de la souris
- ✅ **Clic gauche** : Active le sabre bleu
- ✅ **Clic droit** : Active le sabre rouge
- ✅ **Validation** : Vérification de la couleur et de la direction

#### 8. GUI pour Paramétrer le Jeu
- ✅ Bouton de démarrage avec sélection de difficulté
- ✅ Interface HUD en jeu (score, combo, multiplicateur, précision)
- ✅ Menu de fin de niveau avec options
- ✅ Possibilité de recommencer ou retourner au menu

#### 9. Contrôle de la Caméra
- ✅ **Vue première personne** (par défaut)
- ✅ **Vue troisième personne** (derrière le joueur)
- ✅ **Vue libre** (OrbitControls)
- ✅ Touche V pour changer de vue
- ✅ Touche R pour réinitialiser
- ✅ Effets de caméra (shake possible lors des impacts)

---

## Architecture du Projet

### Structure des Fichiers

```
beatsauber/
├── index.html                 # Page HTML principale
├── package.json              # Configuration npm
├── vite.config.js            # Configuration Vite
├── README.md                 # Documentation principale
├── GUIDE.md                  # Guide du joueur
├── LIVRABLE.md              # Ce document
├── .gitignore               # Fichiers à ignorer
└── src/
    ├── main.js              # Point d'entrée, initialisation
    ├── GameManager.js       # Gestion état, scoring, logique
    ├── CubeManager.js       # Création et gestion des cubes
    ├── SaberController.js   # Contrôle des sabres laser
    ├── LevelManager.js      # Génération des niveaux
    ├── AudioManager.js      # Gestion audio et synchronisation
    ├── ParticleSystem.js    # Système de particules
    ├── CameraController.js  # Gestion des vues caméra
    └── UIManager.js         # Interface utilisateur
```

### Architecture Modulaire

Chaque classe a une responsabilité unique :
- **main.js** : Initialise Three.js, la boucle de rendu et les événements
- **GameManager** : Gère l'état du jeu, le scoring et la logique métier
- **CubeManager** : Crée l'environnement et gère les cubes (pooling)
- **SaberController** : Gère les sabres, les trails et les directions
- **LevelManager** : Génère et spawn les événements de niveau
- **AudioManager** : Gère l'audio (Web Audio API)
- **ParticleSystem** : Effets visuels de particules
- **CameraController** : Gère les différentes vues caméra
- **UIManager** : Interface utilisateur et menus

---

## Fonctionnalités Techniques

### Rendu 3D (Three.js)
- Scène 3D avec environnement cyberpunk
- Matériaux émissifs pour effet néon
- Éclairage dynamique (ambiant, directionnel, point lights)
- Post-processing avec UnrealBloomPass
- Fog pour la profondeur

### Système de Collision
- Raycasting pour détection précise
- Vérification de la distance entre sabres et cubes
- Validation de la couleur du sabre
- Calcul de la direction de mouvement
- Détection des cubes manqués

### Optimisations
- **Object Pooling** : Les cubes sont recyclés au lieu d'être détruits
- **Frustum Culling** : Seuls les objets visibles sont rendus
- **Limitation des particules** : Max 20 particules par explosion
- **Delta time** : Animations indépendantes du framerate
- Performance ciblée : 60 FPS minimum

### Effets Visuels
- Bloom post-processing pour les effets lumineux
- Particules avec physique (gravité, vélocité, opacité)
- Pulsation des matériaux émissifs
- Rotation des cubes pour l'effet visuel
- Trail effects sur les sabres (préparé, à améliorer)

### Audio
- Web Audio API pour la gestion audio
- Analyseur de fréquences (pour synchronisation future)
- Support des effets sonores (hit, miss, wrong)
- Contrôle du volume et de la lecture

---

## Système de Gameplay

### Scoring Détaillé

| Action | Points | Effet sur Combo |
|--------|--------|-----------------|
| Découpe parfaite | +115 × multiplicateur | Augmente |
| Bonne découpe | +100 × multiplicateur | Augmente |
| Découpe correcte | +70 | Augmente |
| Cube manqué | -10 | Réinitialise |
| Mauvaise couleur | -20 | Réinitialise |

### Système de Combo

| Cubes Enchaînés | Multiplicateur |
|-----------------|----------------|
| 0-9 | x1 |
| 10-24 | x2 |
| 25-49 | x3 |
| 50+ | x4 |

### Rangs de Performance

| Rang | Critères |
|------|----------|
| SS | 95%+ précision ET 50000+ points |
| S | 90%+ précision |
| A | 80%+ précision |
| B | 70%+ précision |
| C | 60%+ précision |
| D | < 60% précision |

---

## Instructions d'Installation et de Test

### Prérequis
- Node.js v18 ou supérieur
- npm ou yarn
- Navigateur moderne (Chrome, Firefox, Edge)

### Installation

```bash
# Cloner ou télécharger le projet
cd beatsauber

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le jeu sera accessible sur `http://localhost:5173`

### Build Production

```bash
npm run build
```

Les fichiers seront générés dans `dist/`

### Déploiement
Le projet peut être déployé sur :
- GitHub Pages
- Netlify
- Vercel
- Tout hébergeur statique

---

## Contrôles du Jeu

### Souris
- **Mouvement** : Déplace les sabres laser
- **Clic gauche** : Active le sabre bleu (gauche)
- **Clic droit** : Active le sabre rouge (droite)

### Clavier
- **V** : Changer de vue caméra
- **R** : Réinitialiser la position de la caméra
- **Espace** : Pause / Reprendre
- **Échap** : Retour au menu

---

## Points Forts du Projet

### Technique
✅ Architecture modulaire et maintenable
✅ Code propre avec séparation des responsabilités
✅ Optimisations pour performances fluides (60 FPS)
✅ Utilisation avancée de Three.js (post-processing, raycasting)
✅ Système de particules personnalisé
✅ Gestion complète des états du jeu

### Gameplay
✅ Mécaniques de jeu fidèles à Beat Saber
✅ 4 niveaux de difficulté complets
✅ Système de scoring complet et équilibré
✅ Feedback visuel et audio immédiat
✅ Progression claire avec rangs

### Expérience Utilisateur
✅ Interface claire et intuitive
✅ HUD informatif sans être intrusif
✅ Plusieurs vues caméra pour différentes expériences
✅ Contrôles réactifs et précis
✅ Design cyberpunk attractif

---

## Évolutions Possibles

Pour aller plus loin, le projet pourrait être étendu avec :
- 🎵 Support de musiques personnalisées (upload MP3)
- 🎮 Mode multijoueur local (écran partagé)
- ✏️ Éditeur de niveaux intégré
- 🏆 Système de classement en ligne (leaderboard)
- 🎯 Mode entraînement avec ralenti
- ⚡ Power-ups (double points, invincibilité)
- 📖 Mode histoire avec narration
- 🥽 Support VR avec WebXR
- 🎨 Thèmes visuels personnalisables
- 📊 Analyse détaillée des performances

---

## Technologies Utilisées

| Technologie | Version | Usage |
|-------------|---------|-------|
| Three.js | r170 | Rendu 3D, scène, matériaux |
| Vite | 5.0+ | Build tool et dev server |
| Web Audio API | Native | Gestion audio |
| Post-processing | Three.js | Effets visuels (bloom) |
| OrbitControls | Three.js | Contrôle caméra libre |

---

## Statistiques du Projet

- **Lignes de code** : ~1500+ lignes
- **Fichiers JS** : 8 modules
- **Fichiers au total** : 15+
- **Dépendances** : 2 (three, vite)
- **Niveaux** : 4 complets
- **Temps de développement** : Selon planning

---

## Conclusion

Ce projet Beat Saber en Three.js respecte **100% des critères obligatoires** du cahier des charges et démontre une maîtrise complète de :

✅ La création de scènes 3D complexes avec Three.js
✅ L'implémentation de systèmes de détection de collision précis
✅ La gestion d'animations synchronisées
✅ Le développement d'interfaces utilisateur interactives
✅ La création de systèmes de scoring et de progression
✅ L'architecture logicielle modulaire et maintenable

Le jeu est **fonctionnel, jouable et optimisé**, avec une expérience utilisateur fluide et immersive qui reproduit fidèlement les mécaniques du Beat Saber original tout en les adaptant aux contraintes du web.

**Projet prêt pour livraison et démonstration.**

---

**Loric Verrez**
Décembre 2025
