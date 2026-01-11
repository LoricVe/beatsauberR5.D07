# 🎹 Mode Rythme Clavier - Documentation

## 🌟 Concept

Le mode Clavier transforme Beat Saber en un **jeu de rythme pur** comme Guitar Hero ou Friday Night Funkin'. Au lieu de bouger des sabres avec la souris, le joueur a **un seul sabre fixe** qui peut **changer de couleur** et doit **appuyer au bon timing** pour trancher les cubes.

---

## 🎮 Gameplay

### Sabre Unique Central

```
┌─────────────────────────────────────┐
│                                     │
│              ╔═══╗                  │
│              ║   ║  ← Sabre fixe    │
│              ║ █ ║     au centre    │
│              ║   ║                  │
│              ╚═══╝                  │
│                                     │
│         Zone de Hit                 │
│            ◯◯◯◯◯                    │
│          ◯       ◯                  │
│         ◯    █    ◯                 │
│          ◯       ◯                  │
│            ◯◯◯◯◯                    │
│                                     │
└─────────────────────────────────────┘
```

### Caractéristiques du Sabre

- **Position** : Centre de l'écran, légèrement incliné
- **Couleur de départ** : Bleu
- **Animation** : Pulsation lumineuse constante
- **Rotation** : Slash animé lors d'une frappe

### Zone de Hit

- **Forme** : Double anneau tournant (comme dans les jeux de rythme)
- **Couleur** : S'adapte à la couleur du sabre
- **Animation** :
  - Rotation constante (0.8 rad/s)
  - Flash lors des frappes
  - Pulsation lors du changement de couleur

---

## ⌨️ Contrôles

### Touche ESPACE - Changer de Couleur
```
┌──────────────────────────────────────┐
│  Appuyez sur ESPACE                 │
│           ↓                          │
│  Bleu (🔵) ⇄ Rouge (🔴)              │
│           ↓                          │
│  • Tous les matériaux changent       │
│  • Animation de pulse (100ms)        │
│  • Cooldown de 200ms                 │
│  • Log dans la console               │
└──────────────────────────────────────┘
```

**Cooldown :** Pour éviter le spam, vous ne pouvez changer de couleur que toutes les 200ms.

### Touche D ou ENTER - Frapper
```
┌──────────────────────────────────────┐
│  Appuyez sur D ou ENTER             │
│           ↓                          │
│  Animation de frappe :               │
│  • Flash du sabre (×3 intensité)     │
│  • Rotation rapide (-60°)            │
│  • Flash de la zone de hit           │
│  • Retour en position (150ms)        │
│           ↓                          │
│  Détection de collision avec cubes   │
└──────────────────────────────────────┘
```

### Autres Touches
- **V** : Changer la vue de la caméra
- **ÉCHAP** : Retour au menu

---

## 🎯 Mécaniques de Jeu

### Système de Timing

Le joueur doit :
1. **Voir un cube arriver** (rouge ou bleu)
2. **Changer de couleur** si nécessaire (ESPACE)
3. **Appuyer au bon moment** (D ou ENTER) quand le cube arrive dans la zone

### Règles de Validation

```javascript
checkHit(cube) {
    const cubeColor = cube.userData.color;

    // Valide si :
    return this.isHitting          // ✅ Joueur appuie
        && this.currentColor === cubeColor;  // ✅ Bonne couleur
}
```

### Exemple de Séquence

```
Cubes qui arrivent : 🔴 🔵 🔵 🔴 🔴 🔵

Actions du joueur :
ESPACE (→ rouge) → D (hit!)
ESPACE (→ bleu)  → D (hit!)
                 → D (hit!)
ESPACE (→ rouge) → D (hit!)
                 → D (hit!)
ESPACE (→ bleu)  → D (hit!)

Score : 6/6 = 100% 🎉
```

---

## 🎨 Animations et Effets Visuels

### 1. Pulsation au Repos
```javascript
const pulse = Math.sin(time * 3) * 0.3 + 1;
emissiveIntensity = 2.5 * pulse;
```
- Fréquence : 3 Hz
- Amplitude : ±30%
- Intensité de base : 2.5

### 2. Animation de Changement de Couleur
```javascript
// Flash immédiat
emissiveIntensity = 4;

// Retour après 100ms
setTimeout(() => {
    emissiveIntensity = 2.5;
}, 100);
```

### 3. Animation de Frappe
```javascript
// Phase 1: Rotation rapide (150ms)
rotation.z = startRotation - Math.PI/3 (-60°)
emissiveIntensity = 6

// Phase 2: Retour (150ms après 50ms pause)
rotation.z = retour à startRotation
emissiveIntensity = 2.5
```

