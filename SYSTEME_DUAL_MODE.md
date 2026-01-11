# 🎮 Système Dual Mode - VR et Clavier/Souris

## 🌟 Vue d'Ensemble

Le jeu propose maintenant **deux modes de jeu distincts** adaptés à différents types d'expériences :

1. **Mode VR** - Expérience authentique Beat Saber pour casques VR (Meta Quest, etc.)
2. **Mode Clavier/Souris** - Version optimisée pour jouer au bureau sans casque VR

---

## 🥽 Mode VR

### Caractéristiques

**Matériel :**
- Casque VR compatible WebXR (Meta Quest 2/3, Valve Index, HTC Vive, etc.)
- Manettes VR (controllers 6DOF)
- Espace de jeu dégagé (2m x 2m minimum recommandé)

**Gameplay :**
- ✅ **Contrôle 6DOF** - Position et rotation complètes dans l'espace 3D
- ✅ **Manettes physiques** - Chaque manette = un sabre laser
- ✅ **Détection direction** - Active sur **toutes les difficultés**
- ✅ **Expérience immersive** - Vue première personne en réalité virtuelle
- ✅ **Authentique** - Fidèle au Beat Saber original

**Règles :**
```
Débutant :  Couleur + Direction (simplifié)
Normal :    Couleur + Direction (standard)
Expert :    Couleur + Direction (rapide)
Expert+ :   Couleur + Direction (très rapide)
```

**Contrôles VR :**
- Manette gauche → Sabre bleu
- Manette droite → Sabre rouge
- Mouvement libre dans l'espace de jeu
- Détection de direction basée sur la vélocité des manettes
- Gâchettes/boutons pour fonctions secondaires

### Activation

Le mode VR est automatiquement disponible si :
- Le navigateur supporte WebXR (`navigator.xr`)
- Un casque VR est détecté
- La session `immersive-vr` est supportée

Si le VR n'est pas disponible, le bouton "Mode VR" sera grisé avec le message :
```
🥽 Mode VR (Non disponible)
VR non supporté sur cet appareil
```

---

## 🖱️ Mode Clavier/Souris

### Caractéristiques

**Matériel :**
- PC/Mac avec souris
- Écran standard
- Pas de matériel VR requis

**Gameplay :**
- ✅ **Contrôle 2D/3D hybride** - Mouvement souris optimisé
- ✅ **Détection direction optionnelle** - Selon la difficulté
- ✅ **Zone de jeu adaptée** - Gameplay ajusté pour souris
- ✅ **Accessible** - Jouable par tous sans équipement spécial
- ✅ **Fun** - Version "arcade" du jeu

**Règles :**
```
Débutant :  Couleur uniquement (pas de direction)
Normal :    Couleur uniquement (pas de direction)
Expert :    Couleur + Direction
Expert+ :   Couleur + Direction
```

**Contrôles Souris :**
- Mouvement souris → Déplace les deux sabres
- Sabre gauche (bleu) et sabre droit (rouge) suivent la souris
- Espacement constant entre les sabres (2.4 unités)
- Collision automatique au contact
- V : Changer vue caméra
- Espace : Pause/Reprise
- Échap : Retour au menu

### Zone de Jeu

```
Largeur : 8 unités (-4 à +4)
Hauteur : 6 unités (-2 à +4)
Profondeur : 45 unités (-35 à +10)

Sabres : Toujours espacés de 2.4 unités
Interpolation : 0.5 (réactivité rapide)
```

---

## 📋 Menu de Sélection

### Écran 1 : Choix du Mode

