/**
 * game.js - Core Three.js Engine
 * Manages the scene, renderer, camera, and the main game loop.
 */

class Game {
    constructor(config) {
        this.config = config;
        this.container = document.body;
        this.canvas = document.getElementById('game-canvas');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        this.player = null;
        this.objects = []; // Environmental objects
        this.entities = []; // Players, Bots
        this.bullets = [];
        
        this.isPaused = false;
        this.isRunning = false;
        
        this.animationId = null;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
    }

    async init() {
        console.log("Initializing Three.js Engine...");
        
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue base
        
        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 4. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // 5. Build Map
        if (typeof MapBuilder !== 'undefined') {
            const mapBuilder = new MapBuilder(this.scene);
            const mapData = mapBuilder.build(this.config.map);
            this.objects = mapData.colliders;
        } else {
            // Basic floor fallback
            const floorGeo = new THREE.PlaneGeometry(100, 100);
            const floorMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            this.scene.add(floor);
            this.objects.push(floor);
        }
        
        // 6. Initialize Player
        if (typeof Player !== 'undefined') {
            this.player = new Player(this.camera, this.scene, this.objects);
            this.player.spawn();
        }
        
        // 7. Initialize Bots
        if (this.config.mode === 'singleplayer' && typeof Bot !== 'undefined') {
            for (let i = 0; i < this.config.bots; i++) {
                const bot = new Bot(this.scene, this.objects, this.player);
                bot.spawn();
                this.entities.push(bot);
            }
        }
        
        // 8. Event Listeners
        window.addEventListener('resize', this.onWindowResize);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.pause();
        });
        
        this.isRunning = true;
        this.start();
    }

    start() {
        this.animationId = requestAnimationFrame(this.update);
    }

    update() {
        if (this.isPaused) return;
        
        const delta = this.clock.getDelta();
        
        // Update Player
        if (this.player) {
            this.player.update(delta);
        }
        
        // Update Entities (Bots, Other Players)
        this.entities.forEach(entity => {
            entity.update(delta);
        });
        
        // Update Projectiles
        this.bullets.forEach((bullet, index) => {
            bullet.update(delta);
            if (bullet.isDead) {
                this.scene.remove(bullet.mesh);
                this.bullets.splice(index, 1);
            }
        });
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.update);
    }

    pause() {
        this.isPaused = true;
        document.getElementById('pause-menu').classList.remove('hidden');
        if (this.player && this.player.controls) {
            this.player.controls.unlock();
        }
    }

    resume() {
        this.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        if (this.player && this.player.controls) {
            this.player.controls.lock();
        }
        this.start();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onWindowResize);
        
        // Cleanup Three.js resources
        this.renderer.dispose();
        this.scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}
