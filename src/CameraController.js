import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.viewMode = 'firstPerson';

        this.firstPersonPosition = new THREE.Vector3(0, 1.6, 5);
        this.thirdPersonPosition = new THREE.Vector3(0, 3, 8);

        this.orbitControls = new OrbitControls(this.camera, this.domElement);
        this.orbitControls.enabled = false;
        this.orbitControls.target.set(0, 1, 0);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;

        this.shakeAmount = 0;
        this.shakeDecay = 5;

        this.setView('firstPerson');
    }

    setView(mode) {
        this.viewMode = mode;

        switch(mode) {
            case 'firstPerson':
                this.camera.position.copy(this.firstPersonPosition);
                this.camera.lookAt(0, 1.5, 0);
                this.orbitControls.enabled = false;
                break;

            case 'thirdPerson':
                this.camera.position.copy(this.thirdPersonPosition);
                this.camera.lookAt(0, 1, 0);
                this.orbitControls.enabled = false;
                break;

            case 'free':
                this.camera.position.set(0, 5, 10);
                this.orbitControls.enabled = true;
                this.orbitControls.target.set(0, 1, 0);
                this.orbitControls.update();
                break;
        }
    }

    switchView() {
        const modes = ['firstPerson', 'thirdPerson', 'free'];
        const currentIndex = modes.indexOf(this.viewMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setView(modes[nextIndex]);

        console.log(`Camera view: ${modes[nextIndex]}`);
    }

    resetPosition() {
        this.setView('firstPerson');
    }

    shake(amount = 0.5) {
        this.shakeAmount = amount;
    }

    update(delta) {
        if (this.orbitControls.enabled) {
            this.orbitControls.update();
        }

        if (this.shakeAmount > 0) {
            const offsetX = (Math.random() - 0.5) * this.shakeAmount;
            const offsetY = (Math.random() - 0.5) * this.shakeAmount;

            this.camera.position.x += offsetX;
            this.camera.position.y += offsetY;

            this.shakeAmount -= this.shakeDecay * delta;
            if (this.shakeAmount < 0) this.shakeAmount = 0;
        }
    }
}
