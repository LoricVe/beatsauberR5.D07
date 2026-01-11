export class GameModeManager {
    constructor() {
        this.currentMode = null; // 'vr' ou 'keyboard-mouse'
        this.vrSupported = false;

        this.checkVRSupport();
    }

    async checkVRSupport() {
        if ('xr' in navigator) {
            try {
                this.vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
            } catch (error) {
                console.log('VR not supported:', error);
                this.vrSupported = false;
            }
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        console.log(`Game mode set to: ${mode}`);
    }

    getMode() {
        return this.currentMode;
    }

    isVRMode() {
        return this.currentMode === 'vr';
    }

    isKeyboardMouseMode() {
        return this.currentMode === 'keyboard-mouse';
    }

    isVRSupported() {
        return this.vrSupported;
    }

    getModeConfig() {
        if (this.isVRMode()) {
            return {
                name: 'VR Mode',
                description: 'Expérience Beat Saber authentique avec casque VR',
                controls: {
                    movement: 'Manettes VR',
                    sabers: 'Position et rotation des manettes',
                    collision: 'Précise (vraie 3D)',
                    difficulty: 'Tous niveaux disponibles'
                },
                gameplay: {
                    cubeSpeed: 'Standard',
                    saberControl: 'Physique (6DOF)',
                    directionCheck: true,
                    comboSystem: 'Standard Beat Saber'
                }
            };
        } else {
            return {
                name: 'Clavier/Souris',
                description: 'Mode fun optimisé pour le desktop',
                controls: {
                    movement: 'Souris (X/Y)',
                    sabers: 'Suivi de la souris',
                    collision: 'Tolérante',
                    actions: 'Clic gauche/droit pour effets'
                },
                gameplay: {
                    cubeSpeed: 'Ajustable',
                    saberControl: 'Simplifié (2D/3D)',
                    directionCheck: 'Optionnelle selon difficulté',
                    comboSystem: 'Simplifié et généreux'
                }
            };
        }
    }
}
