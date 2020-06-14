gamearea = {};
gamearea['canvas']={};
gamewidth = 10000;
gameheight= 10000;
gamearea.canvas.width = gamewidth;
gamearea.canvas.height = gameheight;
frictioncollision=false;

function tankshoot(z) {
    if (Date.now() - tanks[z].lastshoot >= tanks[z].firerate){
        append = new bullet(tanks[z].bulletwidth,tanks[z].bulletheight,tanks[z].x,tanks[z].y,tanks[z].angle,tanks[z].bulletspeed,tanks[z].colour);
        bullets[z].push(append);
        tanks[z].lastshoot=Date.now();
    }
}
function tankcorners(z){
    return findcorners(tanks[z].x,tanks[z].y,tanks[z].angle,tanks[z].width,tanks[z].height);
}
function bulletcorners(z,c){
    return findcorners(bullets[z][c].x,bullets[z][c].y,bullets[z][c].angle,bullets[z][c].width,bullets[z][c].height);
}
function tankothercorners(p){
    let othercorners = [];
    for (var i in tanks) {
        // check if the property/key is defined in the object itself, not in parent
        if (tanks.hasOwnProperty(i)) {   
            // console.log(tanks);
            // console.log(i)
            if ((p != i) && (tanks[i].health > 0)){
                let append = tankcorners(i);
                append.push(i)
                othercorners.push(append);
            }
        }
    }
    return othercorners;
}

    
function bulletnewPos(z,c,othercorners) {
    bullets[z][c].x +=  bullets[z][c].speed * Math.sin(bullets[z][c].angle);
    bullets[z][c].y -=  bullets[z][c].speed * Math.cos(bullets[z][c].angle);
    var ourcorners = bulletcorners(z,c);
    var othercorners = othercorners;
    var i;
    var nexti;
    for (i = 0; i < ourcorners.length; i++) {
        var j;
        for (j=0;j<othercorners.length;j++){
            var k;
            for (k=0;k<othercorners[j].length-1;k++){
                if (k==3){
                    nextk = 0;
                }else{
                    nextk=k+1;
                }
                if (i==3){
                    nexti=0;
                }else{
                    nexti=i+1;
                }
                if (doIntersect(ourcorners[i],ourcorners[nexti],othercorners[j][k],othercorners[j][nextk])){
                    for (var p in tanks) {
                        // check if the property/key is defined in the object itself, not in parent
                        if (tanks.hasOwnProperty(p)) {           
                            if (tanks[p].colour == othercorners[j][4]){
                                console.log('hit')
                                tanks[p].health += -0.5;
                            }
                        }
                    }
                    bullets[z][c].x = -9999999999;
                    bullets[z][c].y = -9999999999;
                    bullets[z][c].angle = 0;                  
                }
            }
        }
    }      
}

function tanknewPos(z) {
    if (tanks[z].health <= 0){
        tanks[z].x = -99999999;
        tanks[z].y = -99999999;
        return 'ded';
    }
    tanks[z].angle += tanks[z].moveAngle * tanks[z].moveanglemult * Math.PI / 180;
    tanks[z].x += tanks[z].speedmult * tanks[z].speed * Math.sin(tanks[z].angle);
    tanks[z].y -= tanks[z].speedmult * tanks[z].speed * Math.cos(tanks[z].angle);
    var ourcorners = tankcorners(z);
    var othercorners = tankothercorners(z);
    var i;
    var nexti;
    /* z for loop checks collision with other tanks*/
    
    /* for each diagonal on our tank...   */
    for (i = 0; i < ourcorners.length; i++) {
        var j;
        /* for each other tank  */
        for (j=0;j<othercorners.length;j++){
            var k;
            /* for each side on their tank */
            for (k=0;k<othercorners[j].length-1;k++){
                if (k==3){
                    nextk = 0;
                }else{
                    nextk=k+1;
                }
                if (i==3){
                    nexti=0;
                }else{
                    nexti=i+1;
                }
                if (doIntersect(ourcorners[i],ourcorners[nexti],othercorners[j][k],othercorners[j][nextk])){
                    if (frictioncollision){
                        tanks[z].angle -= tanks[z].moveAngle * Math.PI / 180;
                        tanks[z].x -= tanks[z].speedmult * tanks[z].speed * Math.sin(tanks[z].angle);
                        tanks[z].y += tanks[z].speedmult * tanks[z].speed * Math.cos(tanks[z].angle);
                    }else{
                        timeoutmax = 2 * tanks[z].speed;
                        if (tanks[z].speed==0){
                        }else{
                            if (tanks[z].speed<0){
                                tanks[z].speed = -1;
                            }else{
                                tanks[z].speed=1;
                            }
                        }
                        colliding = true;
                        xmove = tanks[z].speed * Math.sin(tanks[z].angle);
                        ymove = tanks[z].speed * Math.cos(tanks[z].angle);
                        timeout = 0;
                        while (colliding){
                            ourcorners = tankcorners(z);
                            othercorners =tankothercorners(z);
                            tanks[z].x -= xmove;
                            tanks[z].y += ymove;
                            colliding = doIntersect(ourcorners[i],ourcorners[nexti],othercorners[j][k],othercorners[j][nextk]);
                            timeout++;
                            if (timeout>100){
                                colliding = false;
                            }
                        }
                    }
                    
                }
            }
        }
    }      
    /*
    Collision with walls at edge of map
    */
    var i;
    for (i = 0; i < ourcorners.length; i++) {
        if (ourcorners[i].x > gamearea.canvas.width){
            tanks[z].x = gamearea.canvas.width-(ourcorners[i].x-tanks[z].x);
        }
        if (ourcorners[i].x < 0) {
            tanks[z].x = tanks[z].x-ourcorners[i].x;
        }
        if (ourcorners[i].y > gamearea.canvas.height){
            tanks[z].y = gamearea.canvas.height-(ourcorners[i].y-tanks[z].y);
        }
        if (ourcorners[i].y < 0) {
            tanks[z].y = tanks[z].y-ourcorners[i].y;
        }
    }
    
    
}

