
const socket = io('http://localhost:3000')

const name = prompt('What is your name?')
socket.emit('new-user', name)

socket.on('player-move', (input,name) => {
  tanks[name].input = input;
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})
