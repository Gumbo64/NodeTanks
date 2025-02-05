const os = require('os');
const express = require('express')
const app = express()
const path = require('path');
const nunjucks = require('nunjucks');
const publicIp = require('public-ip');
// const { Worker, isMainThread, parentPort } = require('worker_threads');
(async () => {
  ipadress = await publicIp.v4();
  //=> '46.5.21.123'
})();
const ioport = 1569;
const port = 80;
const tickrate =10;
const io = require('socket.io')(ioport);
const tankslogic = require('./static/scripts/tankslogic');


nunjucks.configure( '.', {
    autoescape: true,
    express: app
});

inputs = {};
tanks = {};
bullets = {};
// gamearea = {};
// gamearea['canvas']={};
// gamewidth = 1000;
// gameheight= 1000;
// gamearea.canvas.width = gamewidth;
// gamearea.canvas.height = gameheight;
workers = {};
app.set('view engine', 'nunjucks')
app.use('/static', express.static('static'))
bullets = {}
function truncate(str, n){
  return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
};
io.on('connection', socket => {
  socket.on('new-user', (username) => {
    username = truncate(username,40);
    socket.emit('identifier',socket.id);
    handleNew(socket.id,username);
  })
  socket.on('staterequest', (inputis) => {
    socket.emit('states',tanks,bullets);
    try {
      tanks[socket.id].input=inputis; 
    } catch (error) {
      socket.emit('identifier',socket.id);
      handleNew(socket.id,'unnamed');
    }
    
  })
  socket.on('disconnect', () => {
    //delete workers[socket.id];
    if (!tanks[socket.id].username){
      tanks[socket.id].username='unnamed';
    }
    console.log(tanks[socket.id].username,' disconnected')
    delete tanks[socket.id];
    delete bullets[socket.id];
  })
})

app.get('/', function(req, res){
  res.render(`${__dirname}/templates/multiplayertanks.html`);
})

app.listen(port, function(){
  console.log(`Running at http://localhost:${port}`)
})
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

multithreading=false;
if (multithreading){
  workerlist = [];
  userCPUCount = os.cpus().length;
  for (i=0;i<userCPUCount-2;i++){
    workerlist.push(new Worker('./multithreading.js'))
    workerlist[i].on('message',(states)=>{threadreturn(states)})
    workerlist[i].on('error', function(s){console.log(s)});
    workerlist[i].on('exit', (code) => {
      if (code !== 0)
        console.log(code)
    });
  }
  async function a() {
    lasttime = Date.now();
    await threadsend();
    await sleep(tickrate)
    a();
    // console.log(Date.now()-lasttime);
  }
  a();

}else{
  setInterval(tankslogic.updateGameArea, tickrate);
}
function threadsend(){
  return new Promise((resolve) => {
    (async () => {
      let cputotals = [];
      let cpu = 0
      let appendit = false;
      for (var i in tanks){
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
      await sendstate(cputotals)
      resolve();
    })();
  })
}
function sendstate(cputotals){
  return new Promise((resolve) => {
    for (i=0;i<cputotals.length;i++){
      workerlist[i].postMessage(cputotals[i])
    }
    resolve()
  })
}
function threadreturn(result){
  return new Promise((resolve) => {
    console.log('start',result,'end')
    for (i=0;i<result.length;i++){
      // for (j=0;j<result[i].length;j++){
        let colour = result[i][2];
        tanks[colour] = result[i][0];
        bullets[colour] = result[i][1];
      // }
    }
    console.log('tankstart',tanks,'tankend')
    resolve();
  })
}

function handleNew(id,username){
  tanks[id] = new tankslogic.maketank(Math.round(Math.random()*gamewidth),Math.round(Math.random()*gameheight),id,username);
  console.log(username,' joined');
}