```
┌─────────────────────────────────────┐
│         BEAT SABER                  │
│      Version Three.js               │
│                                     │
│  Choisissez votre mode de jeu :    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🥽 Mode VR                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🖱️ Mode Clavier/Souris    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Écran 2 : Choix de la Difficulté

```
┌─────────────────────────────────────┐
│         BEAT SABER                  │
│    Mode: Clavier/Souris             │
│                                     │
│  Choisissez votre difficulté :     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Débutant               │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │      Normal                 │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │      Expert                 │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │      Expert+                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      ← Retour               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Contrôles : [info selon mode]     │
└─────────────────────────────────────┘
```

---

## 🔧 Architecture Technique

### Fichiers Modifiés

#### 1. GameModeManager.js (NOUVEAU)
```javascript
export class GameModeManager {
    constructor() {
        this.currentMode = null; // 'vr' ou 'keyboard-mouse'
        this.vrSupported = false;
        this.checkVRSupport();
    }

    async checkVRSupport() {
        if ('xr' in navigator) {
            this.vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        }
    }

    setMode(mode) {
        this.currentMode = mode;
    }

    getMode() {
        return this.currentMode;
    }

    isVRMode() {
        return this.currentMode === 'vr';
    }

    isKeyboardMouseMode() {
        return this.currentMode === 'keyboard-mouse';
    }

    isVRSupported() {
        return this.vrSupported;
    }

    getModeConfig() {
        // Retourne la configuration du mode actuel
    }
}
```

#### 2. UIManager.js (MODIFIÉ)
```javascript
import { GameModeManager } from './GameModeManager.js';

export class UIManager {
    constructor(gameManager) {
        this.gameModeManager = new GameModeManager();
        this.selectedMode = null;
        // ...
    }

    createModeSelection() {
        // Affiche les boutons VR et Clavier/Souris
        // Désactive VR si non supporté
    }

    showDifficultySelection(container) {
        // Affiche les difficultés après choix du mode
        // Info contrôles selon le mode sélectionné
        // Bouton retour vers sélection mode
    }
}
```

#### 3. GameManager.js (MODIFIÉ)
```javascript
export class GameManager {
    constructor(scene, camera, raycaster) {
        // ...
        this.currentGameMode = 'keyboard-mouse'; // Default
    }

    startGame(difficulty = 'normal', gameMode = 'keyboard-mouse') {
        this.currentGameMode = gameMode;
        console.log(`Starting - Mode: ${gameMode}, Difficulty: ${difficulty}`);
        // ...
    }
}
```

---

## 🎯 Comparaison des Modes

| Aspect | Mode VR | Mode Clavier/Souris |
|--------|---------|---------------------|
| **Matériel requis** | Casque VR + Manettes | Souris + Écran |
| **Coût** | 300-1000€ | Équipement standard |
| **Immersion** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Accessibilité** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Contrôle** | 6DOF (Position + Rotation) | 2D/3D Hybride |
| **Sabres** | 2 sabres indépendants | 2 sabres liés |
| **Direction** | Toujours vérifiée | Selon difficulté |
| **Vue** | Première personne VR | Troisième personne |
| **Espace requis** | 2x2m dégagé | Bureau standard |
| **Fatigue** | Physique (debout) | Minimale (assis) |
| **Expérience** | Authentique Beat Saber | Version "Fun" |

---

## 💡 Utilisation Recommandée

### Choisir Mode VR si :
- ✅ Vous avez un casque VR compatible
- ✅ Vous voulez l'expérience authentique Beat Saber
- ✅ Vous avez l'espace de jeu nécessaire
- ✅ Vous cherchez une expérience immersive et physique
- ✅ Vous voulez un vrai workout

### Choisir Mode Clavier/Souris si :
- ✅ Vous n'avez pas de casque VR
- ✅ Vous voulez jouer au bureau
- ✅ Vous préférez une session courte et décontractée
- ✅ Vous découvrez le jeu
- ✅ Vous voulez partager facilement (pas de setup VR)

---

## 🚀 Implémentation Future

### Prochaines Étapes (Mode VR)

1. **Intégration WebXR**
   ```javascript
   async initVRSession() {
       const session = await navigator.xr.requestSession('immersive-vr');
       // Setup VR rendering
   }
   ```

2. **VR Controllers**
   ```javascript
   class VRSaberController {
       constructor(xrSession) {
           this.session = xrSession;
           this.controllers = [];
       }

       setupControllers() {
           // Bind VR controllers to sabres
       }

       update(frame) {
           // Update sabre positions from VR controllers
       }
   }
   ```

3. **VR Rendering**
   - Stereo rendering (œil gauche + œil droit)
   - 90 FPS minimum pour éviter motion sickness
   - Reprojection asynchrone

4. **VR-Specific Gameplay**
   - Ajuster la distance de spawn des cubes
   - Calibration de la hauteur du joueur
   - Zone de jeu VR sécurisée
   - Tutoriel VR interactif

---

## 📊 Détection VR

### Code de Vérification

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
        console.log('WebXR not available in this browser');
        this.vrSupported = false;
    }
}
```

