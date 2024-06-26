class Main {
    constructor(renderElement, gameSM) {
        this.balls = {};
        this.tps = 120;
        this.loop = new GameLoop(this.tps);
        this.keyHandler = new KeyHandler(this.loop);
        this.scene = new Scene(renderElement, this);
        this.gameSM = gameSM;
        this.hitSound = new FrequencySound('./games/pool/sound/hit.mp3');
        this.pocketSound = new VolumeSound('./games/pool/sound/pocket.mp3');

        this.mousePos = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.mousePlace = null;
        this.placeLoop = null;

        this.gameLoop = false
        this.ballLength = 0;

        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        this.setKeymap();
    }

    setKeymap() {
        let main = this;
        this.keyHandler.setSingleKey(' ', 'Shoot cue', function () {
            this.sendAction("shoot");
        }.bind(this));
        this.keyHandler.setSingleKey('5', 'Top view', function () {
            main.scene.topView();
        }.bind(this));
        this.keyHandler.setSingleKey('6', 'East view', function () {
            main.scene.eastView();
        }.bind(this));
        this.keyHandler.setSingleKey('4', 'West view', function () {
            main.scene.westView();
        }.bind(this));
        this.keyHandler.setSingleKey('2', 'South view', function () {
            main.scene.southView();
        }.bind(this));
        this.keyHandler.setSingleKey('8', 'North view', function () {
            main.scene.northView();
        }.bind(this));
        this.keyHandler.setSingleKey('c', 'Enable aim line', function () {
            //main.scene.children = main.scene.children.filter((child) => child.type !== 'Line');
            if (this.gameLoop == false)
                this.gameLoop = this.loop.add(() => { this.onLoop() });
            else
                this.placeLoop = this.loop.remove(this.gameLoop);
            //main.game.cheatLine = !main.game.cheatLine;
        }.bind(this));
        this.keyHandler.setContinuousKey('ArrowLeft', 'Rotate cue left', function () {
            let rotateSpeed = 3 / this.tps;
            rotateSpeed /= this.keyHandler.isPressed('Shift') ? 10 : 1;
            rotateSpeed /= this.keyHandler.isPressed('Control') ? 5 : 1;
            this.sendAction({"rotateCue": rotateSpeed});
        }.bind(this));
        this.keyHandler.setContinuousKey('ArrowRight', 'Rotate cue right', function () {
            let rotateSpeed = 3 / this.tps;
            rotateSpeed /= this.keyHandler.isPressed('Shift') ? 10 : 1;
            rotateSpeed /= this.keyHandler.isPressed('Control') ? 5 : 1;
            this.sendAction({"rotateCue": -rotateSpeed})
        }.bind(this));
        this.keyHandler.setContinuousKey('ArrowUp', 'Cue power up', function () {
            let powerSpeed = 20 / this.tps;
            powerSpeed /= this.keyHandler.isPressed('Shift') ? 5 : 1;
            powerSpeed /= this.keyHandler.isPressed('Control') ? 5 : 1;
            this.sendAction({"power": powerSpeed});
        }.bind(this));
        this.keyHandler.setContinuousKey('ArrowDown', 'Cue power down', function () {
            let powerSpeed = 20 / this.tps;
            powerSpeed /= this.keyHandler.isPressed('Shift') ? 5 : 1;
            powerSpeed /= this.keyHandler.isPressed('Control') ? 5 : 1;
            this.sendAction({"power": -powerSpeed});
        }.bind(this));
    }
    
    sendAction(action) {
        this.gameSM.send("action", {"game": "Pool", "action": action});
    }

    setBalls(ballDataArray) {
        let keysArray = Object.keys(this.balls);
        this.ballLength = keysArray.length;
        if (this.ballLength === 0)
            ballDataArray.forEach(ballData => {
                const ball = new Ball(ballData, this);
                this.balls[String(ball.number)] = ball;
            });
        keysArray = Object.keys(this.balls);
        this.ballLength = keysArray.length;
        this.scene.animateObject(this.scene.cue, this.balls["0"].position, 500);
    }

    rotateCue(data) {
        var quaternion = new THREE.Quaternion(data.x, data.y, data.z, data.w);
        this.scene.cue.setRotationFromQuaternion(quaternion);
    }

    moveBall(data) {
        if (this.ballLength === 0) {
            return;
        }
        data.forEach((ballData) => {
            let ball = this.balls[String(ballData["nbr"])]
            if (ball)
                ball.moveBall(ballData["position"], ballData["speed"]);
        });
        // let ball = this.balls[data.idx];
        // ball.moveBall(data.pos)
    }

    makeSound(freq) {
        this.hitSound.play(freq);
    }

    poket(ballNumber) {
        let ballWithNumber = null;
        // Get ball
        for (let key in this.balls) {
            if (this.balls.hasOwnProperty(key)) {
                let ball = this.balls[key];
                if (ball.number === ballNumber) {
                    ballWithNumber = ball;
                    break;
                }
            }
        }
        if (ballWithNumber === null)
            return;

        // Hidde ball animation
        let dst = ballWithNumber.position;
        dst[1] -= 0.9;
        this.scene.animateObject(ballWithNumber, dst, 500);
        this.scene.animateScale(ballWithNumber, { x: 0.1, y: 0.1, z: 0.1 }, 500);

        // Make poket sound
        this.hitSound.play(0.2);
        setTimeout(() => this.hitSound.play(0.4), 300);
        setTimeout(() => this.hitSound.play(0.3), 500);
        setTimeout(() => this.pocketSound.play(0.05 * (0.5 + Math.random())), 250);
        if (ballNumber != 0) {
            setTimeout(() => {
                this.scene.remove(ballWithNumber);
                delete this.balls[ballNumber]
                let keysArray = Object.keys(this.balls);
                this.ballLength = keysArray.length;
            }, 500);
        }
    }

    shoot(power) {
        let origPos = new THREE.Vector3(0, 0.9, -8.5),
            backPos = origPos.clone(),
            frontPos = origPos.clone();
        backPos.z -= power * 5;
        frontPos.z += 1.5;
        this.scene.animateObject(this.scene.cue.children[0], backPos, 500);
        setTimeout(() => {
            let slowTween = this.scene.animateObject(this.scene.cue.children[0], frontPos, 60 / power);
            setTimeout(() => {
                this.hitSound.play(power / 0.3075)
                setTimeout(() => {
                    slowTween.stop();
                    this.scene.animateObject(this.scene.cue.children[0], origPos, 500);
                }, 200);
            }, 60 / power / 1.9);
        }, 500);
    }

    switchPlayer(position) {
        this.scene.animateObject(this.scene.cue, new THREE.Vector3(position[0], position[1], position[2]), 1000);
    }

    reqMoveWhite(data) {
        this.scene.topView();
        this.scene.animateScale(this.balls["0"], { x: 1, y: 1, z: 1 }, 500);
        document.addEventListener('mousemove', this.mousemove);
        document.addEventListener('mousedown', this.mousedown);

        this.placeLoop = this.loop.add(() => {
            this.raycaster.setFromCamera(this.mousePos, this.scene.camera);
            let intersects = this.raycaster.intersectObjects([this.scene.tableFloor.mesh]);
            if (intersects.length !== 0) {
                this.mousePlace = intersects[0].point;
                this.sendAction({"move_white": {
                    "x": this.mousePlace.x,
                    "z": this.mousePlace.z,
                }});
            }
        });
    }

    placeWhite(data) {
        this.balls["0"].moveBall(data.position, data.rotation);
        this.scene.animateObject(this.scene.cue, this.balls["0"].position, 500);
        this.placeLoop = this.loop.remove(this.placeLoop);
    }

    moveWhite(data) {
        this.balls["0"].moveBall(data.position, data.rotation);
    }

    mousemove = (e) => {
        const canvasBounds = this.scene.renderer.domElement.getBoundingClientRect();
        this.mousePos.x = ((e.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
        this.mousePos.y = -((e.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
    }

    mousedown = (e) => {
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mousedown', this.mousedown);
        this.sendAction({"place_white": {
            "x": this.mousePlace.x,
            "z": this.mousePlace.z,
        }});
    }

    onLoop() {

        let rotation = this.scene.cue.rotation.y;
        if (this.scene.cue.rotation.x === Math.PI)
            rotation = Math.PI - rotation;
        if (this.scene.cue.rotation.x < -1)
            rotation = Math.PI - rotation;
        else if (this.scene.cue.rotation.y < 0)
            rotation = 2 * Math.PI + rotation;
        let x = Math.cos(rotation),
            z = Math.sin(rotation),
            direction = new THREE.Vector3(z, 0, x).normalize(),
            ray = new THREE.Raycaster(this.scene.cue.position);
        ray.ray.direction = direction;
        let ballValues = Object.values(this.balls);
        let intersectables = [...ballValues, this.scene.tableBase.mesh];
        let wallHits = ray.intersectObjects(intersectables);
        
        if (wallHits.length > 0) {
            let lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(
                this.scene.cue.position,
                wallHits[0].point
            )
            let line = new THREE.Line(lineGeometry, this.lineMaterial);
            this.scene.children = this.scene.children.filter((child) => child.type !== 'Line');
            this.scene.add(line);
        }
    }

    stop() {
        this.loop.stop();
        var renderViewDiv = document.getElementById("renderView");
        var canvas = renderViewDiv.querySelector("canvas");
        if (canvas)
            renderViewDiv.removeChild(canvas);
        this.scene.renderer.dispose();
        this.scene.renderer.forceContextLoss();
        // this.scene.traverse((obj) => {
        //     if (obj.geometry) obj.geometry.dispose();
        //     if (obj.material) obj.material.dispose();
        //     this.scene.remove(obj);
        // });
    }
}
