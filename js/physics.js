/**
 * physics.js - Collision Detection & Physics
 */

const Physics = {
    GRAVITY: 25,
    PLAYER_RADIUS: 0.4,
    PLAYER_HEIGHT: 1.8,

    /**
     * AABB collision check - returns true if a sphere at pos collides with collider
     */
    sphereBoxCollision(pos, radius, box3) {
        const closest = new THREE.Vector3();
        closest.x = Math.max(box3.min.x, Math.min(pos.x, box3.max.x));
        closest.y = Math.max(box3.min.y, Math.min(pos.y, box3.max.y));
        closest.z = Math.max(box3.min.z, Math.min(pos.z, box3.max.z));

        const dist = pos.distanceTo(closest);
        return dist < radius;
    },

    /**
     * Push a position out of a box collider
     */
    resolveCollision(pos, radius, box3) {
        const closest = new THREE.Vector3();
        closest.x = Math.max(box3.min.x, Math.min(pos.x, box3.max.x));
        closest.y = Math.max(box3.min.y, Math.min(pos.y, box3.max.y));
        closest.z = Math.max(box3.min.z, Math.min(pos.z, box3.max.z));

        const diff = new THREE.Vector3().subVectors(pos, closest);
        const dist = diff.length();

        if (dist < radius && dist > 0.0001) {
            diff.normalize().multiplyScalar(radius - dist);
            pos.add(diff);
            return true;
        }
        return false;
    },

    /**
     * Move entity with collision detection against all colliders
     */
    moveWithCollision(position, velocity, colliders, delta, radius) {
        radius = radius || this.PLAYER_RADIUS;

        // Try to move on X axis
        const newX = position.x + velocity.x * delta;
        const testPos = new THREE.Vector3(newX, position.y, position.z);
        let collidedX = false;
        for (const col of colliders) {
            if (!col.userData.bbox) continue;
            if (this.sphereBoxCollision(testPos, radius, col.userData.bbox)) {
                collidedX = true;
                break;
            }
        }
        if (!collidedX) {
            position.x = newX;
        } else {
            velocity.x = 0;
        }

        // Try to move on Z axis
        const newZ = position.z + velocity.z * delta;
        testPos.set(position.x, position.y, newZ);
        let collidedZ = false;
        for (const col of colliders) {
            if (!col.userData.bbox) continue;
            if (this.sphereBoxCollision(testPos, radius, col.userData.bbox)) {
                collidedZ = true;
                break;
            }
        }
        if (!collidedZ) {
            position.z = newZ;
        } else {
            velocity.z = 0;
        }

        // Y axis (gravity, jumping)
        position.y += velocity.y * delta;
    },

    /**
     * Raycast for shooting
     */
    raycast(origin, direction, colliders, maxDist) {
        const raycaster = new THREE.Raycaster(origin, direction, 0, maxDist || 500);
        const intersects = raycaster.intersectObjects(colliders, true);
        return intersects;
    },

    /**
     * Line-of-sight check
     */
    hasLineOfSight(from, to, colliders) {
        const dir = new THREE.Vector3().subVectors(to, from).normalize();
        const dist = from.distanceTo(to);
        const raycaster = new THREE.Raycaster(from, dir, 0, dist);

        for (const col of colliders) {
            if (!col.userData || !col.userData.isWall) continue;
            const hits = raycaster.intersectObject(col);
            if (hits.length > 0 && hits[0].distance < dist - 0.5) {
                return false;
            }
        }
        return true;
    }
};
