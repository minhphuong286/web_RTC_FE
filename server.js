const express = require('express')

const io = require('socket.io')({
    cors: {
        origin: "https://131e-14-165-81-124.ap.ngrok.io",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
    path: '/webrtc'
})


const app = express()
const port = 8080

//https://expressjs.com/en/guide/writing-middleware.html
app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/build/index.html');
})
// app.get('/', (req, res) => res.send('Hello, Webrtc'))

const server = app.listen(port, () => {
    console.log('WebRTC app is listening on port ' + port)
})

io.listen(server)

const webRTCNamespace = io.of('/webRTCPeers')
let connectedPeers = new Map();

webRTCNamespace.on('connection', socket => {
    socket.emit('info-socket', {
        socketId: socket.id,
        // socket: socket
    })
    console.log(socket.id)
    connectedPeers.set(socket.id, socket)
    console.log("connectedPeers:", connectedPeers)
    socket.emit('connection-success', {
        status: 'connection-success',
        socketId: socket.id
    })
    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`)
        connectedPeers.delete(socket.id);
    })
    socket.on('sdp', data => {
        // console.log(data)
        socket.broadcast.emit('sdp', data)
    })
    socket.on('close', data => {
        socket.broadcast.emit('close', data)
    })
    socket.on('candidate', data => {
        // console.log(data)
        socket.broadcast.emit('candidate', data)
    })
})  