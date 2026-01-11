import * as THREE from 'three';
import { CubeManager } from './CubeManager.js';
import { SaberController } from './SaberController.js';
import { KeyboardRhythmController } from './KeyboardRhythmController.js';
import { LevelManager } from './LevelManager.js';
import { AudioManager } from './AudioManager.js';
import { ParticleSystem } from './ParticleSystem.js';
import { SpaceEnvironment } from './SpaceEnvironment.js';
import { MusicVisualizer } from './MusicVisualizer.js';

export class GameManager {
    constructor(scene, camera, raycaster) {
        this.scene = scene;
        this.camera = camera;
        this.raycaster = raycaster;

        this.score = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.cubesHit = 0;
        this.cubesMissed = 0;
        this.totalCubes = 0;

        this.isPaused = false;
        this.isGameActive = false;

        this.cubeManager = new CubeManager(scene);
        this.saberController = null; // Sera créé selon le mode
        this.rhythmController = null; // Pour le mode clavier
        this.levelManager = new LevelManager(this.cubeManager);
        this.audioManager = new AudioManager();
        this.particleSystem = new ParticleSystem(scene);
        this.spaceEnvironment = new SpaceEnvironment(scene);
        this.musicVisualizer = null; // Sera créé au démarrage du jeu

        this.difficultySettings = {
            beginner: { speed: 0.8, spacing: 3, name: 'Débutant' },
            normal: { speed: 1.0, spacing: 2.5, name: 'Normal' },
            expert: { speed: 1.3, spacing: 2, name: 'Expert' }
        };

        this.currentDifficulty = 'normal';
        this.currentGameMode = 'keyboard-mouse'; // Default mode

        // Cooldown pour éviter de toucher plusieurs cubes à la fois
        this.lastHitTime = 0;
        this.hitCooldown = 0.15; // 150ms entre chaque hit
        this.lastHitCube = null; // Dernier cube touché
    }

