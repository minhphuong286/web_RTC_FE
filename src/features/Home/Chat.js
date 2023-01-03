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
const Chat = (props) => {
    let { currentUser, roomId } = props;
    // const socket = io(
    //     '/webRTCPeers',
    //     {
    //         path: '/webrtc',
    //         query: {
    //             room: roomId,
    //         }
    //     }
    // )
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

    const pc = new RTCPeerConnection(pc_config);

    // add pc to peerConnections object
    // const peerConnections = { ...peerConnections, [socketID]: pc }
    // setPeerConnections({ peerConnections })

    pc.onicecandidate = (e) => {
        if (e.candidate) {
            // console.log(JSON.stringify(e.candidate))
            sendToPeer('candidate', e.candidate)
        }
    }

    // const buildDataChannel = () => {
    //     if (pc) {

    //         const handleSendChannelStatusChange = (event) => {
    //             // console.log('sendChannel status change:', sendChannels);
    //             // console.log('send channel status: ' + sendChannels[0].readyState)
    //         }
    //         console.log('pc:', pc)
    //         const sendChannel = pc.createDataChannel('sendChannel');
    //         console.log('ID sendChannel:', sendChannel.id);
    //         sendChannel.onopen = handleSendChannelStatusChange
    //         sendChannel.onclose = handleSendChannelStatusChange

    //         setSendChannels((prevState) => {
    //             console.log('preState:', [
    //                 ...prevState,
    //                 sendChannel
    //             ])
    //             return ([
    //                 ...prevState,
    //                 sendChannel
    //             ])
    //         });
    //         console.log('sendChannel:', sendChannel, 'chs:', sendChannels)
    //         const handleReceiveMessage = (event) => {
    //             const message = JSON.parse(event.data)
    //             console.log('msg REC', message)
    //             setMessages((prevState) => ([
    //                 ...prevState,
    //                 message
    //             ]));
    //         }

    //         const handleReceiveChannelStatusChange = (event) => {
    //             if (this.receiveChannel) {
    //                 console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
    //             }
    //         }
    //         const receiveChannelCallback = (event) => {
    //             const receiveChannel = event.channel
    //             receiveChannel.onmessage = handleReceiveMessage
    //             receiveChannel.onopen = handleReceiveChannelStatusChange
    //             receiveChannel.onclose = handleReceiveChannelStatusChange
    //         }

    //         pc.ondatachannel = receiveChannelCallback;

    //         pc.createOffer(sdpConstraints)
    //             .then(sdp => {
    //                 pc.setLocalDescription(sdp);
    //                 sendToPeer('offer', { sdp, roomId, dataFrom: userData, dataTo: currentUser });
    //             })
    //     }else{

    //     }
    // }

    useEffect(() => {
        // socket.on('connection-success', success => {
        //     console.log('Success:', success);
        //     // setMessages(success.message);
        //     if (pc) {
        //         const handleSendChannelStatusChange = (event) => {
        //             // console.log('sendChannel status change:', sendChannels);
        //             // console.log('send channel status: ' + sendChannels[0].readyState)
        //         }
        //         console.log('pc:', pc)
        //         const sendChannel = pc.createDataChannel('sendChannel');
        //         console.log('ID sendChannel:', sendChannel.id);
        //         sendChannel.onopen = handleSendChannelStatusChange
        //         sendChannel.onclose = handleSendChannelStatusChange

        //         setSendChannels((prevState) => {
        //             console.log('preState:', [
        //                 ...prevState,
        //                 sendChannel
        //             ])
        //             return ([
        //                 ...prevState,
        //                 sendChannel
        //             ])
        //         });
        //         console.log('sendChannel:', sendChannel, 'chs:', sendChannels)
        //         const handleReceiveMessage = (event) => {
        //             const message = JSON.parse(event.data)
        //             console.log('msg REC', message)
        //             setMessages((prevState) => [
        //                 ...prevState,
        //                 message
        //             ]);
        //         }

        //         const handleReceiveChannelStatusChange = (event) => {
        //             if (this.receiveChannel) {
        //                 console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
        //             }
        //         }
        //         const receiveChannelCallback = (event) => {
        //             const receiveChannel = event.channel
        //             receiveChannel.onmessage = handleReceiveMessage
        //             receiveChannel.onopen = handleReceiveChannelStatusChange
        //             receiveChannel.onclose = handleReceiveChannelStatusChange
        //         }

        //         pc.ondatachannel = receiveChannelCallback;

        //         pc.createOffer(sdpConstraints)
        //             .then(sdp => {
        //                 pc.setLocalDescription(sdp);
        //                 console.log("current")
        //                 sendToPeer('offer', { sdp, roomId, dataFrom: userData, dataTo: currentUser });
        //             })
        //     }

        // })
        // socket.on('candidate', candidate => {
        //     // console.log('Candidates ...:', candidate)
        //     // candidates.current = [...candidates.current, candidate]
        //     pc.addIceCandidate(new RTCIceCandidate(candidate))
        // })

        // socket.on('offer', data => {
        //     const handleSendChannelStatusChange = (event) => {
        //         // console.log('sendChannel status change:', sendChannels);
        //         // console.log('send channel status: ' + sendChannels[0].readyState)
        //     }
        //     console.log('pc:', pc)
        //     const sendChannel = pc.createDataChannel('sendChannel');
        //     sendChannel.onopen = handleSendChannelStatusChange
        //     sendChannel.onclose = handleSendChannelStatusChange

        //     setSendChannels((prevState) => {
        //         console.log('preState:', [
        //             ...prevState,
        //             sendChannel
        //         ])
        //         return ([
        //             ...prevState,
        //             sendChannel
        //         ])
        //     });
        //     console.log('sendChannel:', sendChannel, 'chs:', sendChannels)
        //     const handleReceiveMessage = (event) => {
        //         const message = JSON.parse(event.data)
        //         console.log('msg REC', message)
        //         setMessages((prevState) => ([
        //             ...prevState,
        //             message
        //         ]));
        //     }

        //     const handleReceiveChannelStatusChange = (event) => {
        //         if (this.receiveChannel) {
        //             console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
        //         }
        //     }
        //     const receiveChannelCallback = (event) => {
        //         const receiveChannel = event.channel
        //         receiveChannel.onmessage = handleReceiveMessage
        //         receiveChannel.onopen = handleReceiveChannelStatusChange
        //         receiveChannel.onclose = handleReceiveChannelStatusChange
        //     }

        //     pc.ondatachannel = receiveChannelCallback;

        //     pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        //     // 2. Create Answer
        //     pc.createAnswer(sdpConstraints)
        //         .then(sdp => {
        //             pc.setLocalDescription(sdp);
        //             sendToPeer('answer', { sdp, roomId, dataFrom: userData, dataTo: currentUser });
        //         })
        // })

        // socket.on('answer', data => {
        //     pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => { })
        // })

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
        // socket.emit(eventType, payload)
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
        let message = { type: 'text', message: { id: 0, sender: { uid: 0, }, data: { text: typeText } } };
        setMessages((prevState) => {
            console.log('preState mess:', [
                ...prevState,
                message
            ])
            return ([
                ...prevState,
                message
            ])
        });
        console.log('sendCs:', sendChannels)
        sendChannels.map(sendChannel => {
            console.log('sendMessage sendChannel:', sendChannel);
            sendChannel.readyState === 'open' && sendChannel.send(JSON.stringify(message))

        })
        sendToPeer('new-message', { messages: messages, roomId, dataFrom: userData, dataTo: currentUser })
    }


    const handleSendMessage = () => {
        if (typeText) {
            console.log("typeText:", typeText)
            sendMessage(typeText);

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
                    <p className="info--state">Online </p>
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
                        sendMessage={sendMessage}
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