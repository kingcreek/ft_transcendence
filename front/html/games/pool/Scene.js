class Scene extends THREE.Scene {
    constructor(renderElement, main) {
        super();

        let scene = this;
        this.main = main;

        this.renderElement = renderElement;
        this.camera = new THREE.PerspectiveCamera(45, this.renderElement.offsetWidth / this.renderElement.offsetHeight, 0.1, 10000);

        this.renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        });

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.setSize(this.renderElement.offsetWidth, this.renderElement.offsetHeight);
        this.renderElement.appendChild(this.renderer.domElement);

        window.addEventListener('resize', function() {
            scene.onWindowResize();
        }, false);

        this.controls = new THREE.OrbitControls(this.camera, renderElement);
        this.controls.maxPolarAngle = Math.PI / 2 - 0.01;
        this.controls.maxDistance = 100;
        this.controls.minDistance = 5;
        
        this.camera.rotation._x = -0.3739616455348653;
        this.camera.rotation._y = 0.6795008955699466;
        this.camera.rotation._z = 0.20803619565163492;
        this.camera.rotateY(0.7);
        this.camera.rotateX(-0.3);

        this.camera.position.x = 12.962642602541662;
        this.camera.position.y = 4.14642045750715;
        this.camera.position.z = 21.23235543313809;
        

        this.textureLoader = new THREE.TextureLoader();

        this.lights = {
            spot: new SpotLight(this, 0, 5, 20, new THREE.Object3D),
            directional: new DirectionalLight(this, -10, 30, 30, null, true, 0xffffff, 0.6),
            ambient: new AmbientLight(this, 0xffffdd, 0.1)
        };

        let clothMap = this.textureLoader.load('./games/pool/textures/cloth.jpg'),
            clothMaterial = new THREE.MeshStandardMaterial(
                {
                    map: clothMap,
                    bumpScale: 0.01,
                    bumpMap: clothMap
                });
        clothMap.repeat.set(0.15, 0.15);
        clothMap.wrapS = clothMap.wrapT = THREE.RepeatWrapping;

        let tableWallShapes = [
            this.pointsToShape(
                new THREE.Vector2(6, -13.85),
                new THREE.Vector2(-6, -13.85),
                new THREE.Vector2(-5.625, -13.5),
                new THREE.Vector2(5.625, -13.5)
            ),
            this.pointsToShape(
                new THREE.Vector2(-6, 13.85),
                new THREE.Vector2(-5.625, 13.5),
                new THREE.Vector2(5.625, 13.5),
                new THREE.Vector2(6, 13.85)
            ),
            this.pointsToShape(
                new THREE.Vector2(7.1, 12.75),
                new THREE.Vector2(6.75, 12.5),
                new THREE.Vector2(6.75, 0.75),
                new THREE.Vector2(7.1, 0.7)
            ),
            this.pointsToShape(
                new THREE.Vector2(7.1, -12.75),
                new THREE.Vector2(7.1, -0.7),
                new THREE.Vector2(6.75, -0.75),
                new THREE.Vector2(6.75, -12.5)
            ),
            this.pointsToShape(
                new THREE.Vector2(-7.1, -12.75),
                new THREE.Vector2(-6.75, -12.5),
                new THREE.Vector2(-6.75, -0.75),
                new THREE.Vector2(-7.1, -0.7)
            ),
            this.pointsToShape(
                new THREE.Vector2(-7.1, 12.75),
                new THREE.Vector2(-7.1, 0.7),
                new THREE.Vector2(-6.75, 0.75),
                new THREE.Vector2(-6.75, 12.5)
            )
        ];

        this.tableWallMesh = this.shapesToMesh(tableWallShapes, .5, clothMaterial);
        this.tableWallMesh.rotateX(Math.PI / 2);
        this.tableWallMesh.receiveShadow = true;
        this.tableWallMesh.castShadow = true;
        this.tableWallMesh.position.y = .5;
        this.add(this.tableWallMesh);

        this.tableFloor = new ObjMesh(this, './games/pool/obj/table/floor.obj', './games/pool/textures/cloth.jpg', 2, false, true, true);
        this.tableBase = new ObjMesh(this, './games/pool/obj/table/woodwalls.obj', './games/pool/textures/wood.jpg', 30, true, this.laptopGraphics, true);
        this.tableLegs = new ObjMesh(this, './games/pool/obj/table/legs.obj', './games/pool/textures/wood.jpg', 10, true, true, true);


        let keuGeometry = new THREE.CylinderGeometry(0.06, 0.1, 15, 32, 32),
            keuMaterial = new THREE.MeshStandardMaterial({ color: 0xfda43a }),
            keuMesh = new THREE.Mesh(keuGeometry, keuMaterial);
        keuMesh.position.y = 0.9;
        keuMesh.rotateX(Math.PI / 2);
        keuMesh.position.z -= 8.5;
        keuMesh.rotateX(0.1);
        keuMesh.castShadow = true;

        this.cue = new THREE.Group();
        this.cue.add(keuMesh);
        this.cue.position.set(0, 0.3075, -6.75);

        //let randomStartRotation = 0.07;
        //randomStartRotation = 0;
        //this.cue.rotateY(randomStartRotation / 2 - Math.random() * randomStartRotation);

        this.add(this.cue);

        let floorGeometry = new THREE.BoxGeometry(90, 150, 100, 0),
            floorMap = new THREE.TextureLoader().load('./games/pool/textures/floorwood.jpg'),
            floorMaterial = new THREE.MeshPhongMaterial(this.laptopGraphics ? {
                map: floorMap
            } : {
                map: floorMap,
                bumpMap: floorMap,
                bumpScale: 0.1
            });
        floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
        floorMap.repeat.set(15, 15);

        this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floorMesh.rotateX(-Math.PI / 2);
        this.floorMesh.position.y = -7.788 - 50;
        this.floorMesh.receiveShadow = true;
        this.add(this.floorMesh);

        this.render();
    }

    topView() {
        this.animateObject(this.camera, new THREE.Vector3(.01, 25, 0), 300, new THREE.Vector3);
    }
    westView() {
        this.animateObject(this.camera, new THREE.Vector3(15, 15, 0), 300, new THREE.Vector3);
    }
    eastView() {
        this.animateObject(this.camera, new THREE.Vector3(-15, 15, 0), 300, new THREE.Vector3);
    }
    northView() {
        this.animateObject(this.camera, new THREE.Vector3(0, 15, 25), 300, new THREE.Vector3);
    }
    southView() {
        this.animateObject(this.camera, new THREE.Vector3(0, 15, -25), 300, new THREE.Vector3);
    }

    animateObject(object, newPos, time = 1000, target = null, easing = TWEEN.Easing.Quartic.InOut) {
        let updater = self.setInterval(TWEEN.update);
        return new TWEEN.Tween(object.position)
            .to(newPos, time)
            .onUpdate(function() {
                object.position.set(this.x, this.y, this.z);
                if (target)
                    object.lookAt(target);
            })
            .onComplete(function() {
                clearInterval(updater);
            })
            .easing(easing)
            .start();
    }

    animateScale(object, newPos, time = 1000, target = null, easing = TWEEN.Easing.Quartic.InOut) {
        let updater = self.setInterval(TWEEN.update);
        return new TWEEN.Tween(object.scale)
            .to(newPos, time)
            .onUpdate(function() {
                object.scale.set(this.x, this.y, this.z);
            })
            .onComplete(function() {
                clearInterval(updater);
            })
            .easing(easing)
            .start();
    }

    pointsToShape(...points) {
        points.reverse();
        return new THREE.Shape(points);
    }

    shapesToMesh(shapes, depth, material = new THREE.MeshStandardMaterial({ color: 0xffffff })) {
        let extrudeSettings = {
                bevelEnabled: true,
                bevelSize: 0.05,
                bevelThickness: 0.05,
                steps: 1,
                amount: depth
            },
            geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings),
            mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 2, 0);
        return mesh;
    }

    render() {
        this.renderer.render(this, this.camera);
        let scene = this;
        requestAnimationFrame(function() {
            scene.render();
        });
    }

    onWindowResize() {
        this.camera.aspect = this.renderElement.offsetWidth / this.renderElement.offsetHeight;
        this.renderer.setSize(this.renderElement.offsetWidth, this.renderElement.offsetHeight);
        this.camera.updateProjectionMatrix();
    }
}
