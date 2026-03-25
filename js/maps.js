/**
 * maps.js - Map Builder with 3 detailed maps
 */

class MapBuilder {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.spawnPoints = [];
        this.pickups = [];
    }

    build(mapName) {
        this.colliders = [];
        this.spawnPoints = [];
        this.pickups = [];

        switch (mapName) {
            case 'arena':
                this.buildArena();
                break;
            case 'fortress':
                this.buildFortress();
                break;
            default:
                this.buildWarehouse();
        }

        return {
            colliders: this.colliders,
            spawnPoints: this.spawnPoints,
            pickups: this.pickups
        };
    }

    addBox(w, h, d, x, y, z, color, isCollider = true) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isWall = isCollider;
        this.scene.add(mesh);
        if (isCollider) {
            mesh.userData.bbox = new THREE.Box3().setFromObject(mesh);
            this.colliders.push(mesh);
        }
        return mesh;
    }

    addFloor(w, d, x, y, z, color) {
        const geo = new THREE.PlaneGeometry(w, d);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, y, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    addRamp(w, h, d, x, y, z, rotY, color) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.x = -0.3;
        mesh.rotation.y = rotY || 0;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isWall = true;
        mesh.userData.bbox = new THREE.Box3().setFromObject(mesh);
        this.colliders.push(mesh);
        this.scene.add(mesh);
        return mesh;
    }

    addLight(x, y, z, color, intensity) {
        const light = new THREE.PointLight(color, intensity, 30);
        light.position.set(x, y, z);
        light.castShadow = true;
        this.scene.add(light);
    }

    // ==========================================
    // MAP 1: WAREHOUSE - Close quarters combat
    // ==========================================
    buildWarehouse() {
        this.scene.background = new THREE.Color(0x1a1510);
        this.scene.fog = new THREE.Fog(0x1a1510, 20, 80);

        // Floor
        this.addFloor(100, 100, 0, 0, 0, 0x3d3225);

        // Ceiling
        this.addBox(100, 0.3, 100, 0, 8, 0, 0x2a2015, false);

        // Outer walls
        this.addBox(100, 10, 1, 0, 0, 50, 0x4a3a28);
        this.addBox(100, 10, 1, 0, 0, -50, 0x4a3a28);
        this.addBox(1, 10, 100, 50, 0, 0, 0x4a3a28);
        this.addBox(1, 10, 100, -50, 0, 0, 0x4a3a28);

        // Inner walls creating corridors
        this.addBox(30, 6, 0.5, -10, 0, 15, 0x555040);
        this.addBox(0.5, 6, 25, 5, 0, 27, 0x555040);
        this.addBox(20, 6, 0.5, 20, 0, -10, 0x555040);
        this.addBox(0.5, 6, 20, -15, 0, -20, 0x555040);
        this.addBox(25, 6, 0.5, 10, 0, -30, 0x555040);

        // Crate clusters
        const cratePositions = [
            [8, 3, 8], [10, 2, 7], [-20, 2.5, 20], [-22, 2, 22],
            [30, 3, -15], [32, 2, -13], [-30, 2, -35], [-28, 3, -33],
            [0, 2, -5], [15, 2.5, 25], [-25, 2, 5], [35, 2, 30],
            [-10, 3, -40], [25, 2, 40], [-35, 2.5, -10], [40, 2, -35]
        ];
        cratePositions.forEach(([x, size, z]) => {
            const s = size * 0.7 + 0.5;
            this.addBox(s, s, s, x, 0, z, 0x8B7355);
        });

        // Shelving units
        for (let i = -30; i <= 30; i += 20) {
            this.addBox(8, 4, 0.3, i, 0, 0, 0x666050);
            this.addBox(0.2, 4, 3, i - 4, 0, 0, 0x666050);
            this.addBox(0.2, 4, 3, i + 4, 0, 0, 0x666050);
        }

        // Forklift (decorative cover boxes)
        this.addBox(2, 1.5, 3, -40, 0, 40, 0x887722);
        this.addBox(0.3, 3, 0.3, -40.8, 1.5, 41, 0x555555);
        this.addBox(0.3, 3, 0.3, -39.2, 1.5, 41, 0x555555);

        // Elevated platform
        this.addBox(15, 3, 15, -35, 0, -35, 0x4a4030);
        this.addBox(4, 0.3, 8, -27, 1.5, -35, 0x4a4030);

        // Lights
        this.addLight(0, 7, 0, 0xffcc77, 1.5);
        this.addLight(-30, 7, 30, 0xffcc77, 1.0);
        this.addLight(30, 7, -30, 0xffcc77, 1.0);
        this.addLight(-30, 7, -30, 0xffcc77, 0.8);
        this.addLight(30, 7, 30, 0xffcc77, 0.8);

        // Spawn points
        this.spawnPoints = [
            { x: -40, z: 40 }, { x: 40, z: -40 },
            { x: -40, z: -40 }, { x: 40, z: 40 },
            { x: 0, z: 35 }, { x: 0, z: -35 },
            { x: -30, z: 0 }, { x: 30, z: 0 }
        ];
    }

    // ==========================================
    // MAP 2: ARENA - Open outdoor battle
    // ==========================================
    buildArena() {
        this.scene.background = new THREE.Color(0x5588bb);
        this.scene.fog = new THREE.FogExp2(0x5588bb, 0.008);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(200, 200, 20, 20);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 1.0 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Boundary walls
        this.addBox(200, 8, 2, 0, 0, 100, 0x666666);
        this.addBox(200, 8, 2, 0, 0, -100, 0x666666);
        this.addBox(2, 8, 200, 100, 0, 0, 0x666666);
        this.addBox(2, 8, 200, -100, 0, 0, 0x666666);

        // Central tower
        this.addBox(6, 12, 6, 0, 0, 0, 0x777777);
        this.addBox(10, 0.5, 10, 0, 6, 0, 0x888888);
        // Ramp to tower
        this.addRamp(3, 0.3, 10, 5, 3, 0, Math.PI / 2, 0x777777);

        // Four corner structures
        const corners = [[40, 40], [-40, 40], [40, -40], [-40, -40]];
        corners.forEach(([cx, cz]) => {
            this.addBox(8, 5, 8, cx, 0, cz, 0x888877);
            this.addBox(4, 0.4, 4, cx, 5, cz, 0x999988);
        });

        // Trenches (low walls)
        this.addBox(30, 1.5, 1, 0, 0, 25, 0x555544);
        this.addBox(30, 1.5, 1, 0, 0, -25, 0x555544);
        this.addBox(1, 1.5, 30, 25, 0, 0, 0x555544);
        this.addBox(1, 1.5, 30, -25, 0, 0, 0x555544);

        // Scattered cover: concrete barriers
        const barriers = [
            [15, 10], [-15, 10], [15, -10], [-15, -10],
            [30, 0], [-30, 0], [0, 30], [0, -30],
            [55, 55], [-55, 55], [55, -55], [-55, -55],
            [70, 0], [-70, 0], [0, 70], [0, -70]
        ];
        barriers.forEach(([bx, bz]) => {
            this.addBox(3, 1.5, 1.5, bx, 0, bz, 0x999999);
        });

        // Trees (cylinders + spheres)
        const treePositions = [
            [60, 30], [-60, 30], [60, -30], [-60, -30],
            [20, 60], [-20, 60], [20, -60], [-20, -60],
            [80, 80], [-80, 80], [80, -80], [-80, -80]
        ];
        treePositions.forEach(([tx, tz]) => {
            // Trunk
            const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6B4226 });
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(tx, 2, tz);
            trunk.castShadow = true;
            this.scene.add(trunk);

            // Foliage
            const leafGeo = new THREE.SphereGeometry(2.5, 8, 6);
            const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6b1e });
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(tx, 5.5, tz);
            leaf.castShadow = true;
            this.scene.add(leaf);
        });

        // Sky sun light
        const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
        sun.position.set(50, 80, 30);
        sun.castShadow = true;
        sun.shadow.camera.left = -100;
        sun.shadow.camera.right = 100;
        sun.shadow.camera.top = 100;
        sun.shadow.camera.bottom = -100;
        this.scene.add(sun);

        this.spawnPoints = [
            { x: -80, z: 80 }, { x: 80, z: -80 },
            { x: -80, z: -80 }, { x: 80, z: 80 },
            { x: 0, z: 80 }, { x: 0, z: -80 },
            { x: 80, z: 0 }, { x: -80, z: 0 }
        ];
    }

    // ==========================================
    // MAP 3: FORTRESS - Multi-level structure
    // ==========================================
    buildFortress() {
        this.scene.background = new THREE.Color(0x1a1a2a);
        this.scene.fog = new THREE.Fog(0x1a1a2a, 30, 100);

        // Ground
        this.addFloor(150, 150, 0, 0, 0, 0x2a2a3a);

        // Outer fortress walls
        this.addBox(120, 15, 3, 0, 0, 60, 0x444466);
        this.addBox(120, 15, 3, 0, 0, -60, 0x444466);
        this.addBox(3, 15, 120, 60, 0, 0, 0x444466);
        this.addBox(3, 15, 120, -60, 0, 0, 0x444466);

        // Corner towers
        const towerCorners = [[57, 57], [-57, 57], [57, -57], [-57, -57]];
        towerCorners.forEach(([tx, tz]) => {
            this.addBox(8, 18, 8, tx, 0, tz, 0x555577);
            this.addBox(10, 0.5, 10, tx, 18, tz, 0x666688);
            // Battlements
            this.addBox(2, 2, 10, tx + 4, 18, tz, 0x555577);
            this.addBox(2, 2, 10, tx - 4, 18, tz, 0x555577);
        });

        // Inner keep
        this.addBox(30, 8, 30, 0, 0, 0, 0x3a3a55);
        this.addBox(32, 0.5, 32, 0, 8, 0, 0x4a4a65);
        // Keep second floor walls
        this.addBox(30, 6, 1, 0, 8, 15, 0x3a3a55);
        this.addBox(30, 6, 1, 0, 8, -15, 0x3a3a55);
        this.addBox(1, 6, 30, 15, 8, 0, 0x3a3a55);
        this.addBox(1, 6, 30, -15, 8, 0, 0x3a3a55);

        // Keep entrance openings (decorative pillars beside gaps)
        this.addBox(2, 8, 2, 5, 0, 15, 0x4a4a65);
        this.addBox(2, 8, 2, -5, 0, 15, 0x4a4a65);
        this.addBox(2, 8, 2, 5, 0, -15, 0x4a4a65);
        this.addBox(2, 8, 2, -5, 0, -15, 0x4a4a65);

        // Ramps to keep roof
        this.addRamp(4, 0.4, 12, 18, 4, 0, Math.PI / 2, 0x555577);
        this.addRamp(4, 0.4, 12, -18, 4, 0, -Math.PI / 2, 0x555577);

        // Walkways on outer walls
        this.addBox(120, 0.5, 4, 0, 10, 58, 0x444466);
        this.addBox(120, 0.5, 4, 0, 10, -58, 0x444466);
        this.addBox(4, 0.5, 120, 58, 10, 0, 0x444466);
        this.addBox(4, 0.5, 120, -58, 10, 0, 0x444466);

        // Stairs to wall walkways
        for (let i = 0; i < 5; i++) {
            this.addBox(4, 0.5, 2, 50, 2 * i, -50 + i * 3, 0x555577);
            this.addBox(4, 0.5, 2, -50, 2 * i, 50 - i * 3, 0x555577);
        }

        // Courtyard cover
        const courtCover = [
            [30, 30], [-30, 30], [30, -30], [-30, -30],
            [0, 40], [0, -40], [40, 0], [-40, 0]
        ];
        courtCover.forEach(([cx, cz]) => {
            this.addBox(4, 2, 4, cx, 0, cz, 0x555566);
        });

        // Torches (point lights)
        this.addLight(0, 10, 0, 0xff6633, 2.0);
        this.addLight(50, 12, 50, 0xff6633, 1.0);
        this.addLight(-50, 12, 50, 0xff6633, 1.0);
        this.addLight(50, 12, -50, 0xff6633, 1.0);
        this.addLight(-50, 12, -50, 0xff6633, 1.0);
        this.addLight(0, 6, 30, 0xff8844, 0.8);
        this.addLight(0, 6, -30, 0xff8844, 0.8);

        // Moonlight
        const moon = new THREE.DirectionalLight(0x8888ff, 0.6);
        moon.position.set(-30, 60, 40);
        moon.castShadow = true;
        moon.shadow.camera.left = -80;
        moon.shadow.camera.right = 80;
        moon.shadow.camera.top = 80;
        moon.shadow.camera.bottom = -80;
        this.scene.add(moon);

        this.spawnPoints = [
            { x: 0, z: 0 }, { x: 40, z: 40 },
            { x: -40, z: -40 }, { x: 40, z: -40 },
            { x: -40, z: 40 }, { x: 0, z: 50 },
            { x: 0, z: -50 }, { x: 50, z: 0 }
        ];
    }
}
