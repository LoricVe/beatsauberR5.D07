import * as THREE from 'three';

export class KeyboardRhythmController {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.saber = null;
        this.hitZone = null;

        // NOUVEAU SYSTÈME: Frappe par direction (gauche = rouge, droite = bleu)
        this.isHittingLeft = false;  // Flèche gauche / Q = rouge
        this.isHittingRight = false; // Flèche droite / D = bleu

        // Animation du hit
        this.hitAnimation = { active: false, time: 0 };

        // Références aux matériaux
        this.bladeMaterial = null;
        this.glowMaterial = null;
        this.innerGlowMaterial = null;
        this.hitZoneRingMaterial = null;
        this.hitZoneInnerRingMaterial = null;

        this.createFixedSaber();
        this.createHitZone();
        this.setupKeyboardControls();
    }

    createFixedSaber() {
        const group = new THREE.Group();

        // Poignée stylée
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.4, 12);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.95,
            roughness: 0.2,
            emissive: 0x111111,
            emissiveIntensity: 0.3
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = -0.2;
        group.add(handle);

        // Lame (commence en bleu)
        const bladeGeometry = new THREE.CylinderGeometry(0.1, 0.08, 2.0, 16);
        this.bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0x0044ff,
            emissive: 0x0044ff,
            emissiveIntensity: 2.5,
            transparent: true,
            opacity: 0.9,
            metalness: 0.3,
            roughness: 0.1
        });
        const blade = new THREE.Mesh(bladeGeometry, this.bladeMaterial);
        blade.position.y = 0.9;
        group.add(blade);

        // Glow externe
        const glowGeometry = new THREE.CylinderGeometry(0.18, 0.15, 2.1, 16);
        this.glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x0044ff,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, this.glowMaterial);
        glow.position.y = 0.9;
        group.add(glow);

        // Glow interne
        const innerGlowGeometry = new THREE.CylinderGeometry(0.12, 0.1, 2.05, 16);
        this.innerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x0044ff,
            transparent: true,
            opacity: 0.5
        });
        const innerGlow = new THREE.Mesh(innerGlowGeometry, this.innerGlowMaterial);
        innerGlow.position.y = 0.9;
        group.add(innerGlow);

        // Position centrale fixe
        group.position.set(0, 1.5, 2);
        group.rotation.z = 0; // Complètement droit (vertical)

        this.scene.add(group);
        this.saber = group;
    }

    createHitZone() {
        const zoneGroup = new THREE.Group();

        // Cercle de la zone de hit (comme dans les jeux de rythme)
        const ringGeometry = new THREE.RingGeometry(0.9, 1.1, 32);
        this.hitZoneRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x0044ff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, this.hitZoneRingMaterial);
        ring.rotation.x = Math.PI / 2; // Horizontal
        ring.position.y = -0.5;
        zoneGroup.add(ring);

        // Cercle intérieur (plus lumineux)
        const innerRingGeometry = new THREE.RingGeometry(0.7, 0.85, 32);
        this.hitZoneInnerRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x0044ff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const innerRing = new THREE.Mesh(innerRingGeometry, this.hitZoneInnerRingMaterial);
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = -0.5;
        zoneGroup.add(innerRing);

        // LIGNE DE FRAPPE VERTICALE (indicateur visuel)
        const lineGeometry = new THREE.PlaneGeometry(0.1, 8);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const hitLine = new THREE.Mesh(lineGeometry, lineMaterial);
        hitLine.position.set(0, 0, 0);
        zoneGroup.add(hitLine);

        // Position centrale
        zoneGroup.position.set(0, 0, 2);

        this.scene.add(zoneGroup);
        this.hitZone = zoneGroup;
    }

    // Plus besoin de switchColor - supprimé

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        const key = event.key.toLowerCase();

        // Flèche GAUCHE ou Q = Frapper les cubes ROUGES (à gauche)
        if (key === 'arrowleft' || key === 'q') {
            if (!this.isHittingLeft) {
                this.isHittingLeft = true;
                this.triggerHitAnimation('left');
                event.preventDefault();
            }
        }

        // Flèche DROITE ou D = Frapper les cubes BLEUS (à droite)
        if (key === 'arrowright' || key === 'd') {
            if (!this.isHittingRight) {
                this.isHittingRight = true;
                this.triggerHitAnimation('right');
                event.preventDefault();
            }
        }
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();

        // Reset touche gauche
        if (key === 'arrowleft' || key === 'q') {
            this.isHittingLeft = false;
        }

        // Reset touche droite
        if (key === 'arrowright' || key === 'd') {
            this.isHittingRight = false;
        }
    }

    triggerHitAnimation(side) {
        this.hitAnimation.active = true;
        this.hitAnimation.time = 0;

        // Flash du sabre avec couleur selon le côté
        const color = side === 'left' ? 0xff0044 : 0x0044ff;
        this.bladeMaterial.color.setHex(color);
        this.bladeMaterial.emissive.setHex(color);
        this.bladeMaterial.emissiveIntensity = 6;

        // Flash de la zone de hit
        this.hitZoneRingMaterial.color.setHex(color);
        this.hitZoneInnerRingMaterial.color.setHex(color);
        this.hitZoneRingMaterial.opacity = 0.8;
        this.hitZoneInnerRingMaterial.opacity = 1.0;

        // NOUVEAU: Position de base FIXE pour éviter l'accumulation
        const baseRotation = 0; // Position de repos (complètement droit/vertical)
        const slashRotation = side === 'left' ? Math.PI / 4 : -Math.PI / 4; // Rotation gauche ou droite

        // Animation de rotation (slash)
        let elapsed = 0;
        const duration = 0.12;
        const animate = () => {
            elapsed += 0.016; // ~60fps
            const t = Math.min(elapsed / duration, 1);

            // Easing out
            const eased = 1 - Math.pow(1 - t, 3);
            this.saber.rotation.z = baseRotation + (slashRotation - baseRotation) * eased;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Retour IMMÉDIAT à la position de base
                setTimeout(() => {
                    let returnElapsed = 0;
                    const returnDuration = 0.12;
                    const returnAnimate = () => {
                        returnElapsed += 0.016;
                        const rt = Math.min(returnElapsed / returnDuration, 1);
                        const easeReturn = 1 - Math.pow(1 - rt, 2);
                        this.saber.rotation.z = slashRotation + (baseRotation - slashRotation) * easeReturn;

                        if (rt < 1) {
                            requestAnimationFrame(returnAnimate);
                        } else {
                            // FORCER la position de base exacte
                            this.saber.rotation.z = baseRotation;
                        }
                    };
                    returnAnimate();
                }, 30);
            }
        };
        animate();
    }

    update(delta) {
        const time = Date.now() * 0.001;

        // Pulsation légère du sabre au repos
        if (!this.hitAnimation.active) {
            const pulse = Math.sin(time * 3) * 0.3 + 1;
            this.bladeMaterial.emissiveIntensity = 2.5 * pulse;
        }

        // Rotation de la zone de hit
        this.hitZone.rotation.y += delta * 0.8;

        // Gérer l'animation de hit
        if (this.hitAnimation.active) {
            this.hitAnimation.time += delta;

            const t = this.hitAnimation.time / 0.2; // 200ms d'animation
            if (t < 1) {
                // Retour progressif de l'intensité
                this.bladeMaterial.emissiveIntensity = 6 - (3.5 * t);
            } else {
                this.bladeMaterial.emissiveIntensity = 2.5;
                this.hitAnimation.active = false;
            }

            // Animation de la zone de hit
            const opacity = Math.max(0, 1 - t);
            this.hitZoneRingMaterial.opacity = 0.3 + (0.5 * opacity);
            this.hitZoneInnerRingMaterial.opacity = 0.5 + (0.5 * opacity);
        }
    }

    getActiveSabers() {
        return [this.saber];
    }

    // Retourne quelle direction est active ('left', 'right', ou null)
    getCurrentSide() {
        if (this.isHittingLeft) return 'left';
        if (this.isHittingRight) return 'right';
        return null;
    }

    // Vérifier si le joueur frappe (gauche ou droite)
    isHittingNow() {
        return this.isHittingLeft || this.isHittingRight;
    }

    // Vérifier si le joueur peut toucher un cube selon sa position
    checkHit(cube) {
        const cubeColor = cube.userData.color;

        // Rouge à gauche → doit appuyer sur gauche
        if (cubeColor === 'red') {
            return this.isHittingLeft;
        }

        // Bleu à droite → doit appuyer sur droite
        if (cubeColor === 'blue') {
            return this.isHittingRight;
        }

        return false;
    }

    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);

        if (this.saber) {
            this.scene.remove(this.saber);
        }
        if (this.hitZone) {
            this.scene.remove(this.hitZone);
        }
    }
}
