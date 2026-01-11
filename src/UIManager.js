import { GameModeManager } from './GameModeManager.js';

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.gameModeManager = new GameModeManager();
        this.selectedMode = null;
        this.settings = {
            difficulty: 'normal',
            musicVolume: 0.7,
            sfxVolume: 0.8,
            bloomStrength: 1.2,
            particleEffects: true
        };

        this.initGUI();
    }

    initGUI() {
        console.log('GUI would be initialized here with dat.GUI or lil-gui');

        this.createModeSelection();
    }

    createModeSelection() {
        const menuContainer = document.createElement('div');
        menuContainer.id = 'main-menu';
        menuContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 10, 30, 0.98) 100%);
            padding: 60px 80px;
            border-radius: 30px;
            text-align: center;
            z-index: 1000;
            border: 4px solid #00ffff;
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.6), inset 0 0 30px rgba(0, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            font-family: 'Orbitron', sans-serif;
        `;

        const title = document.createElement('h1');
        title.textContent = 'BEAT SAUBER';
        title.style.cssText = `
            font-size: 72px;
            font-weight: 900;
            margin-bottom: 15px;
            background: linear-gradient(135deg, #00ffff 0%, #0099ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
            letter-spacing: 8px;
            text-transform: uppercase;
        `;
        menuContainer.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Rhythm Game';
        subtitle.style.cssText = `
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 50px;
            color: #88ccff;
            letter-spacing: 4px;
            text-transform: uppercase;
        `;
        menuContainer.appendChild(subtitle);

        const modeLabel = document.createElement('p');
        modeLabel.textContent = 'PRÊT À JOUER ?';
        modeLabel.style.cssText = `
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 35px;
            color: #ffffff;
            letter-spacing: 3px;
            text-transform: uppercase;
        `;
        menuContainer.appendChild(modeLabel);

        // Bouton Principal - Mode Clavier
        const playBtn = document.createElement('button');
        playBtn.innerHTML = '🎮 COMMENCER';
        playBtn.style.cssText = `
            display: block;
            width: 400px;
            margin: 20px auto;
            padding: 25px 40px;
            font-size: 28px;
            font-weight: 900;
            font-family: 'Orbitron', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 3px solid rgba(255, 255, 255, 0.4);
            color: white;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 3px;
            text-transform: uppercase;
            box-shadow: 0 5px 30px rgba(102, 126, 234, 0.5), 0 0 40px rgba(118, 75, 162, 0.4);
        `;

        playBtn.addEventListener('mouseenter', () => {
            playBtn.style.transform = 'scale(1.08) translateY(-5px)';
            playBtn.style.boxShadow = '0 10px 50px rgba(102, 126, 234, 0.8), 0 0 60px rgba(118, 75, 162, 0.6)';
            playBtn.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        });

        playBtn.addEventListener('mouseleave', () => {
            playBtn.style.transform = 'scale(1)';
            playBtn.style.boxShadow = '0 5px 30px rgba(102, 126, 234, 0.5), 0 0 40px rgba(118, 75, 162, 0.4)';
            playBtn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });

        playBtn.addEventListener('click', () => {
            this.selectedMode = 'keyboard-mouse';
            this.gameModeManager.setMode('keyboard-mouse');
            this.showMusicSelection(menuContainer);
        });

        menuContainer.appendChild(playBtn);

        // Info contrôles
        const controlsInfo = document.createElement('p');
        controlsInfo.innerHTML = '← / → ou Q / D pour jouer';
        controlsInfo.style.cssText = `
            font-size: 16px;
            font-weight: 700;
            margin-top: 30px;
            color: #88ccff;
            letter-spacing: 2px;
        `;
        menuContainer.appendChild(controlsInfo);

        document.body.appendChild(menuContainer);
        this.menuContainer = menuContainer;
    }

    showMusicSelection(container) {
        // Clear container
        container.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = 'BEAT SABER';
        title.style.cssText = `
            font-size: 48px;
            margin-bottom: 10px;
            color: #00ffff;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
        `;
        container.appendChild(title);

        const modeInfo = document.createElement('p');
        const currentModeConfig = this.gameModeManager.getModeConfig();
        modeInfo.textContent = `Mode: ${currentModeConfig.name}`;
        modeInfo.style.cssText = `
            font-size: 16px;
            margin-bottom: 20px;
            color: #00ff88;
        `;
        container.appendChild(modeInfo);

        const musicLabel = document.createElement('p');
        musicLabel.textContent = 'Choisissez votre musique :';
        musicLabel.style.cssText = `
            font-size: 20px;
            margin-bottom: 20px;
            color: #fff;
        `;
        container.appendChild(musicLabel);

        // Récupérer la liste des musiques depuis l'AudioManager
        const audioManager = this.gameManager.audioManager;
        const musicLibrary = audioManager.getMusicLibrary();

        musicLibrary.forEach((music, index) => {
            const btn = document.createElement('button');

            // Icône selon l'index
            const icons = ['🎵', '🎶', '🎸'];
            const icon = icons[index % icons.length];

            btn.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>${icon} ${music.name}</span>
                    <span style="font-size: 14px; opacity: 0.7;">${music.artist}</span>
                </div>
            `;

            const colors = ['#ff0066', '#00ff88', '#ffaa00'];
            const color = colors[index % colors.length];

            btn.style.cssText = `
                display: block;
                width: 400px;
                margin: 12px auto;
                padding: 18px 25px;
                font-size: 18px;
                background: linear-gradient(135deg, ${color}44 0%, ${color}88 100%);
                border: 2px solid ${color};
                color: white;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = `0 0 20px ${color}`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });

            btn.addEventListener('click', async () => {
                // Afficher un loader pendant le chargement
                btn.disabled = true;
                btn.innerHTML = '<div>⏳ Chargement et analyse...</div>';

                try {
                    // Charger la musique et analyser les beats
                    const beatDetector = await audioManager.loadMusicById(music.id);

                    if (beatDetector) {
                        this.selectedMusic = music.id;
                        this.showDifficultySelection(container);
                    } else {
                        // Erreur de chargement
                        btn.innerHTML = `<div>❌ Erreur de chargement</div>`;
                        setTimeout(() => {
                            btn.disabled = false;
                            btn.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <span>${icon} ${music.name}</span>
                                    <span style="font-size: 14px; opacity: 0.7;">${music.artist}</span>
                                </div>
                            `;
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Erreur lors du chargement de la musique:', error);
                    btn.innerHTML = `<div>❌ Erreur: Fichier non trouvé</div>`;
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span>${icon} ${music.name}</span>
                                <span style="font-size: 14px; opacity: 0.7;">${music.artist}</span>
                            </div>
                        `;
                    }, 2000);
                }
            });

            container.appendChild(btn);
        });

        // Info sur les fichiers
        const fileInfo = document.createElement('p');
        fileInfo.innerHTML = `
            <strong>💡 Note:</strong> Placez vos fichiers MP3 dans le dossier <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px;">public/music/</code><br>
            Nommés: song1.mp3, song2.mp3, song3.mp3
        `;
        fileInfo.style.cssText = `
            font-size: 12px;
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 200, 0, 0.1);
            border: 1px solid rgba(255, 200, 0, 0.3);
            border-radius: 8px;
            color: #ffcc66;
            line-height: 1.6;
        `;
        container.appendChild(fileInfo);

        // Back button
        const backBtn = document.createElement('button');
        backBtn.textContent = '← Retour';
        backBtn.style.cssText = `
            display: block;
            width: 200px;
            margin: 20px auto 0;
            padding: 10px 20px;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #888;
            color: #888;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        `;

        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            backBtn.style.color = '#fff';
        });

        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            backBtn.style.color = '#888';
        });

        backBtn.addEventListener('click', () => {
            this.createModeSelection();
            container.remove();
        });

        container.appendChild(backBtn);
    }

    showDifficultySelection(container) {
        // Clear container but keep title
        container.innerHTML = '';

        const title = document.createElement('h1');
        title.textContent = 'BEAT SABER';
        title.style.cssText = `
            font-size: 48px;
            margin-bottom: 10px;
            color: #00ffff;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
        `;
        container.appendChild(title);

        const modeInfo = document.createElement('p');
        const currentModeConfig = this.gameModeManager.getModeConfig();
        modeInfo.textContent = `Mode: ${currentModeConfig.name}`;
        modeInfo.style.cssText = `
            font-size: 16px;
            margin-bottom: 20px;
            color: #00ff88;
        `;
        container.appendChild(modeInfo);

        const difficultyLabel = document.createElement('p');
        difficultyLabel.textContent = 'Choisissez votre difficulté :';
        difficultyLabel.style.cssText = `
            font-size: 20px;
            margin-bottom: 20px;
            color: #fff;
        `;
        container.appendChild(difficultyLabel);

        const difficulties = [
            { name: 'Débutant', value: 'beginner', color: '#00ff88' },
            { name: 'Normal', value: 'normal', color: '#88ccff' },
            { name: 'Expert', value: 'expert', color: '#ffaa00' },
            { name: 'Expert+', value: 'expertPlus', color: '#ff0088' }
        ];

        difficulties.forEach(diff => {
            const btn = document.createElement('button');
            btn.textContent = diff.name;
            btn.style.cssText = `
                display: block;
                width: 300px;
                margin: 10px auto;
                padding: 15px 30px;
                font-size: 20px;
                background: linear-gradient(135deg, ${diff.color}44 0%, ${diff.color}88 100%);
                border: 2px solid ${diff.color};
                color: white;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = `0 0 20px ${diff.color}`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });

            btn.addEventListener('click', () => {
                this.settings.difficulty = diff.value;
                this.gameManager.startGame(diff.value, this.selectedMode);
                container.style.display = 'none';
            });

            container.appendChild(btn);
        });

        // Back button
        const backBtn = document.createElement('button');
        backBtn.textContent = '← Retour';
        backBtn.style.cssText = `
            display: block;
            width: 200px;
            margin: 20px auto 0;
            padding: 10px 20px;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #888;
            color: #888;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        `;

        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            backBtn.style.color = '#fff';
        });

        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            backBtn.style.color = '#888';
        });

        backBtn.addEventListener('click', () => {
            this.createModeSelection();
            container.remove();
        });

        container.appendChild(backBtn);

        // Controls info
        const controls = document.createElement('div');
        controls.style.cssText = `
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #444;
            font-size: 14px;
            color: #888;
        `;

        if (this.selectedMode === 'vr') {
            controls.innerHTML = `
                <p><strong>Contrôles VR :</strong></p>
                <p>Manettes VR : Déplacer pour découper les cubes</p>
                <p>Position 6DOF : Mouvement complet dans l'espace</p>
                <p>Toutes difficultés : Couleur + Direction requises</p>
            `;
        } else {
            controls.innerHTML = `
                <p><strong>Contrôles Clavier :</strong></p>
                <p><strong>ESPACE</strong> : Changer couleur du sabre (Bleu ⇄ Rouge)</p>
                <p><strong>D ou ENTER</strong> : Frapper le cube</p>
                <p>Timing : Appuyez au bon moment avec la bonne couleur !</p>
                <p>P : Pause | V : Changer vue | Échap : Menu</p>
            `;
        }
        container.appendChild(controls);
    }

    updateSettings(key, value) {
        this.settings[key] = value;
    }

    showMenu() {
        if (this.menuContainer) {
            this.menuContainer.style.display = 'block';
        }
    }

    hideMenu() {
        if (this.menuContainer) {
            this.menuContainer.style.display = 'none';
        }
    }

    showPauseMenu() {
        console.log('Show pause menu');
    }

    hidePauseMenu() {
        console.log('Hide pause menu');
    }
}