### 4. Zone de Hit
```javascript
// Rotation constante
hitZone.rotation.y += delta * 0.8;

// Flash lors de la frappe
ringOpacity = 0.3 → 0.8
innerRingOpacity = 0.5 → 1.0
```

---

## 🏗️ Architecture Technique

### Classe KeyboardRhythmController

```javascript
class KeyboardRhythmController {
    // Propriétés principales
    saber: THREE.Group          // Le sabre unique
    currentColor: 'blue'|'red'  // Couleur actuelle
    hitZone: THREE.Group        // Zone de hit visuelle

    // États
    isHitting: boolean          // Joueur appuie actuellement
    canSwitchColor: boolean     // Cooldown de changement
    hitAnimation: {             // État animation
        active: boolean,
        time: number
    }

    // Matériaux (pour changement couleur rapide)
    bladeMaterial
    glowMaterial
    innerGlowMaterial
    hitZoneRingMaterial
    hitZoneInnerRingMaterial

    // Méthodes
    createFixedSaber()          // Crée le sabre central
    createHitZone()             // Crée la zone de hit
    switchColor()               // Change bleu ⇄ rouge
    triggerHitAnimation()       // Lance l'animation de frappe
    checkHit(cube)              // Vérifie si hit valide
    update(delta)               // Boucle d'animation
}
```

### Position et Structure du Sabre

```javascript
// Position centrale
group.position.set(0, 1.5, 2);
group.rotation.z = Math.PI / 6; // 30° d'inclinaison

// Composition
├─ Handle (poignée noire)
│  └─ CylinderGeometry(0.1, 0.08, 0.4)
├─ Blade (lame lumineuse)
│  └─ CylinderGeometry(0.1, 0.08, 2.0)
├─ Glow externe (halo externe)
│  └─ CylinderGeometry(0.18, 0.15, 2.1)
└─ Glow interne (halo interne)
   └─ CylinderGeometry(0.12, 0.1, 2.05)
```

### Matériaux et Couleurs

#### Bleu (0x0044ff)
```javascript
color: 0x0044ff
emissive: 0x0044ff
emissiveIntensity: 2.5 (repos) → 6 (frappe)
```

#### Rouge (0xff0044)
```javascript
color: 0xff0044
emissive: 0xff0044
emissiveIntensity: 2.5 (repos) → 6 (frappe)
```

---

## 🎮 Intégration dans GameManager

### Changements Nécessaires

Le GameManager doit détecter le mode et utiliser le bon contrôleur :

```javascript
// Dans GameManager.js
import { SaberController } from './SaberController.js';
import { KeyboardRhythmController } from './KeyboardRhythmController.js';

startGame(difficulty, gameMode) {
    if (gameMode === 'keyboard-mouse') {
        // Mode rythme clavier
        this.rhythmController = new KeyboardRhythmController(
            this.scene,
            this.camera
        );
    } else if (gameMode === 'vr') {
        // Mode VR (à implémenter)
        // this.vrController = new VRController(...);
    } else {
        // Mode souris classique (backup)
        this.saberController = new SaberController(
            this.scene,
            this.camera
        );
    }
}
```

### Détection de Collision

```javascript
checkCollisions() {
    if (this.currentGameMode === 'keyboard-mouse') {
        // Mode rythme : vérifier si joueur appuie au bon moment
        this.cubeManager.cubes.forEach((cube, index) => {
            // Vérifier si le cube est dans la zone de hit
            const distance = cube.position.distanceTo(
                new THREE.Vector3(0, 0, 2)
            );

            if (distance < 1.5) { // Zone de hit
                // Vérifier si le joueur a la bonne couleur et appuie
                if (this.rhythmController.checkHit(cube)) {
                    this.handleCubeHit(cube, null, index);
                }
            }
        });
    } else {
        // Mode normal : collision physique avec sabres
        // ... code existant ...
    }
}
```

---

## 📊 Comparaison : Mode Souris vs Mode Clavier

| Aspect | Mode Souris (Ancien) | Mode Clavier (Nouveau) |
|--------|----------------------|------------------------|
| **Sabres** | 2 sabres mobiles | 1 sabre fixe |
| **Contrôle** | Mouvement souris | Timing clavier |
| **Couleur** | Sabre gauche/droit | Changement dynamique |
| **Difficulté** | Précision spatiale | Timing rythmique |
| **Style de jeu** | Action 3D | Jeu de rythme |
| **Référence** | Beat Saber original | Guitar Hero / FNF |
| **Input** | Souris X/Y | 2 touches (Espace + D) |
| **Zone de jeu** | Tout l'écran | Zone centrale fixe |

---

## 🎯 Avantages du Mode Rythme

### 1. **Simplicité**
- ✅ Seulement 2 touches à utiliser
- ✅ Pas besoin de précision spatiale
- ✅ Focus sur le timing uniquement

