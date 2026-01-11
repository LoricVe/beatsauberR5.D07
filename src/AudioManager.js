import { BeatDetector } from './BeatDetector.js';

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.musicSource = null;
        this.musicBuffer = null;
        this.analyser = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pauseTime = 0;

        this.sounds = {
            hit: null,
            miss: null,
            wrong: null
        };

        // Catalogue de musiques disponibles
        const baseUrl = import.meta.env.BASE_URL;
        this.musicLibrary = [
            {
                id: 'music1',
                name: 'Get Lucky',
                file: `${baseUrl}music/song1.mp3`,
                artist: 'Daft Punk ft. Pharrell Williams',
                bpm: 116 // BPM suggéré (sera recalculé)
            },
            {
                id: 'music2',
                name: 'Memories',
                file: `${baseUrl}music/song2.mp3`,
                artist: 'David Guetta ft. Kid Cudi',
                bpm: 130
            },
            {
                id: 'music3',
                name: 'I Love It',
                file: `${baseUrl}music/song3.mp3`,
                artist: 'Icona Pop ft. Charli XCX',
                bpm: 126
            }
        ];

        this.currentMusic = null;
        this.beatDetector = null;

        this.initAudioContext();
        this.loadSounds();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.connect(this.audioContext.destination);
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    loadSounds() {
        console.log('Audio sounds would be loaded here');
    }

    async loadMusic(url) {
        if (!this.audioContext) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.warn('Could not load music:', error);
        }
    }

    /**
     * Charge une musique par son ID et analyse ses beats
     */
    async loadMusicById(musicId) {
        const music = this.musicLibrary.find(m => m.id === musicId);
        if (!music) {
            console.error(`Musique ${musicId} non trouvée`);
            return null;
        }

        this.currentMusic = music;

        try {
            await this.loadMusic(music.file);

            // Analyser les beats de la musique
            if (this.musicBuffer) {
                this.beatDetector = new BeatDetector(this.audioContext, this.musicBuffer);
                await this.beatDetector.analyzeBPM();
                console.log(`Musique "${music.name}" chargée. BPM: ${this.beatDetector.getBPM()}`);
            }

            return this.beatDetector;
        } catch (error) {
            console.error('Erreur lors du chargement de la musique:', error);
            return null;
        }
    }

    /**
     * Retourne la liste des musiques disponibles
     */
    getMusicLibrary() {
        return this.musicLibrary;
    }

    /**
     * Retourne la musique actuellement chargée
     */
    getCurrentMusic() {
        return this.currentMusic;
    }

    /**
     * Retourne le détecteur de beats
     */
    getBeatDetector() {
        return this.beatDetector;
    }

    /**
     * Retourne le temps de lecture actuel
     */
    getCurrentTime() {
        if (!this.audioContext) return 0;

        if (this.isPaused) {
            return this.pauseTime;
        }

        if (this.isPlaying) {
            return this.audioContext.currentTime - this.startTime;
        }

        return 0;
    }

    /**
     * Retourne la durée totale de la musique
     */
    getDuration() {
        return this.musicBuffer ? this.musicBuffer.duration : 0;
    }

    playMusic() {
        if (!this.audioContext || !this.musicBuffer) {
            console.log('Playing music (no audio loaded)');
            this.isPlaying = true;
            return;
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = this.musicBuffer;
        this.musicSource.connect(this.analyser);
        this.musicSource.start(0);

        this.startTime = this.audioContext.currentTime;
        this.isPlaying = true;
        this.isPaused = false;
    }

    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop();
            } catch (e) {
                // Source déjà arrêtée
            }
            this.musicSource = null;
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pauseTime = 0;
    }

    pause() {
        if (this.audioContext && this.isPlaying && !this.isPaused) {
            this.pauseTime = this.audioContext.currentTime - this.startTime;
            this.audioContext.suspend();
            this.isPaused = true;
        }
    }

    resume() {
        if (this.audioContext && this.isPaused) {
            this.audioContext.resume();
            this.startTime = this.audioContext.currentTime - this.pauseTime;
            this.isPaused = false;
        }
    }

    playSound(soundName) {
        console.log(`Playing sound: ${soundName}`);
    }

    getFrequencyData() {
        if (!this.analyser) return new Uint8Array(0);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    getAverageFrequency() {
        const dataArray = this.getFrequencyData();
        if (dataArray.length === 0) return 0;

        const sum = dataArray.reduce((a, b) => a + b, 0);
        return sum / dataArray.length / 255;
    }
}
