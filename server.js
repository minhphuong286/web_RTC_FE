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
let onlineList = [];
let callingList = [];

webRTCNamespace.on('connection', socket => {

    const room = socket.handshake.query.room;

    messages[room] = messages[room] || []

    socket.emit('info-socket', {
        socketId: socket.id,
        // socket: socket
    })
    console.log("Start:", 'id:', socket.id)
    // connectedPeers.set(socket.id, socket)
    // console.log("connectedPeers:", connectedPeers)


    socket.emit('connection-success', {
        status: 'connection-success',
        socketId: socket.id,
        messages: messages[room],
    })

    socket.on('onliner', (data) => {
        console.log("data - onliner:", data)

        const objIndex = onlineList.findIndex(item => item.dataFrom === data.dataFrom);
        if (objIndex !== -1) {  //update case
            //do something
        } else {
            onlineList.push({
                "localId": data.localId,
                "dataFrom": data.dataFrom,
                "roomId": data.roomId
            })
        }

        io.of("/webRTCPeers").emit('onliner', onlineList);

    })

    socket.on('new-message', (data) => {
        console.log('new-message', data)

        // messages[room] = [...messages[room], JSON.parse(data.payload)]
    })

    socket.on('disconnect', () => {
        onlineList = onlineList.filter(item => item.localId !== socket.id);
        io.of("/webRTCPeers").emit('onliner', onlineList);
        console.log(`${socket.id} has disconnected`)
        // connectedPeers.delete(socket.id);
    })

    socket.on('sdp', data => {
        //console.log(data)
        socket.broadcast.emit('sdp', data)
    })

    socket.on('offer', data => {
        console.log("data - offer:", data.localId, "-", data.roomId, "-", data.dataFrom, "-", data.dataTo);
        // let offerTo = onlineList.filter(item => item.dataFrom === data.dataTo)
        if (callingList.includes(data.dataTo) === false) {
            callingList.push(data.dataFrom);
            socket.broadcast.emit('offer', data);
        } else {
            webRTCNamespace.to(data.localId).emit('answer', { message: `${data.dataTo} is in a call`, code: 1, roomId: data.roomId, dataFrom: data.dataFrom });
        }
    })
    socket.on('answer', data => {
        // console.log(data)
        socket.broadcast.emit('answer', data)
    })

    //when iceConnectionState is connected
    socket.on("incall", data => {
        console.log("data - connected:", data.roomId, "-", data.dataFrom, "-", data.dataTo);
        callingList.push(data.dataTo);
        console.log("callingList:", callingList);
    })

    socket.on('close', data => {
        callingList = callingList.filter(item => item !== data.dataFrom || item !== data.dataTo);
        socket.broadcast.emit('close', data);
    })

    socket.on('candidate', data => {
        // console.log(data)
        socket.broadcast.emit('candidate', data)
    })


})  