### 2. **Accessibilité**
- ✅ Jouable sur laptop sans souris
- ✅ Pas de fatigue du poignet
- ✅ Contrôles intuitifs (comme Guitar Hero)

### 3. **Gameplay Distinct**
- ✅ Vraie différence avec le mode VR
- ✅ Challenge de timing rythmique
- ✅ Système de couleur stratégique

### 4. **Performance**
- ✅ Moins de calculs de collision
- ✅ Zone de hit fixe
- ✅ Animations optimisées

---

## 🎨 Feedback Visuel

### États du Sabre

```
État Repos (Bleu)
    █████  ← Pulsation douce
   ███████
    █████

Changement (Bleu → Rouge)
    █████  ← Flash intense
   ███████ ← 100ms
    █████

Frappe
    █████
   ███████ ← Rotation -60°
  / █████  ← Flash + Slash
 /

État Repos (Rouge)
    █████  ← Pulsation douce
   ███████
    █████
```

### Zone de Hit

```
Repos          Frappe          Retour
  ◯◯◯            ◉◉◉            ◯◯◯
 ◯   ◯         ◉   ◉          ◯   ◯
◯  █  ◯       ◉  █  ◉        ◯  █  ◯
 ◯   ◯         ◉   ◉          ◯   ◯
  ◯◯◯            ◉◉◉            ◯◯◯
  ↑              ↑              ↑
Opacité       Flash          Retour
 30%           80%            30%
```

---

## 🔧 Configuration et Tweaking

### Paramètres Modifiables

```javascript
// Timing
const HIT_ANIMATION_DURATION = 0.15;  // 150ms
const COLOR_SWITCH_COOLDOWN = 200;    // 200ms
const RETURN_DELAY = 50;              // 50ms

// Intensités
const BASE_EMISSIVE = 2.5;
const HIT_EMISSIVE = 6.0;
const SWITCH_EMISSIVE = 4.0;

// Animations
const PULSE_FREQUENCY = 3;            // 3 Hz
const PULSE_AMPLITUDE = 0.3;          // ±30%
const ROTATION_AMOUNT = Math.PI / 3;  // 60°

// Zone de Hit
const HIT_ZONE_RADIUS = 1.5;          // Distance max
const ZONE_ROTATION_SPEED = 0.8;      // rad/s
```

---

## 📝 Console Logs

Le système affiche des logs utiles :

```
Sabre changé en red
Sabre changé en blue
Sabre changé en red
```

Permet de debug et vérifier que les changements de couleur fonctionnent.

---

## 🎵 Suggestions d'Améliorations Futures

### 1. Feedback Sonore
```javascript
// Ajouter des sons
switchColor() {
    audioManager.playSound('color_switch');
    // ...
}

triggerHitAnimation() {
    audioManager.playSound('saber_slash');
    // ...
}
```

### 2. Système de Streak
```javascript
consecutiveHits = 0;

onSuccessfulHit() {
    consecutiveHits++;
    if (consecutiveHits === 10) {
        // Mode "Fire" - sabre change de couleur automatiquement
    }
}
```

### 3. Indicateur de Timing
```javascript
// Afficher "Perfect!" "Good!" "Miss!" selon précision
const timing = calculateTiming(cube, hitTime);
showTimingFeedback(timing);
```

### 4. Trail Effect
```javascript
// Ajouter une traînée lors du slash
createTrailEffect(saber, duration);
```

---

## ✅ État Actuel

### ✅ Implémenté
- ✅ Sabre unique fixe au centre
- ✅ Changement de couleur avec ESPACE
- ✅ Frappe avec D ou ENTER
- ✅ Animations de rotation (slash)
- ✅ Pulsation au repos
- ✅ Zone de hit rotative
- ✅ Flash lors des actions
- ✅ Cooldown anti-spam
- ✅ Console logs pour debug
- ✅ Méthode checkHit() pour validation

### 🚧 À Intégrer
- 🚧 Intégration dans GameManager
- 🚧 Détection de collision avec cubes
- 🚧 Système de score pour timing
- 🚧 Feedback sonore
- 🚧 Interface HUD adaptée
- 🚧 Tutoriel pour le mode rythme

---

## 🎯 Résumé

Le **Mode Rythme Clavier** transforme Beat Saber en un jeu de rythme pur :
- ✅ **Un seul sabre** qui change de couleur dynamiquement
- ✅ **ESPACE** pour changer Bleu ⇄ Rouge
- ✅ **D ou ENTER** pour frapper
- ✅ **Timing** au centre du gameplay
- ✅ **Animations fluides** et feedback visuel
- ✅ **Simple et accessible** pour tous

**C'est comme Guitar Hero rencontre Beat Saber !** 🎸🎮✨

---

**Version 1.6 - Mode Rythme Clavier**
**Par Loric Verrez - Janvier 2026**
