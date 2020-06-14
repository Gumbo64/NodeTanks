port = "http://" + ipadress + ":1569";
const socket = io(port)
touchcontrols = false;
touching = false;
tanks = {};
bullets = {};
scale = 100;


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
    var bulletimg = document.getElementById('bullet');
    scaledraw(bullet,bulletimg)
 
    
}
function scrollhandle(delta){
    if(delta>0){
        scale += 15;
    }else{
        scale -= 15;
    }
    if (scale<=0){
        scale=10;
    }else{
        if (scale>500){
            scale=500;
        }
    }
}

function scaledraw(item,img){
    var ctx = gamearea.context;
    img.width=item.width;
    img.height=item.height;
    
    ctx.setTransform(1, 0, 0, 1, (item.x-clienttankx)*(scale/100)+centerx, (item.y-clienttanky)*(scale/100)+centery); // sets scale && origin
    ctx.rotate(item.angle);
    ctx.drawImage(img, item.width*(scale/100) / -2, item.height*(scale/100) / -2, item.width*(scale/100), item.height*(scale/100));
}
function rendertank(tank) {
    if (tank.colour == clientname){
        var tankimg = document.getElementById('client');
        //window.scrollTo(tank.x-tank.width*7,tank.y-tank.height*7);
    }else{
        var tankimg = document.getElementById('tanks');
    }
    scaledraw(tank,tankimg);
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
    height = (10000 + 1000);
    width = (10000 + 1100);
    var tankimg = document.getElementById('background');
    for (i=0;i<Math.ceil(width/(tankimg.width*(scale/100)));i++){
        for (j=0;j<Math.ceil(height/(tankimg.height*(scale/100)));j++){
            ctx.setTransform(1, 0, 0, 1, (scale/100)*(i*tankimg.width-clienttankx), (scale/100)*(j*tankimg.height-clienttanky)); // sets scale && origin
            ctx.drawImage(tankimg,0, 0, tankimg.width*(scale/100),tankimg.height*(scale/100));
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
                
            rendertanksbullets(key);
            rendertank(tanks[key]);
            drawhealthname(key);  
            
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
function truncate(str, n){
    return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  };
function startGame() {
    username = prompt('Username?');
    username = truncate(username,40)
    socket.emit('new-user',username);
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
function scrollfunction(e){
    scrollhandle(e.deltaY);   
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
        window.addEventListener('wheel', scrollfunction);
        window.addEventListener('keydown', keydown)
        window.addEventListener('keyup', keyup)
        el = gamearea.canvas;
        el.addEventListener("touchstart", touchHandler);
        el.addEventListener("touchmove", touchHandler);
        el.addEventListener('touchcancel', touchstop);
        el.addEventListener('touchend', touchstop);
    },
    listeneroff : function(){
        window.removeEventListener('wheel', scrollfunction);
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



function drawhealthname(z){
    ctx = gamearea.context;
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.rotate(-tanks[z].angle);
    // ctx.fillText(tanks[z].username+': '+tanks[z].health+'hp',tanks[z].x*(scale/100),tanks[z].y*(scale/100)-100);
    ctx.fillText(tanks[z].username+': '+tanks[z].health+'hp',0,-50*(scale/100));
    
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

