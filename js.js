
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
//document.addEventListener('keydown',onkeydown);

const widht = 800;
const Height = 500;
const pipewidth = 40;
const minpipewidth = 40;
const FPS = 928;
const state = {
    gameSpeed: FPS
}
const toplam_bird =1000;
const deadBirds = [];

class Bird {
    constructor(ctx, brain) {
        this.ctx = ctx;
        this.x = 100;
        this.y = 150;
        this.gravity = 0;
        this.velocity = 0.1;
        this.age = 0;
        this.fitness = 0;
        this.isdead = false;
        
        if(brain){
            this.brain=brain.copy() 
            this.mutate();
        }
        else{
            this.brain=new NeuralNetwork(5, 10, 1);
        } 
    }
    draw() {
        this.ctx.fillStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    update = (pipeX, spaceStartY, spaceEndY) => {
        this.age += 1;
        this.gravity += this.velocity;
        this.gravity = Math.min(4, this.gravity);
        this.y += this.gravity;
        this.think(pipeX, spaceStartY, spaceEndY);
    }
    think = (pipeX, spaceStartY, spaceEndY) => {
        const inputs = [
            (this.x - pipeX) / widht,
            this.y / Height,
            spaceStartY / Height,
            spaceEndY / Height,
            this.gravity / 4,
            

        ];
        const output = this.brain.predict(inputs);
        if (output[0] < 0.5) {
            this.jump();
        }
    }
    mutate = () => {
        this.brain.mutate((x) => {
            if (Math.random() < 0.2) {
                const ofset = Math.random();
                return x + ofset;
            } else {
                return x;
            }
        });
    }
    jump = () => {
        this.gravity = -3;
    }
}
let counter=0
class pipe {

    constructor(ctx, height, space) {
        this.ctx = ctx;
        this.isdead = false;
        this.x = 800;
        this.y = height ? Height - height : 0;
        this.widht = pipewidth;
        this.height = height||minpipewidth + Math.random() * (Height - space - minpipewidth * 2);
        //Math.abs(counter++*(counter%2 ?40:80) %(Height-80));
        //height || 
    }
    draw() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(this.x, this.y, this.widht, this.height);
        //this.ctx.fillRect(50,firspipeheight+space,pipewidth,secondpipeheight);
    }
    update = () => {
        this.x -= 1;
        if (this.x + pipewidth < 0) {
            this.isdead = true;
        }
    }
}
this.space = 150;
this.frameCount = 0;
this.highscore = 0;



generatePipes = () => {
    const firstpipe = new pipe(ctx, null, this.space);
    const secondpipeheight = Height - firstpipe.height - space;
    const secondpipe = new pipe(ctx, secondpipeheight, 80);
    return [firstpipe, secondpipe];
}

generateBirds = () => {
    const birds = [];
    for (let i = 0; i < toplam_bird; i += 1) {
       const brain=deadBirds.length&& this.pickOne().brain;
        
        const newBird=new Bird(ctx,brain)
        //newBird.mutate();
        birds.push(newBird);
       // Math.random() < 0.8 ? bird && bird.brain : null)
       //()) Math.random() < 0.8 ? bird && bird.brain : null)
    }
    return birds;
}


this.iterasyon=0;


startGame = (bird) => {
    this.highscore = Math.max(this.highscore, this.gameStart ? Date.now() - this.gameStart : 0);
    this.gameStart = Date.now();
    ctx.clearRect(0, 0, widht, Height);
    clearInterval(this.loop);
    counter=0;
    iterasyon++;
    this.Pipes = this.generatePipes()
    
    this.birds = this.generateBirds(bird);
    
    loop=setInterval(gameLoop, 1000 / FPS);
}
getNextPipe = (bird) => {
    for (var i = 0; i < this.Pipes.length; i++) {
        if (this.Pipes[i].x > bird.x) {
            return this.Pipes[i];
        }
    }
}

this.Pipes = this.generatePipes();
this.birds = this.generateBirds();

function gameLoop() {
    update();
    draw();
}
update = () => {
    this.frameCount = this.frameCount + 1;
    if (this.frameCount % 400 == 0) {
        const Pipes = this.generatePipes();
        this.Pipes.push(...Pipes);
    }
    this.Pipes.forEach(pipe => pipe.update());


    this.birds.forEach(Bird => {
        const nextPipe = this.getNextPipe(Bird);
        const spaceStartY = nextPipe.y + nextPipe.height;

        Bird.update(nextPipe.x, spaceStartY, spaceStartY + space);

    });

    this.Pipes = this.Pipes.filter(pipe => !pipe.isdead);
    //if(this.isgameover()){
    //    alert("Oyun Bitti....");
    //   clearInterval(this.loop);
    //}
    this.isgameover();
    deadBirds.push(...this.birds.filter(Bird => Bird.isdead));
    this.birds = this.birds.filter(Bird => !Bird.isdead);
    if (this.birds.length == 0) {
        let totalAge = 0;
        deadBirds.forEach((deadBirds) => {totalAge += deadBirds.age;});

        deadBirds.forEach((deadBirds) => { deadBirds.fitness = deadBirds.age/totalAge; });/* */
        //deadBirds.sort((a,b)=>a.fitness<=b.fitness);
        //""""""""""""""""""

        /*let index = 0;
        let r = Math.random();

        while (r > 0) {
            r -= deadBirds[index].fitness;
            index += 1
        } index -= 1;*/

        //const strongest1 = deadBirds[0]
        //strongest1.mutate();      
        this.startGame();

    }
}
pickOne=()=>{
    let index = 0;
    let r = Math.random();

    while (r > 0) {
         r -= deadBirds[index].fitness;
         index += 1
    } index -= 1;
    return deadBirds[index];
}
isgameover = () => {
    //let gameover=false;
    this.birds.forEach(Bird => {
        this.Pipes.forEach(pipe => {
            if (Bird.y <= 0 || Bird.y >= Height || (Bird.x >= pipe.x && Bird.x <= pipe.x+pipe.widht
                && Bird.y >= pipe.y && Bird.y <= pipe.y+pipe.height)) {
                // gameover=true;
                Bird.isdead = true;
            }
        });
    })
    // return gameover;
}
draw = () => {
    ctx.clearRect(0, 0, widht, Height);
    Pipes.forEach(pipe => pipe.draw());
    this.birds.forEach(Bird => Bird.draw());
    ctx.font = '15px serif';
    ctx.fillStyle = 'black';
    ctx.fillText("Skor :"+(this.highscore / 1000).toFixed(1)+" sn" ,10,20);
    this.ctx.fillText("İterasyon :"+iterasyon,10,40);
    ctx.fillText("Kalan Kuş :"+this.birds.length,10,60);
}
//onkeydown=(event)=>{
//  if(event.keyCode==32){
//    this.birds[0].jump();
//}
//}

var loop = setInterval(gameLoop, 1000 / state.gameSpeed);




