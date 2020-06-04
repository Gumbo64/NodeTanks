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
const tickrate = 10;
const io = require('socket.io')(ioport);
const tankslogic = require('./static/scripts/tankslogic');

nunjucks.configure( '.', {
    autoescape: true,
    express: app
});
gamearea = {};
tanks = {};
bullets = {};
gamearea['canvas']={};
gamewidth = 10000;
gameheight= 10000;
gamearea.canvas.width = gamewidth;
gamearea.canvas.height = gameheight;

app.set('view engine', 'nunjucks')
app.use('/static', express.static('static'))
bullets = {}
io.on('connection', socket => {
  socket.on('new-user', () => {
    tanks[socket.id] = new tankslogic.maketank(Math.round(Math.random()*gamewidth),Math.round(Math.random()*gameheight),socket.id);
    console.log(socket.id,' joined');
    socket.emit('identifier',socket.id);
  })

  socket.on('staterequest', (inputs) => {
    socket.emit('states',tanks,bullets);
    try {
      tanks[socket.id].input = inputs;
    } catch (error) {
      console.log('fck')
      tanks[socket.id] = new tankslogic.maketank(Math.round(Math.random()*gamewidth),Math.round(Math.random()*gameheight),socket.id);
      console.log(socket.id,' joined');
      socket.emit('identifier',socket.id);
    }
    
  })
  socket.on('disconnect', () => {
    delete tanks[socket.id];
  })
})


setInterval(tankslogic.updateGameArea, tickrate);

app.get('/', function(req, res){
    res.render(`${__dirname}/templates/multiplayertanks.html`, {ipadress: ipadress});
})

app.listen(port, function(){
    console.log(`Running at http://localhost:${port}`)
})