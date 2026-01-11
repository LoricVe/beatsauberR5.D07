# 🎮 Changements Version 1.5 - Système Dual Mode

## ✨ Nouveautés Majeures

### 🎯 Système Dual Mode Implémenté

Le jeu propose maintenant **deux modes de jeu distincts** :

1. **🥽 Mode VR** - Pour casques VR (Meta Quest, Valve Index, etc.)
2. **🖱️ Mode Clavier/Souris** - Pour jouer au bureau sans VR

---

## 📁 Nouveaux Fichiers

### 1. GameModeManager.js
**Localisation :** `src/GameModeManager.js`

**Rôle :** Gère la sélection et la configuration des modes de jeu

**Fonctionnalités :**
```javascript
- checkVRSupport() : Détecte automatiquement le support WebXR
- setMode(mode) : Définit le mode actuel ('vr' ou 'keyboard-mouse')
- getMode() : Retourne le mode actuel
- isVRMode() : Vérifie si on est en mode VR
- isKeyboardMouseMode() : Vérifie si on est en mode Clavier/Souris
- isVRSupported() : Retourne si le VR est supporté
- getModeConfig() : Retourne la configuration du mode actuel
```

**Code clé :**
```javascript
async checkVRSupport() {
    if ('xr' in navigator) {
        try {
            this.vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        } catch (error) {
            console.log('VR not supported:', error);
            this.vrSupported = false;
        }
    }
}
```

---

## 🔧 Fichiers Modifiés

### 1. UIManager.js
**Changements majeurs :**

#### Import du GameModeManager
```javascript
import { GameModeManager } from './GameModeManager.js';
```

#### Nouveau constructeur
```javascript
constructor(gameManager) {
    this.gameManager = gameManager;
    this.gameModeManager = new GameModeManager(); // NOUVEAU
    this.selectedMode = null; // NOUVEAU
    // ...
}
```

#### Nouvelle méthode : createModeSelection()
Remplace l'ancien `createStartButton()` et affiche :
- Bouton "🥽 Mode VR" (rose/magenta)
- Bouton "🖱️ Mode Clavier/Souris" (vert/cyan)
- Désactive automatiquement le bouton VR si non supporté
- Affiche un message d'avertissement si VR non disponible

**Design :**
```javascript
// Mode VR
background: linear-gradient(135deg, #ff006644 0%, #ff006688 100%);
border: 2px solid #ff0066;

// Mode Clavier/Souris
background: linear-gradient(135deg, #00ff8844 0%, #00ff8888 100%);
border: 2px solid #00ff88;
```

#### Nouvelle méthode : showDifficultySelection(container)
Affiche après le choix du mode :
- Titre "BEAT SABER"
- Info du mode sélectionné (ex: "Mode: Clavier/Souris")
- Les 4 boutons de difficulté (Débutant, Normal, Expert, Expert+)
- Bouton "← Retour" pour revenir à la sélection du mode
- Info des contrôles adaptée au mode choisi

**Info contrôles selon le mode :**
```javascript
// Mode VR
<p>Manettes VR : Déplacer pour découper les cubes</p>
<p>Position 6DOF : Mouvement complet dans l'espace</p>
<p>Toutes difficultés : Couleur + Direction requises</p>

// Mode Clavier/Souris
<p>Souris : Déplacer les sabres pour découper</p>
<p>Débutant/Normal : Juste la bonne couleur</p>
<p>Expert/Expert+ : Couleur + Direction de la flèche</p>
<p>V : Changer vue | Espace : Pause | Échap : Menu</p>
```

#### Bouton Retour
```javascript
backBtn.addEventListener('click', () => {
    this.createModeSelection();
    container.remove();
});
```

### 2. GameManager.js
**Changements :**

#### Nouveau paramètre dans le constructeur
```javascript
constructor(scene, camera, raycaster) {
    // ...
    this.currentGameMode = 'keyboard-mouse'; // NOUVEAU : Mode par défaut
}
```

