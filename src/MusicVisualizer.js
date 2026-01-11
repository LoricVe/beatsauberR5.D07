import * as THREE from 'three';

export class MusicVisualizer {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        this.triangles = [];
        this.rings = [];
        this.pulsingShapes = [];

        this.createBackgroundTriangles();
        this.createPulsingRings();
        this.createFloatingShapes();
    }

    createBackgroundTriangles() {
        // Grands triangles au fond qui réagissent à la musique - AUGMENTÉ
        const triangleCount = 30; // AUGMENTÉ de 12 à 30
        const colors = [
            0xff0044, // Rouge
            0x0044ff, // Bleu
            0xff00ff, // Magenta
            0x00ffff, // Cyan
            0xffff00, // Jaune
            0xff8800  // Orange
        ];

        for (let i = 0; i < triangleCount; i++) {
            const size = 8 + Math.random() * 12;
            const geometry = new THREE.ConeGeometry(size, size * 1.2, 3);

            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.08,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const triangle = new THREE.Mesh(geometry, material);

            // Positionner au fond et sur les côtés
            triangle.position.x = (Math.random() - 0.5) * 100;
            triangle.position.y = (Math.random() - 0.5) * 60;
            triangle.position.z = -120 + Math.random() * 40;

            // Rotation aléatoire
            triangle.rotation.x = Math.random() * Math.PI * 2;
            triangle.rotation.y = Math.random() * Math.PI * 2;
            triangle.rotation.z = Math.random() * Math.PI * 2;

            triangle.userData = {
                baseOpacity: 0.08,
                baseScale: 1.0,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                pulseSpeed: 1 + Math.random() * 2,
                frequencyBand: Math.floor(Math.random() * 4) // 0-3 pour basses, mid, high
            };

            this.triangles.push(triangle);
            this.scene.add(triangle);
        }
    }

    createPulsingRings() {
        // Anneaux qui pulsent avec la musique
        const ringCount = 6;
        const colors = [0xff0044, 0x0044ff, 0x00ffff, 0xff00ff];

        for (let i = 0; i < ringCount; i++) {
            const innerRadius = 15 + i * 8;
            const outerRadius = innerRadius + 2;
            const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);

            const color = colors[i % colors.length];
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.05,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2;
            ring.position.z = -100;

            ring.userData = {
                baseOpacity: 0.05,
                baseScale: 1.0,
                pulseSpeed: 1 + i * 0.5,
                frequencyBand: i % 4
            };

            this.rings.push(ring);
            this.scene.add(ring);
        }
    }

    createFloatingShapes() {
        // Formes géométriques flottantes diverses - AUGMENTÉ
        const shapeCount = 35; // AUGMENTÉ de 15 à 35
        const colors = [0xff0044, 0x0044ff, 0x00ffff, 0xff00ff, 0xffff00];

        for (let i = 0; i < shapeCount; i++) {
            let geometry;
            const shapeType = Math.floor(Math.random() * 3);

            switch(shapeType) {
                case 0: // Triangle
                    geometry = new THREE.ConeGeometry(2, 3, 3);
                    break;
                case 1: // Carré
                    geometry = new THREE.BoxGeometry(2, 2, 2);
                    break;
                case 2: // Losange
                    geometry = new THREE.TetrahedronGeometry(2);
                    break;
            }

            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.1,
                wireframe: Math.random() > 0.5,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const shape = new THREE.Mesh(geometry, material);

            // Position au fond
            shape.position.x = (Math.random() - 0.5) * 80;
            shape.position.y = (Math.random() - 0.5) * 50;
            shape.position.z = -80 + Math.random() * 60;

            shape.rotation.x = Math.random() * Math.PI * 2;
            shape.rotation.y = Math.random() * Math.PI * 2;
            shape.rotation.z = Math.random() * Math.PI * 2;

            shape.userData = {
                baseOpacity: 0.1,
                baseScale: 1.0,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5,
                    z: (Math.random() - 0.5) * 0.5
                },
                floatSpeed: 0.3 + Math.random() * 0.5,
                frequencyBand: Math.floor(Math.random() * 4)
            };

            this.pulsingShapes.push(shape);
            this.scene.add(shape);
        }
    }

    getAudioFrequencyData() {
        // Récupérer les données de fréquence audio
        const analyser = this.audioManager.analyser;
        if (!analyser) return null;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // Diviser en 4 bandes de fréquence
        const bandSize = Math.floor(dataArray.length / 4);
        const bands = [
            this.getAverageBand(dataArray, 0, bandSize), // Basses
            this.getAverageBand(dataArray, bandSize, bandSize * 2), // Mid-low
            this.getAverageBand(dataArray, bandSize * 2, bandSize * 3), // Mid-high
            this.getAverageBand(dataArray, bandSize * 3, dataArray.length) // Aigus
        ];

        return bands;
    }

    getAverageBand(dataArray, start, end) {
        let sum = 0;
        for (let i = start; i < end; i++) {
            sum += dataArray[i];
        }
        return sum / (end - start) / 255; // Normaliser entre 0 et 1
    }

    update(delta) {
        const time = Date.now() * 0.001;
        const frequencyData = this.getAudioFrequencyData();

        // Animer les triangles
        this.triangles.forEach((triangle) => {
            // Rotation
            triangle.rotation.z += delta * triangle.userData.rotationSpeed;

            if (frequencyData) {
                const band = frequencyData[triangle.userData.frequencyBand];

                // Pulse avec la musique
                const pulse = 1.0 + band * 0.5;
                triangle.scale.setScalar(triangle.userData.baseScale * pulse);

                // Opacité réactive
                const opacity = triangle.userData.baseOpacity + band * 0.15;
                triangle.material.opacity = opacity;
            } else {
                // Animation par défaut sans musique
                const pulse = 1.0 + Math.sin(time * triangle.userData.pulseSpeed) * 0.1;
                triangle.scale.setScalar(pulse);
            }
        });

        // Animer les anneaux
        this.rings.forEach((ring) => {
            // Rotation lente
            ring.rotation.z += delta * 0.1;

            if (frequencyData) {
                const band = frequencyData[ring.userData.frequencyBand];

                // Pulse
                const pulse = 1.0 + band * 0.3;
                ring.scale.setScalar(pulse);

                // Opacité
                const opacity = ring.userData.baseOpacity + band * 0.1;
                ring.material.opacity = opacity;
            } else {
                const pulse = 1.0 + Math.sin(time * ring.userData.pulseSpeed) * 0.05;
                ring.scale.setScalar(pulse);
            }
        });

        // Animer les formes flottantes
        this.pulsingShapes.forEach((shape) => {
            // Rotation
            shape.rotation.x += delta * shape.userData.rotationSpeed.x;
            shape.rotation.y += delta * shape.userData.rotationSpeed.y;
            shape.rotation.z += delta * shape.userData.rotationSpeed.z;

            // Mouvement flottant
            shape.position.z += delta * shape.userData.floatSpeed;

            // Reset position
            if (shape.position.z > 20) {
                shape.position.z = -80;
                shape.position.x = (Math.random() - 0.5) * 80;
                shape.position.y = (Math.random() - 0.5) * 50;
            }

            if (frequencyData) {
                const band = frequencyData[shape.userData.frequencyBand];

                // Pulse
                const pulse = 1.0 + band * 0.4;
                shape.scale.setScalar(pulse);

                // Opacité
                const opacity = shape.userData.baseOpacity + band * 0.2;
                shape.material.opacity = opacity;
            }
        });
    }

    setIntensity(intensity) {
        // Ajuster l'intensité globale des effets (0-1)
        this.triangles.forEach(triangle => {
            triangle.userData.baseOpacity = 0.08 * intensity;
        });

        this.rings.forEach(ring => {
            ring.userData.baseOpacity = 0.05 * intensity;
        });

        this.pulsingShapes.forEach(shape => {
            shape.userData.baseOpacity = 0.1 * intensity;
        });
    }

    clear() {
        // Nettoyer tous les objets
        [...this.triangles, ...this.rings, ...this.pulsingShapes].forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });

        this.triangles = [];
        this.rings = [];
        this.pulsingShapes = [];
    }
}
