import * as THREE from 'three';

export class SaberController {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.sabers = {
            left: null,
            right: null
        };

        this.previousPositions = {
            left: new THREE.Vector3(),
            right: new THREE.Vector3()
        };

        this.directions = {
            left: new THREE.Vector3(),
            right: new THREE.Vector3()
        };

        this.active = {
            left: false,
            right: false
        };

        this.trails = {
            left: [],
            right: []
        };

        this.maxTrailLength = 20;

        this.createSabers();
    }

    createSabers() {
        this.sabers.left = this.createSaber('blue', -1.5);
        this.sabers.right = this.createSaber('red', 1.5);

        // Les sabres sont toujours actifs pour la détection de collision
        this.active.left = true;
        this.active.right = true;
    }

    createSaber(color, offsetX) {
        const group = new THREE.Group();

        // Poignée plus visible et stylée
        const handleGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.35, 12);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.95,
            roughness: 0.2,
            emissive: 0x111111,
            emissiveIntensity: 0.2
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = -0.15;
        group.add(handle);

        // Lame plus large et plus lumineuse
        const bladeGeometry = new THREE.CylinderGeometry(0.08, 0.06, 1.8, 16);
        const bladeColor = color === 'red' ? 0xff0044 : 0x0044ff;
        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: bladeColor,
            emissive: bladeColor,
            emissiveIntensity: 3,
            transparent: true,
            opacity: 0.9,
            metalness: 0.3,
            roughness: 0.1
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 0.75;
        group.add(blade);

        // Glow externe plus prononcé
        const glowGeometry = new THREE.CylinderGeometry(0.15, 0.12, 1.9, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: bladeColor,
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.75;
        group.add(glow);

        // Glow interne additionnel
        const innerGlowGeometry = new THREE.CylinderGeometry(0.1, 0.08, 1.85, 16);
        const innerGlowMaterial = new THREE.MeshBasicMaterial({
            color: bladeColor,
            transparent: true,
            opacity: 0.6
        });
        const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
        innerGlow.position.y = 0.75;
        group.add(innerGlow);

        group.position.set(offsetX, 1.5, 3);
        group.userData.color = color;
        group.userData.offsetX = offsetX;

        this.scene.add(group);
        return group;
    }

    updatePosition(mouse) {
        // Sauvegarder les positions précédentes AVANT le calcul
        this.previousPositions.left.copy(this.sabers.left.position);
        this.previousPositions.right.copy(this.sabers.right.position);

        // Créer un plan de jeu 3D dans l'espace
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersectPoint = new THREE.Vector3();
        const hasIntersection = raycaster.ray.intersectPlane(plane, intersectPoint);

        // CORRECTION CRITIQUE: Toujours mettre à jour, même si pas d'intersection
        // Utiliser la dernière position valide ou une position par défaut
        if (hasIntersection && intersectPoint) {
            // Limiter la zone de mouvement pour garder les sabres dans le champ de vision
            const clampedX = Math.max(-4, Math.min(4, intersectPoint.x));
            const clampedY = Math.max(-2, Math.min(4, intersectPoint.y));

            // Positionner les sabres avec un écart constant
            const leftTarget = new THREE.Vector3(clampedX - 1.2, clampedY, 0);
            const rightTarget = new THREE.Vector3(clampedX + 1.2, clampedY, 0);

            // Interpolation plus rapide pour un meilleur contrôle
            this.sabers.left.position.lerp(leftTarget, 0.5);
            this.sabers.right.position.lerp(rightTarget, 0.5);
        }
        // Si pas d'intersection, garder la position actuelle (pas de mise à jour)

        // Toujours calculer les directions, même si faibles
        this.directions.left.subVectors(this.sabers.left.position, this.previousPositions.left);
        this.directions.right.subVectors(this.sabers.right.position, this.previousPositions.right);

        // Rotation basée sur le mouvement (seulement si mouvement significatif)
        if (this.directions.left.length() > 0.001) {
            const leftAngle = Math.atan2(this.directions.left.x, this.directions.left.y);
            this.sabers.left.rotation.z = leftAngle;
        }
        if (this.directions.right.length() > 0.001) {
            const rightAngle = Math.atan2(this.directions.right.x, this.directions.right.y);
            this.sabers.right.rotation.z = rightAngle;
        }

        this.updateTrails();
    }

    updateTrails() {
        ['left', 'right'].forEach(side => {
            if (this.active[side]) {
                const saber = this.sabers[side];
                const tipPosition = new THREE.Vector3(0, 0.9, 0);
                saber.localToWorld(tipPosition);

                this.trails[side].push(tipPosition.clone());

                if (this.trails[side].length > this.maxTrailLength) {
                    this.trails[side].shift();
                }
            } else {
                this.trails[side] = [];
            }
        });
    }

    activate(side) {
        this.active[side] = true;

        const saber = this.sabers[side];
        const blade = saber.children[1];
        blade.material.emissiveIntensity = 4;

        const glow = saber.children[2];
        glow.material.opacity = 0.6;
    }

    deactivate(side) {
        this.active[side] = false;

        const saber = this.sabers[side];
        const blade = saber.children[1];
        blade.material.emissiveIntensity = 2;

        const glow = saber.children[2];
        glow.material.opacity = 0.3;

        this.trails[side] = [];
    }

    update(delta) {
        ['left', 'right'].forEach(side => {
            const saber = this.sabers[side];
            const blade = saber.children[1];

            const pulseSpeed = 3;
            const pulseAmount = 0.5;
            const pulse = Math.sin(Date.now() * 0.001 * pulseSpeed) * pulseAmount;
            blade.material.emissiveIntensity = this.active[side] ? 4 + pulse : 2 + pulse;
        });
    }

    getActiveSabers() {
        // Retourne toujours les deux sabres car ils sont toujours actifs
        return [this.sabers.left, this.sabers.right];
    }

    getSaberDirection(side) {
        return this.directions[side].clone();
    }

    getSaberSpeed(side) {
        return this.directions[side].length();
    }
}