#### Méthode startGame() mise à jour
```javascript
// AVANT
startGame(difficulty = 'normal') {
    this.currentDifficulty = difficulty;
    // ...
}

// APRÈS
startGame(difficulty = 'normal', gameMode = 'keyboard-mouse') {
    this.currentDifficulty = difficulty;
    this.currentGameMode = gameMode; // NOUVEAU

    console.log(`Starting game - Mode: ${gameMode}, Difficulty: ${difficulty}`);
    // ...
}
```

---

## 🎨 Interface Utilisateur

### Écran 1 : Sélection du Mode

```
┌────────────────────────────────────────────┐
│                                            │
│            BEAT SABER                      │
│          Version Three.js                  │
│                                            │
│    Choisissez votre mode de jeu :         │
│                                            │
│   ╔══════════════════════════════════╗    │
│   ║     🥽 Mode VR                   ║    │
│   ╚══════════════════════════════════╝    │
│        (Rose/Magenta #ff0066)             │
│                                            │
│   ╔══════════════════════════════════╗    │
│   ║  🖱️ Mode Clavier/Souris          ║    │
│   ╚══════════════════════════════════╝    │
│        (Vert/Cyan #00ff88)                │
│                                            │
│   [Si VR non supporté:]                   │
│   VR non supporté sur cet appareil        │
│                                            │
└────────────────────────────────────────────┘
```

### Écran 2 : Sélection de la Difficulté

```
┌────────────────────────────────────────────┐
│                                            │
│            BEAT SABER                      │
│       Mode: Clavier/Souris                 │
│                                            │
│    Choisissez votre difficulté :          │
│                                            │
│   ┌──────────────────────────────────┐    │
│   │      Débutant (#00ff88)          │    │
│   └──────────────────────────────────┘    │
│   ┌──────────────────────────────────┐    │
│   │      Normal (#88ccff)            │    │
│   └──────────────────────────────────┘    │
│   ┌──────────────────────────────────┐    │
│   │      Expert (#ffaa00)            │    │
│   └──────────────────────────────────┘    │
│   ┌──────────────────────────────────┐    │
│   │      Expert+ (#ff0088)           │    │
│   └──────────────────────────────────┘    │
│                                            │
│   ┌──────────────────────────────────┐    │
│   │       ← Retour                   │    │
│   └──────────────────────────────────┘    │
│                                            │
│   Contrôles :                             │
│   [Info selon le mode choisi]             │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🎮 Flux de Navigation

```
Lancement
   ↓
Menu Principal (Mode Selection)
   ├─→ Clic sur "Mode VR"
   │   └─→ Écran Difficulté (info VR)
   │       ├─→ Sélection difficulté → Jeu (VR mode)
   │       └─→ Bouton Retour → Menu Principal
   │
   └─→ Clic sur "Mode Clavier/Souris"
       └─→ Écran Difficulté (info Souris)
           ├─→ Sélection difficulté → Jeu (Mouse mode)
           └─→ Bouton Retour → Menu Principal
