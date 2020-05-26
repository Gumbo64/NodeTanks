const express = require('express')
const app = express()
const path = require('path');
const nunjucks = require('nunjucks');
const ioport = 1569;
const port = 5000;
const tickrate = 10;
const io = require('socket.io')(ioport);
const tankslogic = require('./static/scripts/tankslogic');

nunjucks.configure( '.', {
    autoescape: true,
    express: app
} ) ;
gamearea = {};
gamearea['canvas']={};
gamearea.canvas.width = 1000;
gamearea.canvas.height = 1000;

app.set('view engine', 'nunjucks')
app.use('/static', express.static('static'))
tanks = {}
bullets = {}
io.on('connection', socket => {
  socket.on('new-user', () => {
    tanks[socket.id] = new tankslogic.maketank(500,500,socket.id);
    console.log(socket.id,' joined');
    socket.broadcast.emit('log','recieved');
  })

  socket.on('staterequest', (inputs) => {
    socket.broadcast.emit('staterecieve',tanks,bullets);
    try {
      tanks[socket.id].input = inputs;
      console.log(inputs)
    } catch (error) {
      console.log('fck')
      tanks[socket.id] = new tankslogic.maketank(500,500,socket.id);
      console.log(socket.id,' joined');
    }
    
  })
  socket.on('disconnect', () => {
    delete tanks[socket.id];
  })
})


setInterval(tankslogic.updateGameArea, tickrate);

app.get('/', function(req, res){
    res.render(`${__dirname}/templates/multiplayertanks.html`);
})

app.listen(port, function(){
    console.log(`Running at http://localhost:${port}`)
})