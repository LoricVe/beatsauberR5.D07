export class LevelManager {
    constructor(cubeManager) {
        this.cubeManager = cubeManager;
        this.currentLevel = null;
        this.levelData = null;
        this.spawnIndex = 0;
        this.levelComplete = false;
        this.elapsedTime = 0;
        this.beatDetector = null;
        this.useBeatSync = false;
    }

    /**
     * Charge un niveau avec synchronisation musicale
     */
    loadLevelWithMusic(difficulty, beatDetector, musicDuration) {
        this.beatDetector = beatDetector;
        this.useBeatSync = beatDetector !== null;

        if (this.useBeatSync) {
            // Générer un niveau synchronisé avec la musique
            const events = beatDetector.generatePatterns(difficulty, musicDuration);
            this.levelData = {
                events: events,
                duration: musicDuration
            };
            console.log(`Niveau généré avec ${events.length} cubes synchronisés sur la musique (BPM: ${beatDetector.getBPM()})`);
        } else {
            // Fallback sur la génération classique
            this.levelData = this.generateLevelData(difficulty);
        }

        this.spawnIndex = 0;
        this.levelComplete = false;
        this.elapsedTime = 0;
        this.currentLevel = difficulty;
    }

    /**
     * Charge un niveau sans musique (mode classique)
     */
    loadLevel(difficulty) {
        this.loadLevelWithMusic(difficulty, null, 100);
    }

    generateLevelData(difficulty) {
        const patterns = {
            beginner: this.generateBeginnerPattern(),
            normal: this.generateNormalPattern(),
            expert: this.generateExpertPattern(),
            expertPlus: this.generateExpertPlusPattern()
        };

        return patterns[difficulty] || patterns.normal;
    }

    generateBeginnerPattern() {
        const events = [];
        const colors = ['red', 'blue'];

        for (let i = 0; i < 40; i++) {
            const time = i * 2.5;
            const color = colors[i % 2];
            // NOUVEAU: Cubes à gauche (rouge) ou droite (bleu)
            const x = color === 'red' ? -2 : 2;
            const y = 1.5;

            events.push({
                time,
                type: 'cube',
                color,
                direction: 'none', // Pas de direction pour mode Débutant
                position: { x, y, z: -20 }
            });
        }

        return { events, duration: 100 };
    }

    generateNormalPattern() {
        const events = [];
        const colors = ['red', 'blue'];

        for (let i = 0; i < 60; i++) {
            const time = i * 1.8;
            const color = colors[i % 2];
            // NOUVEAU: Cubes à gauche (rouge) ou droite (bleu)
            const x = color === 'red' ? -2 : 2;
            const y = 1.5;

            events.push({
                time,
                type: 'cube',
                color,
                direction: 'none', // Pas de direction pour mode Normal
                position: { x, y, z: -20 }
            });

            // Parfois deux cubes rapprochés pour varier
            if (i % 4 === 0) {
                const color2 = colors[(i + 1) % 2];
                const x2 = color2 === 'red' ? -2 : 2;
                events.push({
                    time: time + 0.4,
                    type: 'cube',
                    color: color2,
                    direction: 'none', // Pas de direction pour mode Normal
                    position: { x: x2, y, z: -20 }
                });
            }
        }

        return { events, duration: 120 };
    }

    generateExpertPattern() {
        const events = [];
        const directions = ['up', 'down', 'left', 'right', 'upLeft', 'upRight', 'downLeft', 'downRight'];
        const colors = ['red', 'blue'];

        for (let i = 0; i < 80; i++) {
            const time = i * 1.2;

            for (let j = 0; j < 2; j++) {
                const color = colors[(i + j) % 2];
                const direction = directions[Math.floor(Math.random() * directions.length)];
                // NOUVEAU: Cubes à gauche (rouge) ou droite (bleu)
                const x = color === 'red' ? -2 : 2;
                const y = 1.5;

                events.push({
                    time: time + j * 0.2,
                    type: 'cube',
                    color,
                    direction,
                    position: { x, y, z: -20 }
                });
            }
        }

        return { events, duration: 110 };
    }

    generateExpertPlusPattern() {
        const events = [];
        const directions = ['up', 'down', 'left', 'right', 'upLeft', 'upRight', 'downLeft', 'downRight'];
        const colors = ['red', 'blue'];

        for (let i = 0; i < 100; i++) {
            const time = i * 0.8;

            const cubeCount = 2 + Math.floor(Math.random() * 2);
            for (let j = 0; j < cubeCount; j++) {
                const color = colors[Math.floor(Math.random() * 2)];
                const direction = directions[Math.floor(Math.random() * directions.length)];
                // NOUVEAU: Cubes à gauche (rouge) ou droite (bleu)
                const x = color === 'red' ? -2 : 2;
                const y = 1.5;

                events.push({
                    time: time + j * 0.15,
                    type: 'cube',
                    color,
                    direction,
                    position: { x, y, z: -20 }
                });
            }
        }

        return { events, duration: 100 };
    }

    update(delta) {
        if (!this.levelData || this.levelComplete) return;

        this.elapsedTime += delta;

        while (this.spawnIndex < this.levelData.events.length) {
            const event = this.levelData.events[this.spawnIndex];

            if (this.elapsedTime >= event.time) {
                this.spawnEvent(event);
                this.spawnIndex++;
            } else {
                break;
            }
        }

        if (this.spawnIndex >= this.levelData.events.length) {
            this.levelComplete = true;
        }
    }

    spawnEvent(event) {
        if (event.type === 'cube') {
            this.cubeManager.spawnCube(
                event.color,
                event.direction,
                event.position.x,
                event.position.y,
                event.position.z
            );
        }
    }

    isLevelComplete() {
        return this.levelComplete;
    }
}
