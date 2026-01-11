import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleGroups = [];
    }

    createExplosion(position, color) {
        const particleCount = 8; // TRÈS RÉDUIT pour effet minimaliste et élégant
        const particles = [];

        // Couleurs plus vives et brillantes
        const colorHex = color === 'red' ? 0xff0044 : 0x0044ff;

        for (let i = 0; i < particleCount; i++) {
            // Sphères lisses et bien visibles
            const geometry = new THREE.SphereGeometry(0.12, 16, 16);

            // Matériau avec forte émission pour effet éclatant
            const material = new THREE.MeshStandardMaterial({
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 3.5,
                transparent: true,
                opacity: 1,
                metalness: 0.8,
                roughness: 0.1
            });

            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);

            // Explosion radiale élégante - pattern en cercle
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 4 + Math.random() * 2;

            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed * 0.5, // Moins de mouvement vertical
                (Math.random() - 0.5) * 0.5 // Très peu de profondeur
            );

            particle.userData = {
                velocity,
                life: 0.8, // Durée de vie très courte
                decay: 2.5, // Disparition rapide
                initialIntensity: 3.5
            };

            this.scene.add(particle);
            particles.push(particle);
        }

        this.particleGroups.push(particles);
    }

    update(delta) {
        for (let i = this.particleGroups.length - 1; i >= 0; i--) {
            const particles = this.particleGroups[i];
            let groupAlive = false;

            for (let j = particles.length - 1; j >= 0; j--) {
                const particle = particles[j];

                // Appliquer la vélocité
                particle.position.add(particle.userData.velocity.clone().multiplyScalar(delta));

                // Gravité réduite pour que les particules restent visibles plus longtemps
                particle.userData.velocity.y -= 5.0 * delta;

                // Réduire la durée de vie
                particle.userData.life -= particle.userData.decay * delta;

                // Fade out progressif de l'opacité ET de l'intensité émissive
                const lifeFactor = Math.max(0, particle.userData.life);
                particle.material.opacity = lifeFactor;
                particle.material.emissiveIntensity = particle.userData.initialIntensity * lifeFactor;

                if (particle.userData.life <= 0) {
                    this.scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                    particles.splice(j, 1);
                } else {
                    groupAlive = true;
                }
            }

            if (!groupAlive) {
                this.particleGroups.splice(i, 1);
            }
        }
    }

    clear() {
        this.particleGroups.forEach(particles => {
            particles.forEach(particle => {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            });
        });
        this.particleGroups = [];
    }
}
