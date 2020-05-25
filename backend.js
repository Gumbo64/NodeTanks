const express = require('express')
const app = express()
const path = require('path');
const nunjucks = require('nunjucks');
const ioport = 3000;
const port = 5000;
const io = require('socket.io')(ioport);

nunjucks.configure( '.', {
    autoescape: true,
    express: app
} ) ;

app.set('view engine', 'nunjucks')
app.use('/static', express.static('static'))

const users = {}
io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('player-move', message => {
    socket.broadcast.emit('player-move', { input:message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})

app.get('/', function(req, res){
    res.render(`${__dirname}/templates/multiplayertanks.html`);
})

app.listen(port, function(){
    console.log(`Running at http://localhost:${port}`)
})