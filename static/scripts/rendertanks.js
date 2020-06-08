port = "http://" + ipadress + ":1569";
const socket = io(port)
touchcontrols = false;
touching = false;
tanks = {};
bullets = {};


socket.emit('new-user');
var clientname = "unnamed";
var events;

function getstates(){
    left=false;
    right=false;
    up=false;
    down=false;
    shoot=false;
    if (gamearea.keys && gamearea.keys[65]) {left = true; }
    if (gamearea.keys && gamearea.keys[68]) {right = true;}
    if (gamearea.keys && gamearea.keys[87]) {up = true;}
    if (gamearea.keys && gamearea.keys[83]) {down = true; }
    if (gamearea.keys && gamearea.keys[32]){shoot=true;}
    inputs = [left,right,up,down,shoot];
    socket.emit('staterequest',inputs);
}
socket.on('states', (tanksstate,bulletsstate) => {
    tanks = tanksstate;
    bullets = bulletsstate;
})
  
socket.on('identifier', (socketid) => {
  clientname = socketid;
})
function rendertanksbullets(colour) {
    for (i=0;i<bullets[colour].length;i++){
        renderonebullet(bullets[colour][i]);
    }
}
function renderonebullet(bullet){
    var ctx = gamearea.context;
    var bulletimg = document.getElementById('bullet');
    bulletimg.width=bullet.width;
    bulletimg.height=bullet.height;
    ctx.setTransform(1, 0, 0, 1, bullet.x-clienttankx+centerx, bullet.y-clienttanky+centery); // sets scale && origin
    ctx.rotate(bullet.angle);
    ctx.drawImage(bulletimg, bullet.width / -2, bullet.height / -2, bullet.width, bullet.height);
    
}
function rendertank(tank) {
    var ctx = gamearea.context;
    if (tank.colour == clientname){
        var tankimg = document.getElementById('client');
        //window.scrollTo(tank.x-tank.width*7,tank.y-tank.height*7);
    }else{
        var tankimg = document.getElementById('tanks');
    }
    tankimg.width=tank.width;
    tankimg.height=tank.height;
    ctx.setTransform(1, 0, 0, 1, tank.x-clienttankx+centerx, tank.y-clienttanky+centery); // sets scale && origin
    ctx.rotate(tank.angle);
    ctx.drawImage(tankimg, tank.width / -2, tank.height / -2, tank.width, tank.height);
}
function wiper() {
    var ctx = gamearea.context;
    height = 0;
    width = 0;
    var tankimg = document.getElementById('client');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // sets scale && origin
    ctx.drawImage(tankimg, width / -2, height / -2, width, height);
}
function background() {
    var ctx = gamearea.context;
    height = 10000 + 1000;
    width = 10000 + 1100;
    var tankimg = document.getElementById('background');

    for (i=0;i<Math.ceil(width/tankimg.width);i++){
        for (j=0;j<Math.ceil(height/tankimg.height);j++){
            ctx.setTransform(1, 0, 0, 1, i*tankimg.width-clienttankx, j*tankimg.height-clienttanky); // sets scale && origin
            ctx.drawImage(tankimg,0, 0, tankimg.width,tankimg.height);
        }
    }
}
function rendergamearea(){
    clienttankx=tanks[clientname].x;
    clienttanky=tanks[clientname].y;
    gamearea.clear();
    background();
    for (var key in tanks) {
        // check if the property/key is defined in the object itself, not in parent
        if (tanks.hasOwnProperty(key)) {      
                 
            rendertanksbullets(tanks[key].colour);
            rendertank(tanks[key]);
        }
        
    }
    wiper();
    
}

function drawtouchcontrols(){
    var ctx = gamearea.context;
    var img = document.getElementById('uparrow');
    img.width=gh;
    img.height=gh;
    // up
    ctx.setTransform(1, 0, 0, 1, 0, gh*2.8);
    ctx.drawImage(img, gh, gh, gw, 2*gh);

    // right
    ctx.setTransform(1, 0, 0, 1, gw*5.3+2*gh, gh*3.5);
    ctx.rotate(90 * Math.PI / 180);
    ctx.drawImage(img, gh, gh, gw, 2*gh);

    // shoot button
    var img = document.getElementById('shootimg');
    img.width=gh;
    img.height=gh;
    ctx.setTransform(1, 0, 0, 1, gw*5-gh, gh/2); // sets scale && origin
    ctx.drawImage(img, gh, gh, gh,gh);


}

scores = {};

sounds = {};
sounds['explosionsfx'] = [1,50];
sounds['hitmarker'] = [1,200];
sounds['shoot']=[1,200];

function playsound(id){
    if (nosound){
        return 0
    }
    combine = id + sounds[id][0];
    elbyid(id + sounds[id][0]).play();
    sounds[id][0]++;
    if (sounds[id][0] == sounds[id][1]){
        sounds[id][0] = 1;
    }
}
function elbyid(elementid){
    return document.getElementById(elementid)
}

function startGame() {
    backgroundcolour = '#ffffff';
    bullets = {};
    tanks = {};
    gamearea.stop();
    gamearea.canvasstart();
    gh = gamearea.canvas.height / 6;
    gw = gamearea.canvas.width / 6;
    gamearea.start();
}
function keyup(e){
    gamearea.keys[e.keyCode] = (e.type == "keydown");
}
function keydown(e){
    e.preventDefault();
    gamearea.keys = (gamearea.keys || []);
    gamearea.keys[e.keyCode] = (e.type == "keydown");
}
function touchHandler(e) {
    events = e
    touchcontrols = true
    touching = true
    e.preventDefault();
}
function touchstop(e) {
    events = e
    e.preventDefault();
    touching=false
}
var gamearea = {
    canvas : document.getElementById("gamearea"),
    canvasstart : function() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    start : function() {
        centerx = gamearea.canvas.width/2;
        centery = gamearea.canvas.height/2;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(rendergamearea, 1);
        this.stateinterval = setInterval(getstates, 10);
    },
    listeneron : function(){
        window.addEventListener('keydown', keydown)
        window.addEventListener('keyup', keyup)
        el = gamearea.canvas;
        el.addEventListener("touchstart", touchHandler);
        el.addEventListener("touchmove", touchHandler);
        el.addEventListener('touchcancel', touchstop);
        el.addEventListener('touchend', touchstop);
    },
    listeneroff : function(){
        window.removeEventListener('keydown', keydown)
        window.removeEventListener('keyup',keyup )
        el = gamearea.canvas;
        el.removeEventListener("touchstart", touchHandler);
        el.removeEventListener("touchmove", touchHandler);
        el.rempveEventListener('touchcancel', touchstop);
        el.removeEventListener('touchend', touchstop);
    },
    stop : function() {
        clearInterval(this.interval);
    },    
    clear : function() {
        ctx = this.context;
        ctx.fillStyle = backgroundcolour;
        ctx.fillRect(0,0, this.canvas.width*5, this.canvas.height*5);

    }
}



function drawhealth(){
    canvas = gamearea.canvas;
    context = gamearea.context;
    context.fillStyle = "other";
    context.font = "bold 6vh Arial";

    for (var key in tanks) {
        // check if the property/key is defined in the object itself, not in parent
        if (tanks.hasOwnProperty(key)) {           
            context.fillText(tanks[key].health+'hp',tanks[key].x,tanks[key].y-gh);
        }
    }
    
}



function fullscreen(){
    var el = document.getElementById('gamearea');
    if(el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    }
    else {
        el.mozRequestFullScreen();
    }            
}