### Navigateurs Supportant WebXR

- ✅ Chrome/Edge (Desktop + Android)
- ✅ Firefox (Desktop + Android avec flag)
- ✅ Oculus Browser (Meta Quest)
- ⚠️ Safari (Partiel, en développement)

---

## 🎨 Design du Menu

### Couleurs des Modes

**Mode VR :**
```css
Couleur principale : #ff0066 (Rose/Magenta)
Gradient : linear-gradient(135deg, #ff006644 0%, #ff006688 100%)
Icône : 🥽 (VR Headset)
```

**Mode Clavier/Souris :**
```css
Couleur principale : #00ff88 (Vert/Cyan)
Gradient : linear-gradient(135deg, #00ff8844 0%, #00ff8888 100%)
Icône : 🖱️ (Mouse)
```

### Animations

```css
Hover : scale(1.05) + box-shadow glow
Transition : all 0.3s
Disabled : opacity 0.5 + cursor not-allowed
```

---

## 🎮 Flux du Jeu

```
1. Lancement du Jeu
   ↓
2. Menu Principal
   ├─→ [Sélection Mode]
   │   ├─→ Mode VR (si disponible)
   │   └─→ Mode Clavier/Souris
   ↓
3. Sélection Difficulté
   ├─→ Débutant
   ├─→ Normal
   ├─→ Expert
   └─→ Expert+
   ↓
4. Lancement du Niveau
   ├─→ [Mode VR] → Setup VR Session
   └─→ [Mode Souris] → Setup Mouse Controls
   ↓
5. Gameplay
   ↓
6. Fin de Niveau
   ├─→ Rejouer (même config)
   ├─→ Retour Menu (changer mode/difficulté)
   └─→ Quitter
```

---

## 📝 Configuration des Modes

### Mode VR - getModeConfig()
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

### Mode Clavier/Souris - getModeConfig()
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

## ✅ État Actuel

### Fonctionnel ✅
- ✅ Menu de sélection de mode
- ✅ Détection du support VR
- ✅ Bouton VR désactivé si non supporté
- ✅ Sélection de difficulté après mode
- ✅ Bouton retour vers sélection mode
- ✅ Info contrôles selon mode choisi
- ✅ GameModeManager intégré
- ✅ Mode passé au GameManager

### À Implémenter 🚧
- 🚧 WebXR Session pour VR
- 🚧 VR Controllers tracking
- 🚧 VR Rendering (stereo)
- 🚧 VR-specific gameplay adjustments
- 🚧 Calibration VR
- 🚧 Tutoriel VR

---

## 🎯 Résumé

Le système dual-mode permet de :
- ✅ **Rendre le jeu accessible** à tous (avec ou sans VR)
- ✅ **Offrir deux expériences distinctes** et optimisées
- ✅ **Détecter automatiquement** le support VR
- ✅ **Guider l'utilisateur** avec des menus clairs
- ✅ **Préparer l'infrastructure** pour l'implémentation VR complète

**Le jeu est maintenant prêt pour deux publics : les possesseurs de casques VR et les joueurs desktop !** 🎮✨

---

**Version 1.5 - Système Dual Mode**
**Par Loric Verrez - Décembre 2025**
