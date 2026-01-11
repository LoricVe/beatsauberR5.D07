import * as THREE from 'three';

export class CubeManager {
    constructor(scene) {
        this.scene = scene;
        this.cubes = [];
        this.cubePool = [];
        this.maxPoolSize = 50;

        // L'environnement spatial est maintenant géré par SpaceEnvironment.js
        // On garde juste quelques guides subtils pour la zone de jeu
        this.createMinimalGuides();
    }

    createMinimalGuides() {
        // Grille rectangulaire au sol (étroite et très longue en profondeur)
        const gridWidth = 7; // Largeur réduite pour un couloir plus étroit
        const gridDepth = 50; // Profondeur (beaucoup plus long)
        const divisionsDepth = 50; // Nombre de divisions en profondeur

        const gridHelper = new THREE.GridHelper(gridDepth, divisionsDepth, 0x00ffff, 0x003344);
        gridHelper.position.y = -1;
        gridHelper.position.z = -10;

        // Étirer la grille pour qu'elle soit rectangulaire (plus longue en Z)
        gridHelper.scale.set(gridWidth / gridDepth, 1, 1);
        this.scene.add(gridHelper);

        // Plan de frappe subtil
        const hitZoneGeometry = new THREE.PlaneGeometry(10, 8);
        const hitZoneMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.03,
            side: THREE.DoubleSide
        });
        const hitZone = new THREE.Mesh(hitZoneGeometry, hitZoneMaterial);
        hitZone.position.set(0, 1, 0);
        this.scene.add(hitZone);

        // Cadre de la zone de jeu
        const frameGeometry = new THREE.BoxGeometry(10, 8, 0.1);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.15,
            wireframe: true
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 1, 0);
        this.scene.add(frame);

        // Lignes de profondeur plus nombreuses et étalées
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.BufferGeometry();
            const z = -40 + i * 3; // De -40 à +20
            const positions = new Float32Array([
                -3.5, -1, z,  // Largeur réduite pour correspondre à la grille
                3.5, -1, z
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.LineBasicMaterial({
                color: 0x003366,
                transparent: true,
                opacity: 0.15 + (i * 0.01) // Opacité progressive
            });

            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
        }
    }

    createCube(color, direction, position) {
        let cube;

        if (this.cubePool.length > 0) {
            cube = this.cubePool.pop();
            cube.position.copy(position);
            cube.userData.hit = false;

            // IMPORTANT: Mettre à jour la couleur du matériau lors du recyclage
            const materialColor = color === 'red' ? 0xff0055 : 0x0055ff;
            cube.material.color.setHex(materialColor);
            cube.material.emissive.setHex(materialColor);

            // Mettre à jour le glow aussi
            if (cube.children.length > 0 && cube.children[0].material) {
                cube.children[0].material.color.setHex(materialColor);
            }

            console.log(`♻️ Recycling ${color} cube - Position: x=${position.x}, material updated`);
        } else {
            // Cubes plus gros et arrondis pour un meilleur look
            const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
            geometry.computeVertexNormals();

            const materialColor = color === 'red' ? 0xff0055 : 0x0055ff;

            const material = new THREE.MeshStandardMaterial({
                color: materialColor,
                emissive: materialColor,
                emissiveIntensity: 1.2,
                metalness: 0.9,
                roughness: 0.1,
                envMapIntensity: 1
            });

            cube = new THREE.Mesh(geometry, material);
            cube.position.copy(position);

            // Ajouter un glow externe pour plus d'effet
            const glowGeometry = new THREE.BoxGeometry(1.15, 1.15, 1.15);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: materialColor,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            cube.add(glow);
        }

        cube.userData.color = color;
        cube.userData.direction = direction;
        cube.userData.hit = false;

        this.addDirectionArrow(cube, direction, color);

        this.scene.add(cube);
        this.cubes.push(cube);

        return cube;
    }

    addDirectionArrow(cube, direction, color) {
        // Nettoyer seulement les flèches existantes (ArrowHelper), garder le glow
        const arrowsToRemove = cube.children.filter(child => child.type === 'ArrowHelper');
        arrowsToRemove.forEach(arrow => cube.remove(arrow));

        // Si pas de direction (modes Débutant/Normal), ne pas ajouter de flèche
        if (!direction || direction === 'none') return;

        const arrowColor = color === 'red' ? 0xff6666 : 0x6666ff;
        const directionVectors = {
            up: new THREE.Vector3(0, 1, 0),
            down: new THREE.Vector3(0, -1, 0),
            left: new THREE.Vector3(-1, 0, 0),
            right: new THREE.Vector3(1, 0, 0),
            upLeft: new THREE.Vector3(-0.7, 0.7, 0),
            upRight: new THREE.Vector3(0.7, 0.7, 0),
            downLeft: new THREE.Vector3(-0.7, -0.7, 0),
            downRight: new THREE.Vector3(0.7, -0.7, 0)
        };

        const dir = directionVectors[direction];
        if (!dir) return;

        const origin = new THREE.Vector3(0, 0, 0.31);
        const length = 0.3;
        const arrow = new THREE.ArrowHelper(dir, origin, length, arrowColor, 0.15, 0.1);
        cube.add(arrow);
    }

    update(delta, speedMultiplier = 1.0) {
        const speed = 5 * speedMultiplier * delta;
        const hitZonePos = new THREE.Vector3(0, 0, 2);

        for (let i = this.cubes.length - 1; i >= 0; i--) {
            const cube = this.cubes[i];
            cube.position.z += speed;

            // Calculer la distance par rapport à la zone de hit
            const distance = cube.position.distanceTo(hitZonePos);

            // Rotation plus dynamique
            cube.rotation.x += delta * 1;
            cube.rotation.y += delta * 2;

            // Pulsation lumineuse plus marquée
            const time = Date.now() * 0.003;
            let pulseIntensity = 1.0 + Math.sin(time) * 0.5;

            // Zone PARFAITE (distance < 1.5) - C'EST MAINTENANT LE MOMENT !
            if (distance < 1.5) {
                pulseIntensity = 2.0 + Math.sin(time * 3) * 0.5; // Clignote doucement
                cube.material.emissiveIntensity = pulseIntensity;

                // Glow dans la zone parfaite
                if (cube.children[0] && cube.children[0].material.opacity !== undefined) {
                    cube.children[0].material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
                }

                // Scale up pour montrer que c'est LE MOMENT PARFAIT
                const scaleAnim = 1.0 + Math.sin(time * 3) * 0.1;
                cube.scale.set(scaleAnim, scaleAnim, scaleAnim);
            }
            // Si le cube est dans la zone de hit (mais pas timing parfait)
            else if (cube.userData.inZone) {
                pulseIntensity = 1.5 + Math.sin(time * 10) * 0.8; // Clignote vite
                cube.material.emissiveIntensity = pulseIntensity;

                if (cube.children[0] && cube.children[0].material && cube.children[0].material.opacity !== undefined) {
                    cube.children[0].material.opacity = 0.3 + Math.sin(time * 10) * 0.2;
                }

                cube.scale.set(1, 1, 1); // Taille normale
            } else {
                // Hors zone
                cube.material.emissiveIntensity = pulseIntensity;

                if (cube.children[0] && cube.children[0].material && cube.children[0].material.opacity !== undefined) {
                    cube.children[0].material.opacity = 0.15 + Math.sin(time) * 0.1;
                }

                cube.scale.set(1, 1, 1);
            }
        }
    }

    removeCube(index) {
        if (index < 0 || index >= this.cubes.length) return;

        const cube = this.cubes[index];
        this.scene.remove(cube);
        this.cubes.splice(index, 1);

        if (this.cubePool.length < this.maxPoolSize) {
            this.cubePool.push(cube);
        }
    }

    clear() {
        this.cubes.forEach(cube => {
            this.scene.remove(cube);
        });
        this.cubes = [];
    }

    spawnCube(color, direction, x, y, z) {
        const position = new THREE.Vector3(x, y, z);
        console.log(`📦 Spawning ${color} cube at position: x=${x}, y=${y}, z=${z}`);
        return this.createCube(color, direction, position);
    }
}
