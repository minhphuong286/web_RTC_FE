const express = require('express')

const io = require('socket.io')({
    // cors: {
    //     // origin: "https://131e-14-165-81-124.ap.ngrok.io",
    //     // origin: "http://localhost:3000",
    //     methods: ["GET", "POST", "PUT"]
    // },
    path: '/webrtc'
})


const app = express()
const port = 8080

const rooms = {}
const messages = {}

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

    const room = socket.handshake.query.room;

    messages[room] = messages[room] || []

    socket.emit('info-socket', {
        socketId: socket.id,
        // socket: socket
    })
    console.log("Start:", socket.id)
    // connectedPeers.set(socket.id, socket)
    // console.log("connectedPeers:", connectedPeers)

    socket.emit('connection-success', {
        status: 'connection-success',
        socketId: socket.id,
        messages: messages[room],
    })

    socket.on('new-message', (data) => {
        console.log('new-message', data)

        // messages[room] = [...messages[room], JSON.parse(data.payload)]
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`)
        // connectedPeers.delete(socket.id);
    })

    socket.on('sdp', data => {
        // console.log(data)
        socket.broadcast.emit('sdp', data)
    })

    socket.on('offer', data => {
        // console.log(data)
        socket.broadcast.emit('offer', data)
    })
    socket.on('answer', data => {
        // console.log(data)
        socket.broadcast.emit('answer', data)
    })

    socket.on('close', data => {
        socket.broadcast.emit('close', data)
    })

    socket.on('candidate', data => {
        // console.log(data)
        socket.broadcast.emit('candidate', data)
    })


})  