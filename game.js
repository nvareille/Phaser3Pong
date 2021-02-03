var config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    scene:
    {
        preload: preload,
        create: create,
        update: update
    },
    physics:
    {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

var game = new Phaser.Game(config);
let input;

let raquette = [null, null];
let particles = [null, null];
let emitters = [null, null];
let emittersTime = [0, 0];
let ball;

let speedText;
let scoreTexts = [null, null];

let gameConfig =
{
    speed: 1,

    startSpeed: 300,

    scores: [0, 0],

    way: 1,
    difficulty: 1,
    difficultyStep: 0.1
}

let tick;
let point;

let keyZ;
let keyS;

function preload ()
{
    input = this.input.keyboard.createCursorKeys();
    keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.load.image('ball', 'assets/sprites/green_ball.png');
    this.load.image('red', 'assets/particles/red.png');
    this.load.image('blue', 'assets/particles/blue.png');

    this.load.audio('tick', "assets/audio/SoundEffects/numkey.wav")
    this.load.audio('point', "assets/audio/SoundEffects/pickup.wav")
}

function create ()
{
    /// Death zones
    let death = [];
    death[0] = this.add.rectangle(-1000, 450, 2100, 900, 0x000000);
    death[0].name = "P1";
    death[1] = this.add.rectangle(2600, 450, 2100, 900, 0x000000);
    death[1].name = "P2";

    this.physics.add.existing(death[0]);
    this.physics.add.existing(death[1]);
        
    death[0].body.immovable = true;
    death[1].body.immovable = true;

    
    raquette[0] = this.add.rectangle(100, 100, 40, 200, 0xFF0000);
    raquette[1] = this.add.rectangle(1500, 100, 40, 200, 0x0000FF);
    
    ball = this.physics.add.sprite(800, 450, 'ball');
    ball.setCollideWorldBounds(true);
    ball.setBounce(1);

    this.physics.add.existing(raquette[0]);
    this.physics.add.existing(raquette[1]);

    raquette[0].body.immovable = true;
    raquette[1].body.immovable = true;

    particles[0] = this.add.particles('red');
    emitters[0] = particles[0].createEmitter({
        speed: 1000,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    emitters[0].startFollow(raquette[0])
    emitters[0].on = false;

    particles[1] = this.add.particles('blue');
    emitters[1] = particles[1].createEmitter({
        speed: 1000,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    emitters[0].startFollow(raquette[0])
    emitters[0].on = false;

    emitters[1].startFollow(raquette[1])
    emitters[1].on = false;

    this.physics.add.overlap(ball, raquette[0], touch, null, this);
    this.physics.add.overlap(ball, raquette[1], touch, null, this);

    this.physics.add.overlap(ball, death[0], touchDeath, null, this);
    this.physics.add.overlap(ball, death[1], touchDeath, null, this);

    speedText = this.add.text(16, 16, 'Speed: X', { fontSize: '32px', fill: '#FFF' });
    scoreTexts[0] = this.add.text(570, 16, '0', { fontSize: '200px', fill: '#FFF' });
    scoreTexts[1] = this.add.text(900, 16, '0', { fontSize: '200px', fill: '#FFF' });

    tick = this.sound.add('tick');
    point = this.sound.add('point');
}

function touch(a, b)
{
    gameConfig.difficulty += gameConfig.difficultyStep;
    gameConfig.way *= -1;

    a.setVelocity(gameConfig.way * gameConfig.startSpeed * gameConfig.difficulty, Phaser.Math.Between(-600, 600));
    tick.play();
}

function touchDeath(a, b)
{
    if (b.name == "P1")
    {
        ++gameConfig.scores[1];
        emittersTime[1] = 1000;
    }
    else
    {
        ++gameConfig.scores[0];
        emittersTime[0] = 1000;
    }
    
    point.play();
    SpawnBall();
}

function update (time, delta)
{
    speedText.setText("Speed: " + Math.round(gameConfig.difficulty * 100) + "%");
    scoreTexts[0].setText(gameConfig.scores[0]);
    scoreTexts[1].setText(gameConfig.scores[1]);

    if (input.space.isDown)
        SpawnBall();
        
    if (keyZ.isDown)
        raquette[0].y -= gameConfig.speed * delta;
    else if (keyS.isDown)
        raquette[0].y += gameConfig.speed * delta;
    
    if (input.down.isDown)
        raquette[1].y += gameConfig.speed * delta;
    else if (input.up.isDown)
        raquette[1].y -= gameConfig.speed * delta;
    
    emittersTime[0] -= delta;
    emittersTime[1] -= delta;

    emitters[0].on = (emittersTime[0] > 0);
    emitters[1].on = (emittersTime[1] > 0);
}

function SpawnBall()
{
    ball.x = 800;
    ball.y = 450;

    if (gameConfig.scores[0] > gameConfig.scores[1])
        gameConfig.way = 1;
    else
        gameConfig.way = -1

    ball.setVelocity(gameConfig.startSpeed * gameConfig.way, gameConfig.startSpeed);
    gameConfig.difficulty = 1;
}