import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import io from "socket.io-client";

import './Chat.scss';
import ChatFrame from './ChatFrame';
import ChatVideo from './ChatVideo';
import ModalChatVideo from './ModalChatVideo';

import { detectIsCallingVideo } from './videoSlice';
import { selectCallingDetect, selectCallingUser, selectDataFromDetect } from './videoSlice';

let pc_config = null;
pc_config = {
    "iceServers": [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
}
const socket = io(
    '/webRTCPeers',
    {
        path: '/webrtc',
    }
)
const Chat = (props) => {
    let { currentUser, roomId } = props;

    const callingUserName = useSelector(selectCallingUser)
    const callingDetect = useSelector(selectCallingDetect)

    const dispatch = useDispatch()

    const typeTextRef = useRef();

    const userData = useSelector(selectDataFromDetect);
    const [typeText, setTypeText] = useState('');
    const [messages, setMessages] = useState([]);
    const [sendChannels, setSendChannels] = useState([]);
    const [initPeerconnection, setInitPeerconnection] = useState(false);
    const [peerConnections, setPeerConnections] = useState({});
    const [openModalVideoCall, setOpenModalVideoCall] = useState(false);
    const [sdpConstraints, setSdpConstraints] = useState({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
    });
    // console.log('Check props openVideo:', openVideo)

    const pc = useRef(new RTCPeerConnection(pc_config));

    // add pc to peerConnections object
    // const peerConnections = { ...peerConnections, [socketID]: pc }
    // setPeerConnections({ peerConnections })

    pc.current.onicecandidate = (e) => {
        if (e.candidate) {
            // console.log(JSON.stringify(e.candidate))
            sendToPeer('candidate', e.candidate)
        }
    }

    useEffect(() => {
        socket.on('connection-success', data => {
            console.log("Chat conn-success:", data);
        })
        console.log('Chat socket:', socket);
        if (socket) {
            sendToPeer('onliner_chat', { roomId, dataFrom: userData.phone, dataTo: currentUser.phone })
        };

        socket.on('onliner_chat', data => {
            console.log('Chat onOnliner:', data);
            if (data.dataFrom === userData.phone && data.roomId === roomId) {
                setMessages((prevState) => [...prevState, data.messages]);
            }

            const handleSendChannelStatusChange = (event) => {
                console.log('sendChannel status change:', sendChannels);
                console.log('send channel status: ' + sendChannels[0].readyState)
            }
            console.log('pc:', pc.current)
            const sendChannel = pc.current.createDataChannel('sendChannel');
            console.log('ID sendChannel:', sendChannel.id, sendChannel);
            sendChannel.onopen = handleSendChannelStatusChange
            sendChannel.onclose = handleSendChannelStatusChange

            setSendChannels((prevState) => [...prevState, sendChannel]);
            // setSendChannels((prevState) => {
            //     console.log('preState:', [
            //         ...prevState,
            //         sendChannel
            //     ])
            //     return ([
            //         ...prevState,
            //         sendChannel
            //     ])
            // });
            // console.log('sendChannel:', sendChannel, 'chs:', sendChannels)
            const handleReceiveMessage = (event) => {
                const message = JSON.parse(event.data)
                console.log('msg REC', message, event);
                setMessages((prevState) => [...prevState, data.messages]);
            }

            const handleReceiveChannelStatusChange = (event) => {
                if (this.receiveChannel) {
                    console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
                }
            }
            const receiveChannelCallback = (event) => {
                const receiveChannel = event.channel
                receiveChannel.onmessage = handleReceiveMessage
                receiveChannel.onopen = handleReceiveChannelStatusChange
                receiveChannel.onclose = handleReceiveChannelStatusChange
            }

            pc.current.ondatachannel = receiveChannelCallback;

            pc.current.createOffer(sdpConstraints)
                .then(sdp => {
                    pc.current.setLocalDescription(sdp);
                    console.log("current")
                    sendToPeer('offer_chat', { sdp, roomId, localId: socket.id, dataFrom: userData.phone, dataTo: currentUser.phone });
                })
        })

        socket.on('candidate', candidate => {
            // console.log('Candidates ...:', candidate)
            // candidates.current = [...candidates.current, candidate]
            pc.current.addIceCandidate(new RTCIceCandidate(candidate))
        })

        socket.on('answer_chat', data => {
            pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => { })
        })

        socket.on('offer_chat', data => {
            const handleSendChannelStatusChange = (event) => {
                // console.log('sendChannel status change:', sendChannels);
                // console.log('send channel status: ' + sendChannels[0].readyState)
            }
            console.log('pc:', pc)
            const sendChannel = pc.current.createDataChannel('sendChannel');
            sendChannel.onopen = handleSendChannelStatusChange
            sendChannel.onclose = handleSendChannelStatusChange
            setMessages((prevState) => [...prevState, data.messages]);
            // setSendChannels((prevState) => {
            //     console.log('preState:', [
            //         ...prevState,
            //         sendChannel
            //     ])
            //     return ([
            //         ...prevState,
            //         sendChannel
            //     ])
            // });
            console.log('offer rsendChannel:', sendChannel, 'chs:', sendChannels)
            const handleReceiveMessage = (event) => {
                const message = JSON.parse(event.data)
                console.log('msg offer REC', message)
                setMessages((prevState) => [...prevState, data.messages]);
            }

            const handleReceiveChannelStatusChange = (event) => {
                if (this.receiveChannel) {
                    console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
                }
            }
            const receiveChannelCallback = (event) => {
                const receiveChannel = event.channel
                receiveChannel.onmessage = handleReceiveMessage
                receiveChannel.onopen = handleReceiveChannelStatusChange
                receiveChannel.onclose = handleReceiveChannelStatusChange
            }

            pc.current.ondatachannel = receiveChannelCallback;

            pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            // 2. Create Answer
            pc.current.createAnswer(sdpConstraints)
                .then(sdp => {
                    pc.current.setLocalDescription(sdp);
                    sendToPeer('answer_chat', { sdp, roomId, dataFrom: userData, dataTo: currentUser });
                })
        })



    }, [])

    const processSDP = (sdp) => {
        // console.log(JSON.stringify(sdp))
        pc.current.setLocalDescription(sdp)
        sendToPeer('sdp', { sdp, roomId, dataFrom: userData, dataTo: currentUser })
    }
    const createOffer = () => {
        pc.current.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            //send the sdp to the server
            processSDP(sdp);
        }).catch(e => console.log('createOffer Error...', e))
    }
    const createAnswer = () => {
        pc.current.createAnswer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            processSDP(sdp)
        }).catch(e => console.log('createAnswer Error...', e))
    }
    const sendToPeer = (eventType, payload) => {
        socket.emit(eventType, payload)
    }
    const handleOpenVideoCall = (name) => {
        // console.log('openVideo:', openVideo)
        let isCalling = true;
        dispatch(detectIsCallingVideo({ name, isCalling }));
        setOpenModalVideoCall(true);
        // console.log('Name:', name)
    }
    const handleStopVideoCall = (name) => {
        // console.log('openVideo:', openVideo)
        let isCalling = false;
        dispatch(detectIsCallingVideo({ name, isCalling }));
        // console.log('Name:', name)
    }

    const handleToggleModal = () => {
        setOpenModalVideoCall(!openModalVideoCall);
    }

    const sendMessage = (typeText) => {
        const msg = {
            type: 'text',
            message: {
                socketId: socket.id,
                roomId: roomId,
                dataFrom: { phone: userData.phone, },
                dataTo: { phone: currentUser.phone },
                data: { text: typeText }
            }
        };
        // setMessages((prevState) => {
        //     console.log('preState mess:', [
        //         ...prevState,
        //         message
        //     ])
        //     return ([
        //         ...prevState,
        //         message
        //     ])
        // });
        setMessages((prevState) => [...prevState, msg]);
        console.log('sendCs:', sendChannels)
        sendChannels.map(sendChannel => {
            console.log('sendMessage sendChannel:', sendChannel);
            sendChannel.readyState === 'open' && sendChannel.send(JSON.stringify(msg))

        })
        sendToPeer('new-message', { message: typeText, roomId, dataFrom: userData.phone, dataTo: currentUser.phone })
    }


    const handleSendMessage = () => {
        if (typeText) {
            console.log("typeText:", typeText)
            sendMessage(typeText.trim());

        }
    }
    const content = (
        <div className="chat-container">
            <div className="chat__friend">
                <div className="chat__friend--avatar">
                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                </div>
                <div className="chat__friend--info">
                    <h4 className="info--name">{currentUser.name}</h4>
                    {/* <p className="info--state">Online </p> */}
                </div>
                <div className='chat__friend--video'>
                    <i className=
                        {callingDetect && callingUserName ?
                            currentUser.name === callingUserName ?
                                "fas fa-video calling"
                                : "fas fa-video unallow"
                            : "fas fa-video"
                        }

                        onClick={() => handleOpenVideoCall(currentUser.name)}
                    ></i>
                    <i className=
                        {callingDetect && callingUserName ?
                            currentUser.name === callingUserName ?
                                "fas fa-stop"
                                : "fas fa-stop unallow"
                            : "fas fa-stop"
                        }
                        onClick={() => handleStopVideoCall(currentUser.name)}
                    ></i>
                </div>
            </div>
            <div className={callingDetect === true && currentUser.name === callingUserName ? "chat__place on-video" : "chat__place"}>
                {callingDetect === true && currentUser.name === callingUserName
                    ?
                    // <ChatVideo
                    //     roomId={roomId}
                    //     currentUser={currentUser}
                    // />
                    <ModalChatVideo
                        openModalVideoCall={openModalVideoCall}
                        handleToggleModal={handleToggleModal}
                        roomId={roomId}
                        currentUser={currentUser}
                    />
                    :
                    <ChatFrame
                        roomId={roomId}
                        currentUser={currentUser}
                        messages={messages}
                    />
                }
            </div>
            {callingDetect === true && currentUser.name === callingUserName
                ?
                <div></div>
                :
                <div className="chat__type"
                >
                    <div className="tool-box">

                    </div>
                    <div className="contents-place">
                        <div className="type-box">
                            <textarea type="text" id="type-box-text"
                                value={typeText}
                                ref={typeTextRef}
                                onChange={(e) => setTypeText(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="send-box">
                            <input type="button" className='button' id='button-send' value="Send"
                                onClick={() => handleSendMessage()}
                            />
                        </div>
                    </div>

                </div>
            }

        </div>
    )

    return content;
}

export default Chat;