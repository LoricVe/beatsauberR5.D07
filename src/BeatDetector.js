export class BeatDetector {
    constructor(audioContext, audioBuffer) {
        this.audioContext = audioContext;
        this.audioBuffer = audioBuffer;
        this.beats = [];
        this.bpm = 120; // BPM par défaut
        this.isAnalyzed = false;
    }

    /**
     * Analyse le buffer audio pour détecter les beats
     * Utilise la détection d'énergie sur les basses fréquences
     */
    async analyzeBPM() {
        if (!this.audioBuffer) {
            console.warn('Pas de buffer audio à analyser');
            return;
        }

        const offlineContext = new OfflineAudioContext(
            1,
            this.audioBuffer.length,
            this.audioBuffer.sampleRate
        );

        // Créer un filtre passe-bas pour isoler les basses (kick, bass)
        const source = offlineContext.createBufferSource();
        source.buffer = this.audioBuffer;

        const lowpass = offlineContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 150; // Fréquences basses (kick drum)
        lowpass.Q.value = 1;

        source.connect(lowpass);
        lowpass.connect(offlineContext.destination);
        source.start(0);

        const filteredBuffer = await offlineContext.startRendering();
        const data = filteredBuffer.getChannelData(0);

        // Analyser l'énergie pour détecter les pics (beats)
        this.detectBeats(data, filteredBuffer.sampleRate);
        this.calculateBPM();

        this.isAnalyzed = true;
        console.log(`BPM détecté: ${this.bpm.toFixed(1)}`);
        console.log(`${this.beats.length} beats détectés`);
    }

    /**
     * Détecte les beats en analysant les pics d'énergie
     */
    detectBeats(data, sampleRate) {
        const windowSize = 1024;
        const hopSize = 512;
        const threshold = 1.3; // Seuil pour considérer un pic comme un beat

        let energyHistory = [];
        const historySize = 43; // ~1 seconde à 44100Hz avec hopSize=512

        for (let i = 0; i < data.length - windowSize; i += hopSize) {
            // Calculer l'énergie de la fenêtre
            let energy = 0;
            for (let j = 0; j < windowSize; j++) {
                energy += data[i + j] * data[i + j];
            }
            energy /= windowSize;

            // Garder un historique de l'énergie
            energyHistory.push(energy);
            if (energyHistory.length > historySize) {
                energyHistory.shift();
            }

            // Calculer l'énergie moyenne sur l'historique
            const avgEnergy = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;

            // Si l'énergie actuelle dépasse le seuil * moyenne, c'est un beat
            if (energy > threshold * avgEnergy && energyHistory.length === historySize) {
                const time = (i / sampleRate);

                // Éviter les doubles détections (minimum 0.1s entre deux beats)
                if (this.beats.length === 0 || time - this.beats[this.beats.length - 1] > 0.1) {
                    this.beats.push(time);
                }
            }
        }
    }

    /**
     * Calcule le BPM moyen à partir des intervalles entre beats
     */
    calculateBPM() {
        if (this.beats.length < 2) {
            console.warn('Pas assez de beats détectés pour calculer le BPM');
            return;
        }

        // Calculer les intervalles entre beats
        const intervals = [];
        for (let i = 1; i < this.beats.length; i++) {
            intervals.push(this.beats[i] - this.beats[i - 1]);
        }

        // Calculer l'intervalle médian (plus robuste que la moyenne)
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];

        // Convertir en BPM
        this.bpm = 60 / medianInterval;

        // Arrondir au BPM le plus proche (multiples de 5 souvent)
        this.bpm = Math.round(this.bpm / 5) * 5;
    }

    /**
     * Génère une grille de beats réguliers basée sur le BPM
     * Utile pour avoir des beats précis même si la détection n'est pas parfaite
     */
    generateBeatGrid(duration) {
        const beatInterval = 60 / this.bpm;
        const beats = [];

        for (let time = 0; time < duration; time += beatInterval) {
            beats.push(time);
        }

        return beats;
    }

    /**
     * Fusionne les beats détectés avec une grille régulière
     * Retourne les beats les plus proches de la grille
     */
    getQuantizedBeats(duration) {
        if (this.beats.length === 0) {
            return this.generateBeatGrid(duration);
        }

        const grid = this.generateBeatGrid(duration);
        const quantized = [];

        for (const gridBeat of grid) {
            // Trouver le beat détecté le plus proche
            let closest = this.beats[0];
            let minDist = Math.abs(gridBeat - closest);

            for (const beat of this.beats) {
                const dist = Math.abs(gridBeat - beat);
                if (dist < minDist) {
                    minDist = dist;
                    closest = beat;
                }
            }

            // Si le beat détecté est assez proche de la grille, l'utiliser
            if (minDist < 0.15) {
                quantized.push(closest);
            } else {
                quantized.push(gridBeat);
            }
        }

        return quantized;
    }

    /**
     * Retourne les temps des beats (quantifiés pour être plus réguliers)
     */
    getBeatTimes(duration) {
        if (!this.isAnalyzed) {
            console.warn('Analyse non effectuée, utilisation d\'une grille régulière');
            return this.generateBeatGrid(duration);
        }

        return this.getQuantizedBeats(duration);
    }

    getBPM() {
        return this.bpm;
    }

    /**
     * Génère des patterns de beats complexes basés sur la difficulté
     */
    generatePatterns(difficulty, duration) {
        const beatTimes = this.getBeatTimes(duration);
        const beatInterval = 60 / this.bpm;

        const patterns = {
            beginner: this.generateBeginnerPattern(beatTimes, beatInterval),
            normal: this.generateNormalPattern(beatTimes, beatInterval),
            expert: this.generateExpertPattern(beatTimes, beatInterval),
            expertPlus: this.generateExpertPlusPattern(beatTimes, beatInterval)
        };

        return patterns[difficulty] || patterns.normal;
    }

    // Patterns musicaux prédéfinis
    createPattern(name, startTime, interval, colors = ['red', 'blue']) {
        const patterns = {
            // Pattern simple: rouge - bleu
            'simple': [
                { delay: 0, color: colors[0], dir: 'none' },
                { delay: interval * 2, color: colors[1], dir: 'none' }
            ],
            // Pattern alternance rapide
            'alternate': [
                { delay: 0, color: colors[0], dir: 'none' },
                { delay: interval, color: colors[1], dir: 'none' },
                { delay: interval * 2, color: colors[0], dir: 'none' }
            ],
            // Pattern double (2 cubes rapprochés)
            'double': [
                { delay: 0, color: colors[0], dir: 'none' },
                { delay: interval * 0.5, color: colors[1], dir: 'none' }
            ],
            // Pattern montée (avec directions)
            'climb': [
                { delay: 0, color: colors[0], dir: 'down' },
                { delay: interval, color: colors[1], dir: 'up' }
            ],
            // Pattern croisé
            'cross': [
                { delay: 0, color: colors[0], dir: 'left' },
                { delay: interval, color: colors[1], dir: 'right' }
            ]
        };

        const pattern = patterns[name] || patterns['simple'];
        return pattern.map(p => {
            const x = p.color === 'red' ? -2 : 2; // NOUVEAU: Position selon couleur
            return {
                time: startTime + p.delay,
                type: 'cube',
                color: p.color,
                direction: p.dir,
                position: { x, y: 1.5, z: -20 }
            };
        });
    }

    generateBeginnerPattern(beatTimes) {
        const events = [];

        // DÉBUTANT: UN SEUL cube tous les 16 beats (très espacé et prévisible)
        // Alternance simple rouge-bleu pour apprendre le timing
        for (let i = 0; i < beatTimes.length; i += 16) {
            if (i >= beatTimes.length) break;

            // Un seul cube à la fois, alternance rouge/bleu
            const color = (Math.floor(i / 16) % 2 === 0) ? 'red' : 'blue';
            const x = color === 'red' ? -2 : 2; // NOUVEAU: Position selon couleur
            events.push({
                time: beatTimes[i],
                type: 'cube',
                color: color,
                direction: 'none',
                position: { x, y: 1.5, z: -20 }
            });
        }

        return events;
    }

    generateNormalPattern(beatTimes) {
        const events = [];

        // NORMAL: Patterns variés pour suivre la musique
        // Différentes combinaisons rouge-bleu
        const patterns = [
            ['red', 'blue'],      // Pattern 1: Rouge puis Bleu
            ['blue', 'red'],      // Pattern 2: Bleu puis Rouge
            ['red', 'red'],       // Pattern 3: Deux Rouges
            ['blue', 'blue'],     // Pattern 4: Deux Bleus
            ['blue', 'red', 'blue'], // Pattern 5: Bleu-Rouge-Bleu (3 cubes)
            ['red', 'blue', 'red']   // Pattern 6: Rouge-Bleu-Rouge (3 cubes)
        ];

        let patternIndex = 0;

        for (let i = 0; i < beatTimes.length; i += 8) {
            if (i >= beatTimes.length) break;

            // Choisir un pattern et l'alterner
            const currentPattern = patterns[patternIndex % patterns.length];
            patternIndex++;

            // Générer les cubes du pattern
            for (let j = 0; j < currentPattern.length; j++) {
                const beatOffset = j * 2; // 2 beats entre chaque cube
                if (i + beatOffset < beatTimes.length) {
                    const color = currentPattern[j];
                    const x = color === 'red' ? -2 : 2;

                    events.push({
                        time: beatTimes[i + beatOffset],
                        type: 'cube',
                        color: color,
                        direction: 'none',
                        position: { x, y: 1.5, z: -20 }
                    });
                }
            }
        }

        return events;
    }

    generateExpertPattern(beatTimes) {
        const events = [];

        // EXPERT: Patterns variés avec directions et espacement de 2 beats
        const patterns = [
            { colors: ['red', 'blue', 'red'], dirs: ['down', 'up', 'left'] },
            { colors: ['blue', 'red', 'blue'], dirs: ['up', 'down', 'right'] },
            { colors: ['red', 'red', 'blue'], dirs: ['left', 'right', 'up'] },
            { colors: ['blue', 'blue', 'red'], dirs: ['right', 'left', 'down'] },
            { colors: ['red', 'blue', 'blue'], dirs: ['down', 'right', 'left'] },
            { colors: ['blue', 'red', 'red'], dirs: ['up', 'left', 'right'] }
        ];

        let patternIndex = 0;

        for (let i = 0; i < beatTimes.length; i += 8) {
            if (i >= beatTimes.length) break;

            const currentPattern = patterns[patternIndex % patterns.length];
            patternIndex++;

            for (let j = 0; j < 3; j++) {
                const beatOffset = j * 2; // Espacer de 2 beats au lieu de 1
                if (i + beatOffset < beatTimes.length) {
                    const color = currentPattern.colors[j];
                    const direction = currentPattern.dirs[j];
                    const x = color === 'red' ? -2 : 2;

                    events.push({
                        time: beatTimes[i + beatOffset],
                        type: 'cube',
                        color: color,
                        direction: direction,
                        position: { x, y: 1.5, z: -20 }
                    });
                }
            }
        }

        return events;
    }

    generateExpertPlusPattern(beatTimes) {
        const events = [];

        // EXPERT+: Patterns très variés et complexes - 3 cubes tous les 5 beats
        const patterns = [
            // Pattern 1: Alternance avec diagonales
            [
                { color: 'red', dir: 'upLeft' },
                { color: 'blue', dir: 'upRight' },
                { color: 'red', dir: 'downLeft' }
            ],
            // Pattern 2: Bleu dominant avec croix
            [
                { color: 'blue', dir: 'up' },
                { color: 'blue', dir: 'left' },
                { color: 'red', dir: 'right' }
            ],
            // Pattern 3: Rouge dominant avec croix
            [
                { color: 'red', dir: 'down' },
                { color: 'red', dir: 'right' },
                { color: 'blue', dir: 'left' }
            ],
            // Pattern 4: Diagonales inversées
            [
                { color: 'blue', dir: 'downRight' },
                { color: 'red', dir: 'downLeft' },
                { color: 'blue', dir: 'upRight' }
            ],
            // Pattern 5: Mix rapide
            [
                { color: 'red', dir: 'up' },
                { color: 'blue', dir: 'down' },
                { color: 'red', dir: 'left' }
            ],
            // Pattern 6: Challenge max
            [
                { color: 'blue', dir: 'right' },
                { color: 'red', dir: 'upRight' },
                { color: 'blue', dir: 'downLeft' }
            ]
        ];

        let patternIndex = 0;

        for (let i = 0; i < beatTimes.length; i += 6) {
            if (i >= beatTimes.length) break;

            const currentPattern = patterns[patternIndex % patterns.length];
            patternIndex++;

            for (let j = 0; j < 3; j++) {
                const beatOffset = j + (j > 0 ? 1 : 0); // 0, 2, 3 beats de spacing
                if (i + beatOffset < beatTimes.length) {
                    const color = currentPattern[j].color;
                    const direction = currentPattern[j].dir;
                    const x = color === 'red' ? -2 : 2;

                    events.push({
                        time: beatTimes[i + beatOffset],
                        type: 'cube',
                        color: color,
                        direction: direction,
                        position: { x, y: 1.5, z: -20 }
                    });
                }
            }
        }

        return events;
    }
}