    getEncouragementMessage() {
        const messages = [
            'Wouah !',
            'Excellent !',
            'Continue !',
            'Incroyable !',
            'Parfait !',
            'Super !',
            'Génial !',
            'Bravo !',
            'Fantastique !',
            'Impressionnant !',
            'En feu ! 🔥',
            'Trop fort !'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getMissedMessage() {
        const messages = [
            'Dommage !',
            'Réessaye !',
            'Pas grave !',
            'Continue !',
            'Tu peux le faire !',
            'Presque !',
            'Encore !',
            'Concentre-toi !',
            'Ne lâche rien !'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    startGame(difficulty = 'normal', gameMode = 'keyboard-mouse') {
        this.currentDifficulty = difficulty;
        this.currentGameMode = gameMode;
        this.resetScore();
        this.isGameActive = true;
        this.isPaused = false;

        // Détruire les anciens contrôleurs
        if (this.saberController) {
            // Retirer les sabres de la scène
            if (this.saberController.sabers) {
                if (this.saberController.sabers.left) {
                    this.scene.remove(this.saberController.sabers.left);
                }
                if (this.saberController.sabers.right) {
                    this.scene.remove(this.saberController.sabers.right);
                }
            }
            this.saberController = null;
        }

        if (this.rhythmController) {
            this.rhythmController.destroy();
            this.rhythmController = null;
        }

        // Créer le bon contrôleur selon le mode
        if (gameMode === 'keyboard-mouse') {
            console.log('Initializing Keyboard Rhythm Controller');
            this.rhythmController = new KeyboardRhythmController(this.scene, this.camera);
            // Afficher le panneau de contrôles
            const controlsPanel = document.getElementById('controls-panel');
            if (controlsPanel) {
                controlsPanel.classList.remove('hidden');
            }
        } else if (gameMode === 'vr') {
            console.log('VR mode not yet implemented');
            // TODO: VR Controller
        } else {
            // Fallback: mode souris classique
            console.log('Initializing Classic Mouse Controller');
            this.saberController = new SaberController(this.scene, this.camera);
        }

        this.cubeManager.clear();

        // Créer le visualiseur musical
        if (this.musicVisualizer) {
            this.musicVisualizer.clear();
        }
        this.musicVisualizer = new MusicVisualizer(this.scene, this.audioManager);

        // Charger le niveau avec synchronisation musicale si disponible
        const beatDetector = this.audioManager.getBeatDetector();
        const musicDuration = this.audioManager.getDuration();

        if (beatDetector && musicDuration > 0) {
            console.log(`Chargement du niveau synchronisé avec la musique (${musicDuration.toFixed(1)}s)`);
            this.levelManager.loadLevelWithMusic(difficulty, beatDetector, musicDuration);
        } else {
            console.log('Pas de musique détectée, chargement du niveau classique');
            this.levelManager.loadLevel(difficulty);
        }

        this.audioManager.playMusic();

        console.log(`Starting game - Mode: ${gameMode}, Difficulty: ${difficulty}`);

        this.updateHUD();
    }

    update(delta) {
        if (!this.isGameActive || this.isPaused) return;

        this.levelManager.update(delta);
        this.cubeManager.update(delta, this.difficultySettings[this.currentDifficulty].speed);

        // Mettre à jour le contrôleur selon le mode
        if (this.rhythmController) {
            this.rhythmController.update(delta);
        } else if (this.saberController) {
            this.saberController.update(delta);
        }

        this.particleSystem.update(delta);

        // Animer l'environnement spatial
        this.spaceEnvironment.update(delta);

        // Animer le visualiseur musical
        if (this.musicVisualizer) {
            this.musicVisualizer.update(delta);

            // Intensifier les effets selon le combo
            const intensity = Math.min(0.5 + (this.combo / 50) * 0.5, 1.0);
            this.musicVisualizer.setIntensity(intensity);
        }

        // Intensifier la nébuleuse selon le combo
        const nebulaIntensity = Math.min(this.combo / 50, 1.0);
        this.spaceEnvironment.setNebulaIntensity(0.5 + nebulaIntensity * 0.5);

        this.checkCollisions();
        this.removeHitCubes(); // NOUVEAU: Retirer les cubes marqués APRÈS toutes les collisions
        this.checkMissedCubes();

        if (this.levelManager.isLevelComplete() && this.cubeManager.cubes.length === 0) {
            this.endGame();
        }
    }

    checkCollisions() {
        if (this.rhythmController) {
            // Mode Rythme Clavier : détection basée sur timing et zone AVEC POSITION
            const isHittingLeft = this.rhythmController.isHittingLeft;
            const isHittingRight = this.rhythmController.isHittingRight;
            const isHitting = this.rhythmController.isHittingNow();

            // Trouver le cube valide le plus proche dans la zone
            let closestValidCube = null;
            let closestValidDistance = Infinity;

            // Parcourir TOUS les cubes pour trouver le meilleur candidat
            for (let index = 0; index < this.cubeManager.cubes.length; index++) {
                const cube = this.cubeManager.cubes[index];

                if (cube.userData.hit) continue;

                // Zone de hit : UNIQUEMENT basée sur la profondeur Z (pas X ou Y)
                const distanceZ = cube.position.z - 2; // Distance signée (négatif = derrière, positif = devant)
                const cubeColor = cube.userData.color;

                // Zone de hit : profondeur de 3.0 unités (seulement si le cube approche, pas s'il est passé)
                if (distanceZ > -3.0 && distanceZ < 1.0) {
                    // Feedback visuel : cube proche de la zone
                    if (!cube.userData.inZone) {
                        cube.userData.inZone = true;
                        console.log(`🎯 Cube ${cube.userData.color} DANS LA ZONE ! Position: x=${cube.position.x.toFixed(2)}, z=${cube.position.z.toFixed(2)}, Distance Z: ${distanceZ.toFixed(2)}`);
                    }

                    // NOUVEAU SYSTÈME: Vérifier la correspondance position/touche
                    let isValidForCurrentKey = false;

                    if (cubeColor === 'red' && isHittingLeft) {
                        // Rouge à gauche, touche gauche pressée → OK
                        isValidForCurrentKey = true;
                    } else if (cubeColor === 'blue' && isHittingRight) {
                        // Bleu à droite, touche droite pressée → OK
                        isValidForCurrentKey = true;
                    }

                    // Choisir le cube le plus proche (distanceZ négative = cube approche)
                    // On veut le cube avec la plus petite distance négative (le plus proche de z=2)
                    if (isValidForCurrentKey && Math.abs(distanceZ) < closestValidDistance) {
                        closestValidCube = cube;
                        closestValidDistance = Math.abs(distanceZ);
                    }
                } else {
                    cube.userData.inZone = false;
                }
            }

            // Si on appuie ET qu'on a trouvé un cube valide
            if (isHitting && closestValidCube && !closestValidCube.userData.hit) {
                const cubeColor = closestValidCube.userData.color;

                // VÉRIFICATION FINALE: bon côté pour la bonne couleur
                if ((cubeColor === 'red' && !isHittingLeft) || (cubeColor === 'blue' && !isHittingRight)) {
                    console.log(`⚠️ ERREUR DÉTECTÉE: Tentative de toucher cube ${cubeColor} avec mauvaise touche - BLOQUÉ`);
                    return;
                }

                // NOUVEAU: Vérifier le cooldown pour éviter de toucher plusieurs cubes à la fois
                // CORRECTION: En mode Débutant, réduire le cooldown car les cubes sont plus espacés
                const adjustedCooldown = this.currentDifficulty === 'beginner' ? 0.05 : this.hitCooldown;
                const currentTime = Date.now() / 1000; // Temps en secondes
                if (currentTime - this.lastHitTime < adjustedCooldown) {
                    console.log(`⏱️ COOLDOWN: Trop rapide, attendre ${((adjustedCooldown - (currentTime - this.lastHitTime)) * 1000).toFixed(0)}ms`);
                    return;
                }

                // NOUVEAU: Vérifier que ce n'est pas un cube trop proche du dernier touché
                // CORRECTION: Désactiver cette vérification en mode Débutant car les cubes sont espacés dans le temps, pas forcément en distance
                if (this.currentDifficulty !== 'beginner' && this.lastHitCube) {
                    const distanceFromLast = closestValidCube.position.distanceTo(this.lastHitCube.position);
                    if (distanceFromLast < 1.5) {
                        console.log(`📏 DISTANCE: Cube trop proche du dernier (${distanceFromLast.toFixed(2)}u) - IGNORÉ`);
                        return;
                    }
                }

                closestValidCube.userData.hit = true; // MARQUER IMMÉDIATEMENT
                this.lastHitTime = currentTime; // Enregistrer le moment du hit
                this.lastHitCube = closestValidCube; // Enregistrer le cube touché

                console.log(`👊 HIT: ${isHittingLeft ? 'LEFT' : 'RIGHT'} → Cube ${cubeColor} à ${closestValidDistance.toFixed(2)}u`);

                const fakeSaber = { userData: { color: cubeColor } };
                this.handleCubeHit(closestValidCube, fakeSaber);
            }
        } else if (this.saberController) {
            // Mode Souris Classique : collision physique avec sabres
            const activeSabers = this.saberController.getActiveSabers();

            activeSabers.forEach(saber => {
                const saberColor = saber.userData.color;
                let closestCube = null;
                let closestDistance = Infinity;
                let closestIndex = -1;

                // ÉTAPE 1: Trouver le cube de la bonne couleur le PLUS PROCHE
                for (let index = 0; index < this.cubeManager.cubes.length; index++) {
                    const cube = this.cubeManager.cubes[index];

                    if (cube.userData.hit) continue;

                    // VÉRIFICATION CRITIQUE: La couleur doit correspondre
                    const cubeColor = cube.userData.color;
                    if (cubeColor !== saberColor) {
                        continue;
                    }

                    // Détection améliorée : vérifier plusieurs points le long de la lame
                    const saberTip = new THREE.Vector3(0, 0.9, 0);
                    const saberBase = new THREE.Vector3(0, 0.1, 0);

                    saber.localToWorld(saberTip);
                    saber.localToWorld(saberBase);

                    // Distance minimale entre le cube et la ligne formée par la lame
                    const cubePos = cube.position;
                    const distanceToTip = cubePos.distanceTo(saberTip);
                    const distanceToBase = cubePos.distanceTo(saberBase);
                    const distanceToCenter = cubePos.distanceTo(saber.position);

                    const minDistance = Math.min(distanceToTip, distanceToBase, distanceToCenter);

                    // Si ce cube est dans la zone de collision ET plus proche que les précédents
                    if (minDistance < 1.0 && minDistance < closestDistance) {
                        closestCube = cube;
                        closestDistance = minDistance;
                        closestIndex = index;
                    }
                }

                // ÉTAPE 2: Si on a trouvé un cube proche, vérifier la vitesse et le toucher
                if (closestCube && closestIndex !== -1 && !closestCube.userData.hit) {
                    // TRIPLE VÉRIFICATION: pas déjà hit + bonne couleur
                    const cubeColor = closestCube.userData.color;

                    // VÉRIFICATION FINALE DE COULEUR (protection absolue)
                    if (cubeColor !== saberColor) {
                        console.log(`⚠️ ERREUR DÉTECTÉE: Tentative de toucher cube ${cubeColor} avec sabre ${saberColor} - BLOQUÉ`);
                        return; // BLOQUER IMMÉDIATEMENT
                    }

                    const saberSide = saber.userData.color === 'red' ? 'right' : 'left';
                    const saberDirection = this.saberController.getSaberDirection(saberSide);
                    const speed = saberDirection.length();

                    // Vitesse minimale réduite pour meilleure jouabilité
                    if (speed > 0.01) {
                        closestCube.userData.hit = true; // MARQUER IMMÉDIATEMENT
                        console.log(`🎯 HIT: Sabre ${saberColor} → Cube ${cubeColor} (distance: ${closestDistance.toFixed(2)})`);
                        this.handleCubeHit(closestCube, saber);
                    }
                }
            });
        }
    }

    handleCubeHit(cube, saber) {
        // À ce stade, la couleur a DÉJÀ été vérifiée avant l'appel
        // Le cube est DÉJÀ marqué comme hit avant l'appel
        // NE PLUS RETIRER LE CUBE ICI - il sera retiré dans removeHitCubes()
        const cubeColor = cube.userData.color;
        const saberColor = saber.userData.color;
        const requiredDirection = cube.userData.direction;

        console.log(`✅ DESTRUCTION: Sabre ${saberColor} détruit cube ${cubeColor}`);

        // Vérifier la direction SEULEMENT pour Expert et Expert+
        const needsDirectionCheck = (this.currentDifficulty === 'expert' || this.currentDifficulty === 'expertPlus');

        if (needsDirectionCheck && this.saberController) {
            // Mode Expert/Expert+ : vérifier la direction
            const saberDirection = this.saberController.getSaberDirection(saberColor === 'red' ? 'right' : 'left');
            const directionCorrect = this.checkDirection(saberDirection, requiredDirection);

            if (directionCorrect) {
                const points = this.calculatePoints(100);
                this.addScore(points);
                this.incrementCombo();
                this.cubesHit++;
                this.audioManager.playSound('hit');
                this.particleSystem.createExplosion(cube.position, cubeColor);

                // NOUVEAU: Message motivant aléatoire
                const encouragement = this.getEncouragementMessage();
                this.showFeedback(cube.position, encouragement, 0x00ff00);
            } else {
                // Mauvaise direction en mode Expert
                this.addScore(-10);
                this.resetCombo();
                this.cubesMissed++;
                this.audioManager.playSound('wrong');

                // NOUVEAU: Message d'encouragement après échec
                const missMessage = this.getMissedMessage();
                this.showFeedback(cube.position, missMessage, 0xffaa00);
            }
        } else {
            // Mode Débutant/Normal : juste la bonne couleur suffit !
            const points = this.calculatePoints(100);
            this.addScore(points);
            this.incrementCombo();
            this.cubesHit++;
            this.audioManager.playSound('hit');
            this.particleSystem.createExplosion(cube.position, cubeColor);

            // NOUVEAU: Message motivant aléatoire
            const encouragement = this.getEncouragementMessage();
            this.showFeedback(cube.position, encouragement, 0x00ff00);
        }

        this.updateHUD();
    }

    removeHitCubes() {
        // Retirer tous les cubes marqués comme hit EN UNE SEULE FOIS
        // En parcourant en ordre INVERSE pour éviter les problèmes d'index
        for (let i = this.cubeManager.cubes.length - 1; i >= 0; i--) {
            const cube = this.cubeManager.cubes[i];
            if (cube.userData.hit) {
                this.cubeManager.removeCube(i);
            }
        }
    }

    checkDirection(saberDir, requiredDir) {
        if (!saberDir || saberDir.length() < 0.1) return true;

        const directionVectors = {
            up: { x: 0, y: 1, z: 0 },
            down: { x: 0, y: -1, z: 0 },
            left: { x: -1, y: 0, z: 0 },
            right: { x: 1, y: 0, z: 0 },
            upLeft: { x: -0.7, y: 0.7, z: 0 },
            upRight: { x: 0.7, y: 0.7, z: 0 },
            downLeft: { x: -0.7, y: -0.7, z: 0 },
            downRight: { x: 0.7, y: -0.7, z: 0 }
        };

        const targetDir = directionVectors[requiredDir];
        if (!targetDir) return true;

        const normalized = saberDir.clone().normalize();
        const dot = normalized.x * targetDir.x + normalized.y * targetDir.y;

        return dot > 0.5;
    }

    checkMissedCubes() {
        this.cubeManager.cubes.forEach((cube, index) => {
            if (cube.position.z > 6 && !cube.userData.hit) {
                cube.userData.hit = true;
                this.addScore(-10);
                this.resetCombo();
                this.cubesMissed++;
                this.totalCubes++;

                // NOUVEAU: Afficher un message d'encouragement quand on rate
                const missMessage = this.getMissedMessage();
                this.showFeedback(cube.position, missMessage, 0xff4444);

                this.cubeManager.removeCube(index);
                this.audioManager.playSound('miss');
                this.updateHUD();
            }
        });
    }

    calculatePoints(basePoints) {
        return basePoints * this.multiplier;
    }

    addScore(points) {
        this.score = Math.max(0, this.score + points);
    }

    incrementCombo() {
        this.combo++;
        this.totalCubes++;

        if (this.combo >= 50) {
            this.multiplier = 4;
        } else if (this.combo >= 25) {
            this.multiplier = 3;
        } else if (this.combo >= 10) {
            this.multiplier = 2;
        } else {
            this.multiplier = 1;
        }
    }

    resetCombo() {
        this.combo = 0;
        this.multiplier = 1;
    }

    resetScore() {
        this.score = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.cubesHit = 0;
        this.cubesMissed = 0;
        this.totalCubes = 0;
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = `Combo: ${this.combo}`;
        document.getElementById('multiplier').textContent = `x${this.multiplier}`;

        const accuracy = this.totalCubes > 0
            ? Math.round((this.cubesHit / this.totalCubes) * 100)
            : 100;
        document.getElementById('accuracy').textContent = `Précision: ${accuracy}%`;
    }

    showFeedback(position, text, color) {
        // Créer un sprite de texte 3D
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        // Style du texte
        context.fillStyle = '#' + color.toString(16).padStart(6, '0');
        context.font = 'bold 80px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Ombre pour meilleure lisibilité
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowBlur = 10;
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;

        context.fillText(text, 256, 64);

        // Créer la texture et le sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);

        // Position et taille
        sprite.position.copy(position);
        sprite.position.y += 1; // Au-dessus du cube
        sprite.scale.set(3, 0.75, 1);

        this.scene.add(sprite);

        // Animation : monte et disparaît
        const startY = sprite.position.y;
        const duration = 1.5;
        let elapsed = 0;

        const animate = () => {
            elapsed += 0.016;
            const t = elapsed / duration;

            if (t < 1) {
                sprite.position.y = startY + t * 2; // Monte de 2 unités
                spriteMaterial.opacity = 1 - t; // Fade out
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(sprite);
                texture.dispose();
                spriteMaterial.dispose();
            }
        };

        animate();
    }

    updateSaberPositions(mouse) {
        // Mode souris classique uniquement
        if (this.saberController) {
            this.saberController.updatePosition(mouse);
        }
    }

    activateSaber(side, mouse) {
        // Mode souris classique uniquement
        if (this.saberController) {
            this.raycaster.setFromCamera(mouse, this.camera);
            this.saberController.activate(side);
        }
    }

    deactivateSaber(side) {
        // Mode souris classique uniquement
        if (this.saberController) {
            this.saberController.deactivate(side);
        }
    }

    pause() {
        this.isPaused = true;
        this.audioManager.pause();
    }

    resume() {
        this.isPaused = false;
        this.audioManager.resume();
    }

    endGame() {
        this.isGameActive = false;
        this.audioManager.stopMusic();

        const accuracy = this.totalCubes > 0
            ? Math.round((this.cubesHit / this.totalCubes) * 100)
            : 100;

        const rank = this.calculateRank(accuracy);

        document.getElementById('final-score').textContent = `Score: ${this.score}`;
        document.getElementById('final-accuracy').textContent = `Précision: ${accuracy}%`;
        const rankElement = document.getElementById('rank');
        rankElement.textContent = rank;
        rankElement.className = `rank-${rank}`;
        document.getElementById('game-over').style.display = 'block';
    }

    calculateRank(accuracy) {
        if (accuracy >= 95 && this.score > 50000) return 'SS';
        if (accuracy >= 90) return 'S';
        if (accuracy >= 80) return 'A';
        if (accuracy >= 70) return 'B';
        if (accuracy >= 60) return 'C';
        return 'D';
    }

    restartLevel() {
        this.startGame(this.currentDifficulty, this.currentGameMode);
    }

    returnToMenu() {
        this.isGameActive = false;
        this.audioManager.stopMusic();
        this.cubeManager.clear();

        // Nettoyer le visualiseur musical
        if (this.musicVisualizer) {
            this.musicVisualizer.clear();
            this.musicVisualizer = null;
        }

        // Nettoyer les contrôleurs
        if (this.saberController) {
            if (this.saberController.sabers) {
                if (this.saberController.sabers.left) {
                    this.scene.remove(this.saberController.sabers.left);
                }
                if (this.saberController.sabers.right) {
                    this.scene.remove(this.saberController.sabers.right);
                }
            }
            this.saberController = null;
        }

        if (this.rhythmController) {
            this.rhythmController.destroy();
            this.rhythmController = null;
        }

        // Cacher le panneau de contrôles
        const controlsPanel = document.getElementById('controls-panel');
        if (controlsPanel) {
            controlsPanel.classList.add('hidden');
        }

        this.resetScore();
        this.updateHUD();

        // Afficher le menu
        if (this.uiManager) {
            this.uiManager.showMenu();
        }
    }

    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }
}
