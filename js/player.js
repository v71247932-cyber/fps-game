/**
 * player.js - Player Controller
 * Handles movement, mouse look, shooting, and player state.
 */

class Player {
    constructor(camera, scene, colliders) {
        this.camera = camera;
        this.scene = scene;
        this.colliders = colliders;
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isRunning = false;
        
        this.health = 100;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.totalAmmo = 90;
        
        this.height = 1.8;
        this.speed = 40.0;
        this.runFactor = 1.5;
        
        this.controls = null;
        this.setupControls();
        this.setupEventListeners();
    }

    setupControls() {
        // Simplified PointerLockControls implementation
        const pitchObject = new THREE.Object3D();
        pitchObject.add(this.camera);
        
        const yawObject = new THREE.Object3D();
        yawObject.position.y = this.height;
        yawObject.add(pitchObject);
        
        this.scene.add(yawObject);
        this.yawObject = yawObject;
        this.pitchObject = pitchObject;
        
        this.controls = {
            lock: () => {
                document.body.requestPointerLock();
            },
            unlock: () => {
                document.exitPointerLock();
            }
        };

        const onMouseMove = (event) => {
            if (document.pointerLockElement !== document.body) return;
            
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;
            
            this.yawObject.rotation.y -= movementX * 0.002;
            this.pitchObject.rotation.x -= movementY * 0.002;
            
            this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
        };

        document.addEventListener('mousemove', onMouseMove);
    }

    setupEventListeners() {
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'Space': if (this.canJump === true) this.velocity.y += 350; this.canJump = false; break;
                case 'ShiftLeft': this.isRunning = true; break;
                case 'KeyR': this.reload(); break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'ShiftLeft': this.isRunning = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        document.addEventListener('mousedown', (e) => {
            if (document.pointerLockElement === document.body) {
                if (e.button === 0) this.shoot();
            } else {
                this.controls.lock();
            }
        });
    }

    spawn() {
        this.yawObject.position.set(0, this.height, 0);
        this.velocity.set(0, 0, 0);
        this.health = 100;
        this.updateHUD();
    }

    update(delta) {
        if (document.pointerLockElement !== document.body) return;
        
        // Simple friction
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 100.0 * delta; // Gravity

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        const currentSpeed = this.isRunning ? this.speed * this.runFactor : this.speed;

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * currentSpeed * 10.0 * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * currentSpeed * 10.0 * delta;

        // Collision detection (very basic)
        const nextX = this.yawObject.position.x - this.velocity.x * delta;
        const nextZ = this.yawObject.position.z - this.velocity.z * delta;
        
        // Floor collision
        if (this.yawObject.position.y < this.height) {
            this.velocity.y = 0;
            this.yawObject.position.y = this.height;
            this.canJump = true;
        }

        this.yawObject.translateX( -this.velocity.x * delta );
        this.yawObject.translateZ( -this.velocity.z * delta );
        this.yawObject.position.y += ( this.velocity.y * delta ); 
        
        if (this.yawObject.position.y < this.height) {
            this.velocity.y = 0;
            this.yawObject.position.y = this.height;
            this.canJump = true;
        }
    }

    shoot() {
        if (this.ammo <= 0) return;
        this.ammo--;
        this.updateHUD();
        
        // Raycasting for hit detection
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.showImpact(hit.point);
            
            // Check if hit entity
            if (hit.object.parent && hit.object.parent.isBot) {
                hit.object.parent.takeDamage(25);
                this.showHitmarker();
            }
        }
    }

    reload() {
        const needed = this.maxAmmo - this.ammo;
        const toReload = Math.min(needed, this.totalAmmo);
        this.ammo += toReload;
        this.totalAmmo -= toReload;
        this.updateHUD();
    }

    takeDamage(amount) {
        this.health -= amount;
        this.updateHUD();
        this.showDamageOverlay();
        
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        console.log("Player died!");
        this.spawn();
    }

    updateHUD() {
        document.getElementById('health-fill').style.width = `${this.health}%`;
        document.getElementById('health-text').innerText = Math.max(0, this.health);
        document.getElementById('ammo-current').innerText = this.ammo;
        document.getElementById('ammo-total').innerText = this.totalAmmo;
    }

    showImpact(point) {
        // Simple impact visual (dot)
        const geo = new THREE.SphereGeometry(0.05);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.position.copy(point);
        this.scene.add(sphere);
        setTimeout(() => this.scene.remove(sphere), 500);
    }

    showHitmarker() {
        const marker = document.getElementById('hit-marker');
        marker.classList.add('active');
        setTimeout(() => marker.classList.remove('active'), 100);
    }

    showDamageOverlay() {
        const overlay = document.getElementById('damage-overlay');
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 200);
    }
}