```

---

## 📊 Comparaison des Modes

| Caractéristique | Mode VR | Mode Clavier/Souris |
|----------------|---------|---------------------|
| **Matériel** | Casque VR requis | Souris standard |
| **Coût** | 300-1000€ | Gratuit |
| **Setup** | WebXR Session | Immédiat |
| **Contrôles** | Manettes 6DOF | Souris 2D |
| **Direction Check** | Toutes difficultés | Expert/Expert+ seulement |
| **Sabres** | Indépendants | Liés (espacés de 2.4u) |
| **Vue** | Première personne | Troisième personne |
| **Immersion** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Accessibilité** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔍 Détection VR

### Code de Détection

```javascript
async checkVRSupport() {
    if ('xr' in navigator) {
        try {
            this.vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
            console.log('VR Support:', this.vrSupported);
        } catch (error) {
            console.log('VR not supported:', error);
            this.vrSupported = false;
        }
    } else {
        console.log('WebXR not available');
        this.vrSupported = false;
    }
}
```

### Résultats Possibles

**VR Supporté :**
- `navigator.xr` existe
- `isSessionSupported('immersive-vr')` retourne `true`
- Casque VR détecté
- Bouton "Mode VR" activé et cliquable

**VR Non Supporté :**
- `navigator.xr` n'existe pas OOOU
- `isSessionSupported('immersive-vr')` retourne `false`
- Pas de casque VR
- Bouton "Mode VR" désactivé et grisé
- Message "VR non supporté sur cet appareil"

---

## 💻 Navigateurs Compatibles WebXR

### ✅ Support Complet
- **Chrome/Edge** (Desktop + Android)
- **Oculus Browser** (Meta Quest)

### ⚠️ Support Partiel
- **Firefox** (Desktop + Android avec flag expérimental)
- **Safari** (En développement, support limité)

### ❌ Non Supporté
- Internet Explorer
- Navigateurs mobiles anciens

---

## 🎯 Configurations des Modes

### Mode VR
```javascript
{
    name: 'VR Mode',
    description: 'Expérience Beat Saber authentique avec casque VR',
    controls: {
        movement: 'Manettes VR',
        sabers: 'Position et rotation des manettes',
        collision: 'Précise (vraie 3D)',
        difficulty: 'Tous niveaux disponibles'
    },
    gameplay: {
        cubeSpeed: 'Standard',
        saberControl: 'Physique (6DOF)',
        directionCheck: true,
        comboSystem: 'Standard Beat Saber'
    }
}
```

### Mode Clavier/Souris
```javascript
{
    name: 'Clavier/Souris',
    description: 'Mode fun optimisé pour le desktop',
    controls: {
        movement: 'Souris (X/Y)',
        sabers: 'Suivi de la souris',
        collision: 'Tolérante',
        actions: 'Clic gauche/droit pour effets'
    },
    gameplay: {
        cubeSpeed: 'Ajustable',
        saberControl: 'Simplifié (2D/3D)',
        directionCheck: 'Optionnelle selon difficulté',
        comboSystem: 'Simplifié et généreux'
    }
}
```

---

## 🚀 Prochaines Étapes

### Pour Mode VR (À Implémenter)

1. **WebXR Session Setup**
   ```javascript
   async initVRSession() {
       const session = await navigator.xr.requestSession('immersive-vr');
       this.renderer.xr.setSession(session);
   }
   ```

2. **VR Controllers**
   ```javascript
   class VRSaberController {
       setupControllers(xrSession) {
           // Lier les manettes VR aux sabres
       }

       updateFromVRControllers(frame) {
           // Mettre à jour positions des sabres
       }
   }
   ```

3. **Stereo Rendering**
   - Rendu pour œil gauche + œil droit
   - 90 FPS minimum
   - Reprojection asynchrone

4. **VR Gameplay Adjustments**
   - Calibration hauteur joueur
   - Zone de sécurité
   - Distance spawn adaptée
   - Tutoriel VR interactif

---

## ✅ État Actuel

### ✅ Fonctionnel
- ✅ Menu sélection de mode
- ✅ Détection automatique du support VR
- ✅ Bouton VR désactivé si non supporté
- ✅ Message d'avertissement VR
- ✅ Écran sélection difficulté après mode
- ✅ Bouton retour vers sélection mode
- ✅ Info contrôles adaptée au mode
- ✅ GameModeManager intégré
- ✅ Mode passé au GameManager au démarrage
- ✅ Console log pour debug

### 🚧 À Implémenter
- 🚧 Session WebXR pour VR
- 🚧 VR Controllers tracking
- 🚧 Stereo rendering
- 🚧 VR-specific gameplay
- 🚧 Calibration VR
- 🚧 Tutoriel VR

---

## 🎨 Design et Style

### Couleurs

**Mode VR :**
```css
Couleur primaire: #ff0066 (Rose/Magenta)
Couleur secondaire: #ff0088
Gradient: linear-gradient(135deg, #ff006644 0%, #ff006688 100%)
Border: 2px solid #ff0066
Glow hover: 0 0 20px #ff0066
Icône: 🥽
```

**Mode Clavier/Souris :**
```css
Couleur primaire: #00ff88 (Vert/Cyan)
Couleur secondaire: #00ffaa
Gradient: linear-gradient(135deg, #00ff8844 0%, #00ff8888 100%)
Border: 2px solid #00ff88
Glow hover: 0 0 20px #00ff88
Icône: 🖱️
```

**Bouton Retour :**
```css
Background: rgba(255, 255, 255, 0.1)
Border: 1px solid #888
Color: #888
Hover background: rgba(255, 255, 255, 0.2)
Hover color: #fff
```

### Animations

```css
Transition: all 0.3s
Hover: transform: scale(1.05)
Hover: box-shadow avec glow de la couleur du mode
Disabled: opacity: 0.5
Disabled: cursor: not-allowed
```

---

## 📝 Console Logs

Le système affiche maintenant des logs utiles :

```javascript
// Au démarrage
console.log('VR Support:', true/false);

// Si erreur VR
console.log('VR not supported:', error);

// Au lancement du jeu
console.log('Starting game - Mode: keyboard-mouse, Difficulty: normal');
console.log('Starting game - Mode: vr, Difficulty: expert');
```

---

## 🎯 Bénéfices du Système Dual Mode

### Pour les Utilisateurs

1. **Accessibilité**
   - Le jeu est jouable par tous, avec ou sans VR
   - Pas besoin d'investir dans du matériel coûteux

2. **Flexibilité**
   - Choisir selon l'envie du moment
   - VR pour immersion, Souris pour détente

3. **Clarté**
   - Menu clair et guidé
   - Info contrôles adaptée
   - Désactivation auto si VR non dispo

### Pour le Projet

1. **Architecture Modulaire**
   - GameModeManager séparé et réutilisable
   - Facile d'ajouter d'autres modes (ex: Gamepad)

2. **Évolutivité**
   - Base solide pour implémentation VR complète
   - Préparation pour WebXR

3. **User Experience**
   - Détection automatique
   - Guidance claire
   - Pas de confusion

---

## 📚 Documentation

### Nouveaux Fichiers de Documentation

1. **SYSTEME_DUAL_MODE.md**
   - Explication complète du système
   - Architecture technique
   - Comparaison des modes
   - Guide d'implémentation VR future

2. **CHANGEMENTS_V1.5.md** (ce fichier)
   - Liste des changements
   - Code avant/après
   - Guide de migration

---

## 🔄 Migration depuis v1.4

### Si vous utilisez l'ancienne version :

**Aucun changement breaking !**

Le mode par défaut est "keyboard-mouse", donc le jeu fonctionne exactement comme avant si vous ne changez rien.

### Pour utiliser le nouveau système :

1. Le menu affiche maintenant la sélection de mode d'abord
2. Cliquez sur "Mode Clavier/Souris" pour l'expérience actuelle
3. Cliquez sur "Mode VR" si vous avez un casque (fonctionnalité à venir)

---

## ✨ Résumé

**Version 1.5** introduit le **système dual mode** qui :

- ✅ Permet de choisir entre VR et Clavier/Souris
- ✅ Détecte automatiquement le support VR
- ✅ Désactive intelligemment les options non disponibles
- ✅ Guide l'utilisateur avec des menus clairs
- ✅ Prépare l'infrastructure pour l'implémentation VR complète
- ✅ Maintient la compatibilité avec le mode existant

**Le jeu est maintenant accessible à deux publics distincts avec deux expériences optimisées ! 🎮✨**

---

**Version 1.5 - Système Dual Mode**
**Par Loric Verrez - Décembre 2025**
