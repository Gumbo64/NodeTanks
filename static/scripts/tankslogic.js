
frictioncollision=false;


exports.updateGameArea = function() {
    for (var i in tanks) {
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
                tanks[i].shoot();
            }
            updatetanksbullets(i,tanks[i].maxbullets)
            tanks[i].newPos();
            tanks[i].input=[false,false,false,false,false];
        }
    }
}
exports.maketank = function(x, y, colour) {
    this.lastshoot = Date.now();
    this.input = [false,false,false,false,false]
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
    this.speedmult = 30;
    this.bulletspeed = 30;
    this.moveanglemult = 4;
    this.maxbullets = 100;
    this.firerate = 10;
    this.bulletheight=40;
    this.bulletwidth=60;
    this.damage = function(){
        this.health = this.health -0.5;
    }
    this.shoot = function() {
        if (Date.now() - this.lastshoot >= this.firerate){
            append = new bullet(this.bulletwidth,this.bulletheight,this.x,this.y,this.angle,this.bulletspeed,this.colour);
            bullets[this.colour].push(append);
            this.lastshoot=Date.now()
        }
    }
    this.corners = function() {
        return findcorners(this.x,this.y,this.angle,this.width,this.height);
    }
    
    this.othercorners = function(){
        var othercorners = [];
        for (var i in tanks) {
            // check if the property/key is defined in the object itself, not in parent
            if (tanks.hasOwnProperty(i)) {           
                if (this.colour != tanks[i].colour && tanks[i].health >0){
                    append = tanks[i].corners();
                    append.push(tanks[i].colour)
                    othercorners.push(append);
                }
            }
        }
        return othercorners;
    }
    
    this.newPos = function() {
        if (this.health <= 0){
            this.x = -99999999;
            this.y = -99999999;
            return 'ded';
        }
        this.angle += this.moveAngle * this.moveanglemult * Math.PI / 180;
        this.x += this.speedmult * this.speed * Math.sin(this.angle);
        this.y -= this.speedmult * this.speed * Math.cos(this.angle);
        var ourcorners = this.corners();
        var othercorners = this.othercorners();
        var i;
        var nexti;
        /* This for loop checks collision with other tanks*/
        
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
                            this.angle -= this.moveAngle * Math.PI / 180;
                            this.x -= this.speedmult * this.speed * Math.sin(this.angle);
                            this.y += this.speedmult * this.speed * Math.cos(this.angle);
                        }else{
                            timeoutmax = 2 * this.speed;
                            if (this.speed==0){
                            }else{
                                if (this.speed<0){
                                    this.speed = -1;
                                }else{
                                    this.speed=1;
                                }
                            }
                            colliding = true;
                            xmove = this.speed * Math.sin(this.angle);
                            ymove = this.speed * Math.cos(this.angle);
                            timeout = 0;
                            while (colliding){
                                ourcorners = this.corners();
                                othercorners = this.othercorners();
                                this.x -= xmove;
                                this.y += ymove;
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
                this.x = gamearea.canvas.width-(ourcorners[i].x-this.x);
            }
            if (ourcorners[i].x < 0) {
                this.x = this.x-ourcorners[i].x;
            }
            if (ourcorners[i].y > gamearea.canvas.height){
                this.y = gamearea.canvas.height-(ourcorners[i].y-this.y);
            }
            if (ourcorners[i].y < 0) {
                this.y = this.y-ourcorners[i].y;
            }
        }
        
        
    }
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
    
        
    this.corners = function() {
        return findcorners(this.x,this.y,this.angle,this.width,this.height);
    }
        
    this.newPos = function(othercorners) {
        this.x +=  this.speed * Math.sin(this.angle);
        this.y -=  this.speed * Math.cos(this.angle);
        var ourcorners = this.corners();
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
                                    tanks[p].damage();
                                }
                            }
                        }
                        this.x = -9999999999;
                        this.y = -9999999999;
                        this.angle = 0;                  
                    }
                }
            }
        }      
    }
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
    for (i=0;i<bullets[colour].length;i++){
        bullets[colour][i].newPos(tanks[colour].othercorners());
    }
    bullets[colour].splice(0, bullets[colour].length-maxbullets);
}