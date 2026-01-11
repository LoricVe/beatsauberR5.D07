import * as THREE from 'three';

export class SpaceEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.stars = [];
        this.nebulaClouds = [];

        this.createStarfield();
        this.createNebula();
        this.createSpaceTunnel();
        this.createDistantGalaxies();
    }

    createStarfield() {
        // Étoiles ULTRA RÉDUITES - juste quelques points subtils
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 90; // ULTRA RÉDUIT de 200 à 40

        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            // Étoiles très espacées et très au fond
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 60;
            const z = -120 + Math.random() * 60; // Très loin

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            // Couleurs subtiles - principalement blanches
            const colorType = Math.random();
            if (colorType < 0.8) {
                // Étoiles blanches (majoritaires)
                colors[i3] = 0.9 + Math.random() * 0.1;
                colors[i3 + 1] = 0.9 + Math.random() * 0.1;
                colors[i3 + 2] = 1.0;
            } else {
                // Quelques étoiles bleues
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1.0;
            }

            // Tailles très petites
            sizes[i] = 0.2 + Math.random() * 0.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Matériau ultra subtil pour les étoiles
        const starMaterial = new THREE.PointsMaterial({
            size: 1.0, // Très petites
            color: 0xffffff,
            transparent: true,
            opacity: 0.2, // Très transparentes
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
            sizeAttenuation: true
        });

        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);
    }

    createNebula() {
        // Particules triangulaires MINIMALISTES - très réduites (maintenant on a beaucoup dans MusicVisualizer)
        const particleCount = 3; // ULTRA RÉDUIT de 8 à 3
        const triangleColors = [
            0x00ffff,  // Cyan
            0xff0088,  // Rose
            0x8800ff,  // Violet
            0x00ff88   // Vert cyan
        ];

        for (let i = 0; i < particleCount; i++) {
            // Géométrie triangle plus petite
            const size = 0.2 + Math.random() * 0.4;
            const geometry = new THREE.ConeGeometry(size, size * 1.5, 3);

            const color = triangleColors[Math.floor(Math.random() * triangleColors.length)];
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.15, // Beaucoup plus transparent
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });

            const triangle = new THREE.Mesh(geometry, material);

            // Position plus loin et espacée
            triangle.position.x = (Math.random() - 0.5) * 60;
            triangle.position.y = (Math.random() - 0.5) * 40;
            triangle.position.z = -80 + Math.random() * 60; // Plus loin

            // Rotation aléatoire
            triangle.rotation.x = Math.random() * Math.PI * 2;
            triangle.rotation.y = Math.random() * Math.PI * 2;
            triangle.rotation.z = Math.random() * Math.PI * 2;

            // Vitesse de rotation et déplacement plus lents
            triangle.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.3,
                    y: (Math.random() - 0.5) * 0.3,
                    z: (Math.random() - 0.5) * 0.3
                },
                floatSpeed: 0.1 + Math.random() * 0.2,
                floatOffset: Math.random() * Math.PI * 2
            };

            this.nebulaClouds.push(triangle);
            this.scene.add(triangle);
        }
    }

    createSpaceTunnel() {
        // Pas de lignes - trop chargé avec les triangles
    }

    createDistantGalaxies() {
        // Pas de galaxies - trop chargé
    }

    update(delta) {
        const time = Date.now() * 0.001;

        // Animation des triangles flottants
        this.nebulaClouds.forEach((triangle) => {
            if (triangle.userData.rotationSpeed) {
                // Rotation continue
                triangle.rotation.x += delta * triangle.userData.rotationSpeed.x;
                triangle.rotation.y += delta * triangle.userData.rotationSpeed.y;
                triangle.rotation.z += delta * triangle.userData.rotationSpeed.z;

                // Mouvement flottant
                triangle.position.y += Math.sin(time + triangle.userData.floatOffset) * delta * 0.3;

                // Avancement lent vers la caméra
                triangle.position.z += delta * triangle.userData.floatSpeed;

                // Reset quand il passe la caméra
                if (triangle.position.z > 20) {
                    triangle.position.z = -60;
                    triangle.position.x = (Math.random() - 0.5) * 50;
                    triangle.position.y = (Math.random() - 0.5) * 30;
                }
            }
        });

        // Mouvement parallaxe des étoiles PARTOUT
        if (this.starfield) {
            const positions = this.starfield.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                // Déplacement vers l'avant
                positions[i + 2] += delta * 4;

                // Reset quand l'étoile passe la caméra
                if (positions[i + 2] > 20) {
                    positions[i] = (Math.random() - 0.5) * 100;
                    positions[i + 1] = (Math.random() - 0.5) * 60;
                    positions[i + 2] = -100;
                }
            }

            this.starfield.geometry.attributes.position.needsUpdate = true;
        }
    }

    // Changer l'intensité de la nébuleuse selon le score/combo
    setNebulaIntensity(intensity) {
        this.nebulaClouds.forEach(nebula => {
            if (nebula.material.opacity !== undefined) {
                nebula.material.opacity = Math.min(intensity * 0.4, 0.5);
            }
        });
    }
}