exports.updateGameArea = function() {
    for (var i in tanks) {
        if (tanks.hasOwnProperty(i)) {  
            actions = tanks[i].input;
            left = actions[0];
            right=actions[1];
            up=actions[2];
            down=actions[3];
            shoot=actions[4];
            if (up){
                tanks[i].speed = 1;
            }else{
                if (down){
                    tanks[i].speed = -1;
                }else{
                    tanks[i].speed=0;
                }
            }
            if (left){
                tanks[i].moveAngle = -1;
            }else{
                if (right){
                    tanks[i].moveAngle = 1;
                }else{
                    tanks[i].moveAngle=0;
                }
            }
            if (shoot){
                tankshoot(i);
            }
            updatetanksbullets(i,tanks[i].maxbullets)
            tanknewPos(i);
        }
    }
}
exports.updateone = function(i){
    // check if the property/key is defined in the object itself, not in parent
    if (tanks.hasOwnProperty(i)) {  
        actions = tanks[i].input;
        left = actions[0];
        right=actions[1];
        up=actions[2];
        down=actions[3];
        shoot=actions[4];
        if (up){
            tanks[i].speed = 1;
        }else{
            if (down){
                tanks[i].speed = -1;
            }else{
                tanks[i].speed=0;
            }
        }
        if (left){
            tanks[i].moveAngle = -1;
        }else{
            if (right){
                tanks[i].moveAngle = 1;
            }else{
                tanks[i].moveAngle=0;
            }
        }
        if (shoot){
            tankshoot(i);
        }
        updatetanksbullets(i,tanks[i].maxbullets)
        tanknewPos(i);
    }

}
exports.maketank = function(x, y, colour,username) {
    this.username = username;
    this.lastshoot = Date.now();
    this.input = [false,false,false,false,false];
    // [false,false,false,false,false]
    this.colour = colour;
    bullets[colour]=[];
    this.height=50;
    this.width=50;
    this.health=4;
    this.angle = 0;
    this.moveAngle = 0;
    this.speed = 0;
    this.x = x;
    this.y = y;
    this.speedmult = 3;
    this.bulletspeed = 5;
    this.moveanglemult = 4;
    this.maxbullets = 10;
    this.firerate = 200;
    this.bulletheight=40;
    this.bulletwidth=60;
    
}


function bullet(width, height, x, y, angle, speed, colour) {
    this.width = width;
    this.height = height;
    this.colour=colour;
    this.x=x;
    this.y=y;
    this.angle=angle;
    this.speed=speed;
    this.x += this.height/2 * Math.sin(this.angle);
    this.y -= this.height/2 * Math.cos(this.angle);
}

function Point(x,y){ 
    this.x = x;
    this.y = y;
}

function onSegment(p, q, r){
    if (( (q.x <= Math.max(p.x, r.x)) && (q.x >= Math.min(p.x, r.x)) && (q.y <= Math.max(p.y, r.y)) && (q.y >= Math.min(p.y, r.y)))){
        return true;
    }
    return false;
}
function orientation(p, q, r){
    val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));
    if (val > 0){
        return 1
    }else if (val < 0){
        return 2
    }else{
        return 0
    }
}
function doIntersect(p1,q1,p2,q2){
    o1 = orientation(p1, q1, p2);
    o2 = orientation(p1, q1, q2);
    o3 = orientation(p2, q2, p1);
    o4 = orientation(p2, q2, q1);
    if (((o1 != o2) && (o3 != o4))){
        return true
    } 
    if (((o1 == 0) && onSegment(p1, p2, q1))){
        return true
    }

    if (((o2 == 0) && onSegment(p1, q2, q1))){
        return true
    } 
    if (((o3 == 0) && onSegment(p2, p1, q2))){
        return true
    } 
    if (((o4 == 0) && onSegment(p2, q1, q2))){
        return true
    }
    return false
}
function GetPointRotated(X, Y, W, H, R, Xos, Yos){
    var rotatedX = X + (Xos  * Math.cos(R)) - (Yos * Math.sin(R));
    var rotatedY = Y + (Xos  * Math.sin(R)) + (Yos * Math.cos(R));
    coords = new Point(rotatedX,rotatedY);
    return coords;
}
function findcorners(xpos, ypos, angle, width, height) {
    corner1 = GetPointRotated(xpos, ypos, width, height, angle, width/2, height/2);
    corner2 = GetPointRotated(xpos, ypos, width, height, angle, -width/2, height/2);
    corner3 = GetPointRotated(xpos, ypos, width, height, angle, width/2, -height/2);
    corner4 = GetPointRotated(xpos, ypos, width, height, angle, -width/2, -height/2);
    return [corner1,corner2,corner4,corner3];
}
function updatetanksbullets(colour,maxbullets) {
    let tankothercornerso = tankothercorners(colour);
    for (i=0;i<bullets[colour].length;i++){
        bulletnewPos(colour,i,tankothercornerso);
    }
    bullets[colour].splice(0, bullets[colour].length-maxbullets);
}