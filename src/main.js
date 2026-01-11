import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GameManager } from './GameManager.js';
import { CameraController } from './CameraController.js';
import { UIManager } from './UIManager.js';

class BeatSaberGame {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.clock = new THREE.Clock();

        this.init();
        this.setupPostProcessing();
        this.animate();

        document.getElementById('loading').style.display = 'none';
    }

    init() {
        this.scene = new THREE.Scene();
        // Fog pour profondeur spatiale
        this.scene.fog = new THREE.Fog(0x000000, 30, 100);
        // Fond noir profond de l'espace (comme dans l'image)
        this.scene.background = new THREE.Color(0x000000);

        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(80, aspect, 0.1, 1000);
        // Caméra plus en hauteur et légèrement en arrière pour une meilleure vue 3D
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, -5);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.3;
        this.container.appendChild(this.renderer.domElement);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.cameraController = new CameraController(this.camera, this.renderer.domElement);
        this.gameManager = new GameManager(this.scene, this.camera, this.raycaster);
        this.uiManager = new UIManager(this.gameManager);
        this.gameManager.setUIManager(this.uiManager);

        this.setupLights();
        this.setupEventListeners();
    }

    setupLights() {
        // Lumière ambiante douce
        const ambientLight = new THREE.AmbientLight(0x1a1a2a, 0.5);
        this.scene.add(ambientLight);

        // Lumière directionnelle principale
        const directionalLight = new THREE.DirectionalLight(0x6688ff, 0.8);
        directionalLight.position.set(0, 15, 10);
        this.scene.add(directionalLight);

        // Lumières rouges (cubes rouges)
        const redLight1 = new THREE.PointLight(0xff0055, 3, 22);
        redLight1.position.set(-4, 2, 0);
        this.scene.add(redLight1);

        const redLight2 = new THREE.PointLight(0xff0055, 2, 18);
        redLight2.position.set(-2, 3, -6);
        this.scene.add(redLight2);

        // Lumières bleues (cubes bleus)
        const blueLight1 = new THREE.PointLight(0x0055ff, 3, 22);
        blueLight1.position.set(4, 2, 0);
        this.scene.add(blueLight1);

        const blueLight2 = new THREE.PointLight(0x0055ff, 2, 18);
        blueLight2.position.set(2, 3, -6);
        this.scene.add(blueLight2);

        // Lumière cyan arrière pour la profondeur
        const backLight = new THREE.PointLight(0x00ddff, 2, 40);
        backLight.position.set(0, 6, -20);
        this.scene.add(backLight);

        // Lumières latérales subtiles (spatiales)
        const sideLight1 = new THREE.PointLight(0x4400ff, 1.2, 35);
        sideLight1.position.set(-12, 2, -15);
        this.scene.add(sideLight1);

        const sideLight2 = new THREE.PointLight(0xff0044, 1.2, 35);
        sideLight2.position.set(12, 2, -15);
        this.scene.add(sideLight2);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom TRÈS INTENSE comme dans l'image de référence
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            3.0,      // strength TRÈS élevée
            1.2,      // radius large pour halos
            0.0       // threshold TRÈS bas pour tout illuminer
        );
        bloomPass.threshold = 0.0;
        bloomPass.strength = 3.0;
        bloomPass.radius = 1.2;
        this.composer.addPass(bloomPass);

        this.bloomPass = bloomPass;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        document.getElementById('retry-btn').addEventListener('click', () => {
            this.gameManager.restartLevel();
            document.getElementById('game-over').style.display = 'none';
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.gameManager.returnToMenu();
            document.getElementById('game-over').style.display = 'none';
        });
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.gameManager.updateSaberPositions(this.mouse);
    }

    onMouseDown(event) {
        event.preventDefault();
        const isLeftClick = event.button === 0;
        this.gameManager.activateSaber(isLeftClick ? 'left' : 'right', this.mouse);
    }

    onMouseUp(event) {
        const isLeftClick = event.button === 0;
        this.gameManager.deactivateSaber(isLeftClick ? 'left' : 'right');
    }

    onKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'v':
                this.cameraController.switchView();
                break;
            case 'r':
                this.cameraController.resetPosition();
                break;
            case 'p':
                // Touche P pour pause (Espace utilisée pour changer couleur en mode rythme)
                if (this.gameManager.isPaused) {
                    this.gameManager.resume();
                } else {
                    this.gameManager.pause();
                }
                break;
            case 'escape':
                this.gameManager.returnToMenu();
                break;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        this.cameraController.update();
        this.gameManager.update(delta);

        // Utiliser le renderer directement au lieu du composer
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new BeatSaberGame();
});
