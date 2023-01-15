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

const webRTCNamespace = io.of('/webRTCPeers');

let connectedPeers = new Map();
let onlineList = [];
let callingList = [];

const messagesGroup = {}
const roomsGroup = {}

webRTCNamespace.on('connection', socket => {
    const roomGroup = socket.handshake.query.room;
    roomsGroup[roomGroup] = roomsGroup[roomGroup] && roomsGroup[roomGroup].set(socket.id, socket) || (new Map()).set(socket.id, socket)
    messagesGroup[roomGroup] = messagesGroup[roomGroup] || []

    const broadcast = () => {
        const _connectedPeers = roomsGroup[roomGroup]

        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID !== socket.id) {
                _socket.emit('joined-peers-group', {
                    peerCount: roomsGroup[roomGroup].size, //connectedPeers.size,
                })
            }
        }
    }
    broadcast();

    const disconnectedPeer = (socketID) => {
        const _connectedPeers = roomsGroup[roomGroup]
        for (const [_socketID, _socket] of _connectedPeers.entries()) {
            _socket.emit('peer-disconnected-group', {
                peerCount: roomsGroup[roomGroup].size,
                socketID
            })
        }
    }
    socket.on('new-message-group', (data) => {
        // console.log('new-message', data)

        messagesGroup[roomGroup] = [...messagesGroup[roomGroup], JSON.parse(data.payload)]
    })
    socket.on('onlinePeers-group', (data) => {
        const _connectedPeers = roomsGroup[roomGroup]
        for (const [socketID, _socket] of _connectedPeers.entries()) {
            // don't send to self
            if (socketID !== data.socketID.local) {
                console.log('online-peer', data.socketID, socketID)
                socket.emit('online-peer-group', socketID)
            }
        }
    })
    socket.on('reconnect-group', (data) => {
        socket.emit('connection-success-group', {
            success: socket.id,
            peerCount: roomsGroup[roomGroup].size,
            messages: messagesGroup[roomGroup],
        })
    })
    socket.on('offer-group', data => {
        const _connectedPeers = roomsGroup[roomGroup]
        for (const [socketID, socket] of _connectedPeers.entries()) {
            // don't send to self
            if (socketID === data.socketID.remote) {
                // console.log('Offer', socketID, data.socketID, data.payload.type)
                socket.emit('offer-group', {
                    sdp: data.payload,
                    socketID: data.socketID.local
                }
                )
            }
        }
    })

    socket.on('answer-group', (data) => {
        const _connectedPeers = roomsGroup[roomGroup]
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID === data.socketID.remote) {
                console.log('Answer', socketID, data.socketID, data.payload.type)
                socket.emit('answer-group', {
                    sdp: data.payload,
                    socketID: data.socketID.local
                }
                )
            }
        }
    })

    socket.on('candidate-group', (data) => {
        const _connectedPeers = roomsGroup[roomGroup]
        // send candidate to the other peer(s) if any
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID === data.socketID.remote) {
                socket.emit('candidate-group', {
                    candidate: data.payload,
                    socketID: data.socketID.local
                })
            }
        }
    })

    console.log("Start:", 'id:', socket.id)
    // connectedPeers.set(socket.id, socket)
    // console.log("connectedPeers:", connectedPeers)


    socket.emit('connection-success', {
        status: 'connection-success',
        socketId: socket.id,

    })

    socket.on('onliner', (data) => {
        console.log("data - onliner:", data);
        const objIndex = onlineList.findIndex(item => item.dataFrom === data.dataFrom);
        if (objIndex !== -1) {  //update case
            //do something
        } else {
            if (data.localId && data.dataFrom) {
                onlineList.push({
                    "localId": data.localId,
                    "dataFrom": data.dataFrom,
                })
                io.of("/webRTCPeers").emit('onliner', onlineList);
            }
        }
    })

    socket.on('onliner_chat', (data) => {
        console.log("data - onliner_chat:", data);
        let room = "";
        if (data.roomId) {
            room = data.roomId;
            messages[room] = messages[room] || [];
            console.log("ONliNer_chat:", messages[room]);
            // io.of("/webRTCPeers").emit('message_stored', { roomId: room, localId: data.localId, dataFrom: data.dataFrom, dataTo: data.dataTo, messages: messages[room] });
            io.of("/webRTCPeers").emit('onliner_chat', { roomId: room, localId: data.localId, dataFrom: data.dataFrom, dataTo: data.dataTo, messages: messages[room] });
        }
    })

    socket.on('offer_chat', data => {
        console.log("data - offer:", "-", data.roomId, "-", data.dataFrom, "-", data.dataTo);
        socket.broadcast.emit('offer_chat', data);
    })
    socket.on('answer_chat', data => {
        // console.log(data)
        socket.broadcast.emit('answer_chat', data)
    })

    socket.on('new-message', (data) => {
        console.log('new-message', data)
        if (data.roomId && data.message) {
            messages[data.message.roomId] = [...messages[data.message.roomId], data];
        }
    })

    socket.on('disconnect', () => {
        roomsGroup[roomGroup].delete(socket.id)
        messagesGroup[roomGroup] = roomsGroup[roomGroup].size === 0 ? null : messagesGroup[roomGroup]
        disconnectedPeer(socket.id)

        onlineList = onlineList.filter(item => item.localId !== socket.id);
        io.of("/webRTCPeers").emit('onliner', onlineList);
        console.log(`${socket.id} has disconnected`)
        // connectedPeers.delete(socket.id);
        io.of("/webRTCPeers").emit('close_chat', socket.id);
    })

    socket.on('offer', data => {
        console.log("data - offer:", data.localId, "-", data.roomId, "-", data.dataFrom.phone, "-", data.dataTo);
        // let offerTo = onlineList.filter(item => item.dataFrom === data.dataTo)
        if (callingList.includes(data.dataTo) === false) {
            callingList.push(data.dataFrom.phone);
            socket.broadcast.emit('offer', data);
        } else {
            webRTCNamespace.to(data.localId).emit('answer', { message: `${data.dataTo} is in a call`, code: 1, roomId: data.roomId, dataFrom: data.dataFrom.phone });
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
        console.log("CLose -data:", data);
        callingList = callingList.filter(item => item !== data.dataFrom).filter(item => item !== data.dataTo);
        console.log("CLose - callingList:", callingList);
        socket.broadcast.emit('close', data);
    })

    socket.on('candidate', data => {
        // console.log(data)
        socket.broadcast.emit('candidate', data)
    })

    socket.on('candidate_chat', data => {
        // console.log(data)
        socket.broadcast.emit('candidate_chat', data)
    })

})

