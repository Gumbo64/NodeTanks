const os = require('os');
const express = require('express')
const app = express()
const path = require('path');
const nunjucks = require('nunjucks');
const ip = require('ip');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const ipadress = ip.address();
console.log(ipadress);
const ioport = 1569;
const port = 80;
const tickrate =100;
const io = require('socket.io')(ioport);
const tankslogic = require('./static/scripts/tankslogic');
const threadingpack = require('./multithreading')


nunjucks.configure( '.', {
    autoescape: true,
    express: app
});

userCPUCount = os.cpus().length;
inputs = {};
tanks = {};
bullets = {};
gamearea = {};
gamearea['canvas']={};
gamewidth = 10000;
gameheight= 10000;
gamearea.canvas.width = gamewidth;
gamearea.canvas.height = gameheight;
workers = {};
app.set('view engine', 'nunjucks')
app.use('/static', express.static('static'))
bullets = {}
io.on('connection', socket => {
  socket.on('new-user', () => {
    socket.emit('identifier',socket.id);
    handleNew(socket.id);
  })
  socket.on('staterequest', (inputis) => {
    socket.emit('states',tanks,bullets);
    try {
      tanks[socket.id].input=inputis; 
    } catch (error) {
      socket.emit('identifier',socket.id);
      handleNew(socket.id);
    }
    
  })
  socket.on('disconnect', () => {
    //delete workers[socket.id];
    console.log(socket.id,' disconnected')
    delete tanks[socket.id];
    delete bullets[socket.id];
  })
})
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

multithreading=true;
if (multithreading){
  async function a() {
    lasttime = Date.now();
    await threadupdatehandle()
    console.log('done')
    a()
    // console.log(Date.now()-lasttime);
  }
  while(true){
    a();
    console.log('das')
  }
  function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
}else{
  setInterval(tankslogic.updateGameArea, tickrate);
}


app.get('/', function(req, res){
    res.render(`${__dirname}/templates/multiplayertanks.html`, {ipadress: ipadress});
})

app.listen(port, function(){
    console.log(`Running at http://localhost:${port}`)
})
function handleNew(id){
  tanks[id] = new tankslogic.maketank(Math.round(Math.random()*gamewidth),Math.round(Math.random()*gameheight),id);
  console.log(id,' joined');
}
function threadupdatehandle(){
  return new Promise(resolve => {
    // console.log('dsasddsa');
    (async () => {
      let cputotals = [];
      let cpu = 0
      let appendit = false;
      for (var i in tanks) {
        if (tanks.hasOwnProperty(i)) {
          if (!appendit){
            cputotals.push([tanks,bullets,i]);
          }else{
            cputotals[cpu].push(i);
          }
          cpu++;
          if (cpu>userCPUCount-2){
            if (!appendit){
              appendit = true;
            }
            cpu=0;
          }
        }
      }
      // console.log(cputotals)
      lasttime = Date.now();
      // console.log('going in')
      let result = await Promise.all(cputotals.map(threadingpack))
      console.log(result)
      // console.log(Date.now()-lasttime);
      for (i=0;i<result.length;i++){
        for (j=0;j<result[i].length;j++){
          let colour = result[i][j][2];
          tanks[colour] = result[i][j][0];
          bullets[colour] = result[i][j][1];
        }
      }
      resolve();
    })();
  });
}

