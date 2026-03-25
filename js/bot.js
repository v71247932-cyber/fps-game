/**
 * bot.js - AI Bot Controller
 * Simple state machine for bot behavior.
 */

class Bot {
    constructor(scene, colliders, target) {
        this.scene = scene;
        this.colliders = colliders;
        this.target = target; // Usually the player
        
        this.isBot = true;
        this.health = 100;
        this.velocity = new THREE.Vector3();
        this.speed = 4.0;
        
        this.mesh = this.createMesh();
        this.scene.add(this.mesh);
        
        this.lastShotTime = 0;
        this.shootInterval = 1500; // ms
        
        this.state = 'CHASE'; // CHASE, SHOOT, DEAD
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(0.8, 1.8, 0.5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x880000 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);
        
        group.isBot = true;
        return group;
    }

    spawn() {
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        this.mesh.position.set(x, 0, z);
        this.health = 100;
        this.state = 'CHASE';
        this.mesh.visible = true;
    }

    update(delta) {
        if (this.health <= 0) return;
        
        const distanceToTarget = this.mesh.position.distanceTo(this.target.yawObject.position);
        
        if (distanceToTarget < 20) {
            this.state = 'SHOOT';
        } else {
            this.state = 'CHASE';
        }

        switch(this.state) {
            case 'CHASE':
                this.chase(delta);
                break;
            case 'SHOOT':
                this.shoot(delta);
                break;
        }
    }

    chase(delta) {
        // Look at target
        this.mesh.lookAt(this.target.yawObject.position.x, 0, this.target.yawObject.position.z);
        
        // Move towards target
        const dir = new THREE.Vector3();
        dir.subVectors(this.target.yawObject.position, this.mesh.position).normalize();
        dir.y = 0;
        
        this.mesh.position.addScaledVector(dir, this.speed * delta);
    }

    shoot(delta) {
        this.mesh.lookAt(this.target.yawObject.position);
        
        const now = Date.now();
        if (now - this.lastShotTime > this.shootInterval) {
            this.lastShotTime = now;
            this.fire();
        }
        
        // Still move a bit or stay in place
        if (this.mesh.position.distanceTo(this.target.yawObject.position) > 10) {
            this.chase(delta);
        }
    }

    fire() {
        // Simple hit test against player
        const chance = Math.random();
        if (chance > 0.7) { // 30% accuracy
            this.target.takeDamage(10);
            console.log("Bot hit player!");
        }
        
        // Visual tracer (simple)
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            this.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
            this.target.yawObject.position
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const line = new THREE.Line(lineGeo, lineMat);
        this.scene.add(line);
        setTimeout(() => this.scene.remove(line), 100);
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`Bot health: ${this.health}`);
        
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.state = 'DEAD';
        this.mesh.visible = false;
        console.log("Bot died!");
        
        // Respawn after 5 seconds
        setTimeout(() => this.spawn(), 5000);
    }
}
