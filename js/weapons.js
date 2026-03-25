/**
 * weapons.js - Weapon Definitions and 3D Viewmodels
 */

const WeaponDefs = {
    AK47: {
        name: 'AK-47',
        damage: 28,
        headDamage: 75,
        fireRate: 100,
        magSize: 30,
        totalAmmo: 120,
        reloadTime: 2200,
        recoil: 0.025,
        spread: 0.02,
        range: 200,
        auto: true
    },
    SHOTGUN: {
        name: 'Shotgun',
        damage: 15,
        headDamage: 30,
        fireRate: 800,
        magSize: 8,
        totalAmmo: 32,
        reloadTime: 2500,
        recoil: 0.06,
        spread: 0.08,
        range: 40,
        auto: false,
        pellets: 8
    },
    SNIPER: {
        name: 'Sniper',
        damage: 85,
        headDamage: 150,
        fireRate: 1200,
        magSize: 5,
        totalAmmo: 20,
        reloadTime: 3000,
        recoil: 0.08,
        spread: 0.002,
        range: 500,
        auto: false
    },
    PISTOL: {
        name: 'Pistol',
        damage: 18,
        headDamage: 45,
        fireRate: 200,
        magSize: 12,
        totalAmmo: 48,
        reloadTime: 1400,
        recoil: 0.015,
        spread: 0.015,
        range: 100,
        auto: false
    }
};

class WeaponViewModel {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.group = new THREE.Group();
        this.bobTime = 0;
        this.recoilOffset = 0;
        this.swayX = 0;
        this.swayY = 0;
        this.currentWeaponType = null;

        // Attach to camera
        this.camera.add(this.group);
    }

    buildModel(weaponKey) {
        // Clear old
        while (this.group.children.length > 0) {
            const child = this.group.children[0];
            this.group.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }

        this.currentWeaponType = weaponKey;

        const gunMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, metalness: 0.1, roughness: 0.8 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });

        switch (weaponKey) {
            case 'AK47': {
                // Barrel
                const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.6), gunMat);
                barrel.position.set(0.0, -0.02, -0.5);
                this.group.add(barrel);

                // Body
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.35), gunMat);
                body.position.set(0.0, -0.04, -0.15);
                this.group.add(body);

                // Stock
                const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.2), woodMat);
                stock.position.set(0.0, -0.05, 0.1);
                this.group.add(stock);

                // Magazine
                const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.06), darkMat);
                mag.position.set(0.0, -0.12, -0.1);
                mag.rotation.x = 0.2;
                this.group.add(mag);

                // Grip
                const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.03), woodMat);
                grip.position.set(0.0, -0.1, 0.0);
                grip.rotation.x = 0.3;
                this.group.add(grip);

                this.group.position.set(0.25, -0.22, -0.4);
                this.group.rotation.set(0, 0, 0);
                break;
            }
            case 'SHOTGUN': {
                // Double barrel
                const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), gunMat);
                b1.rotation.x = Math.PI / 2;
                b1.position.set(-0.015, -0.01, -0.5);
                this.group.add(b1);
                const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), gunMat);
                b2.rotation.x = Math.PI / 2;
                b2.position.set(0.015, -0.01, -0.5);
                this.group.add(b2);

                // Body
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.3), woodMat);
                body.position.set(0.0, -0.04, -0.1);
                this.group.add(body);

                // Stock
                const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.25), woodMat);
                stock.position.set(0.0, -0.05, 0.15);
                this.group.add(stock);

                this.group.position.set(0.25, -0.22, -0.35);
                break;
            }
            case 'SNIPER': {
                // Long barrel
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8), gunMat);
                barrel.rotation.x = Math.PI / 2;
                barrel.position.set(0, -0.01, -0.6);
                this.group.add(barrel);

                // Scope
                const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), darkMat);
                scope.position.set(0, 0.04, -0.2);
                this.group.add(scope);

                // Body
                const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.4), gunMat);
                body.position.set(0, -0.03, -0.15);
                this.group.add(body);

                // Stock
                const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.25), woodMat);
                stock.position.set(0, -0.04, 0.15);
                this.group.add(stock);

                this.group.position.set(0.25, -0.2, -0.4);
                break;
            }
            case 'PISTOL': {
                // Barrel/Slide
                const slide = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.18), gunMat);
                slide.position.set(0, -0.01, -0.12);
                this.group.add(slide);

                // Grip
                const grip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.08, 0.06), darkMat);
                grip.position.set(0, -0.06, -0.01);
                grip.rotation.x = 0.2;
                this.group.add(grip);

                this.group.position.set(0.2, -0.2, -0.3);
                break;
            }
        }
    }

    update(delta, isMoving, isRunning, mouseX, mouseY) {
        // Weapon bob
        if (isMoving) {
            const bobSpeed = isRunning ? 14 : 10;
            const bobAmount = isRunning ? 0.015 : 0.008;
            this.bobTime += delta * bobSpeed;
            this.group.position.y += Math.sin(this.bobTime) * bobAmount;
            this.group.position.x += Math.cos(this.bobTime * 0.5) * bobAmount * 0.5;
        } else {
            // Idle sway
            this.bobTime += delta * 2;
            this.group.position.y += Math.sin(this.bobTime) * 0.001;
        }

        // Weapon sway from mouse
        this.swayX += (mouseX * 0.0002 - this.swayX) * 5 * delta;
        this.swayY += (mouseY * 0.0002 - this.swayY) * 5 * delta;
        this.group.rotation.y = -this.swayX;
        this.group.rotation.x = this.swayY;

        // Recoil recovery
        if (this.recoilOffset > 0) {
            this.recoilOffset -= delta * 8;
            if (this.recoilOffset < 0) this.recoilOffset = 0;
        }
        this.group.rotation.x -= this.recoilOffset;
        this.group.position.z += this.recoilOffset * 0.3;
    }

    applyRecoil(amount) {
        this.recoilOffset = amount;
    }
}
