import { current } from '@reduxjs/toolkit';
import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, Route, useNavigate } from "react-router-dom"
import io from "socket.io-client";
import RoomApp from '../group/RoomApp';

import './Chat.scss';
import ChatFrame from './ChatFrame';
import ModalChatVideo from './ModalChatVideo';

import { detectIsCallingVideo } from './videoSlice';
import { selectCallingDetect, selectCallingUser, selectDataFromDetect } from './videoSlice';

const pc_config = {
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

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const typeTextRef = useRef();

    let userData = useSelector(selectDataFromDetect);
    const [typeText, setTypeText] = useState('');
    const [messages, setMessages] = useState([]);
    const [sendChannels, setSendChannels] = useState([]);
    const [initPeerconnection, setInitPeerconnection] = useState(false);
    // const [peerConnections, setPeerConnections] = useState({});
    const [openModalChatVideo, setOpenModalChatVideo] = useState(false);
    const [openModalVideoCallGroup, setOpenModalVideoCallGroup] = useState(false);
    const [sdpConstraints, setSdpConstraints] = useState({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
    });
    const chatPlaceRef = useRef();
    const scrollToBottom = () => {
        const chatPlace = document.getElementById("chat-place");
        chatPlace.scrollTop = chatPlace.scrollHeight
    }

    const pc = new RTCPeerConnection(pc_config);
    pc.onicecandidate = (e) => {
        if (e.candidate) {
            // console.log(JSON.stringify(e.candidate))
            sendToPeer('candidate_chat', e.candidate)
        }
    }

    useEffect(() => {
        if (socket) {
            sendToPeer('onliner_chat', { roomId, localId: socket.id, dataFrom: userData.phone, dataTo: currentUser.phone })
        };
    }, [userData])

    useEffect(() => {

        socket.on('onliner_chat', data => {
            console.log('onliner_chat:', data);
            // setMessages(success.message);
            // if (data.messages.length > 0) {
            //     setMessages(data.messages);
            // }
            if (pc && data.dataFrom === userData.phone) {
                const handleSendChannelStatusChange = (event) => {
                    // console.log('sendChannel status change:', sendChannels);
                    // console.log('send channel status: ' + sendChannels[0].readyState)
                }
                console.log('pc:', pc)
                const sendChannel = pc.createDataChannel('sendChannel');
                console.log('ID sendChannel:', sendChannel.id);
                sendChannel.onopen = handleSendChannelStatusChange
                sendChannel.onclose = handleSendChannelStatusChange
                setSendChannels((prevState) => {
                    console.log('preState:', [
                        ...prevState,
                        sendChannel
                    ])
                    return ([
                        ...prevState,
                        sendChannel
                    ])
                });
                console.log('sendChannel:', sendChannel, 'chs:', sendChannels)
                const handleReceiveMessage = (event) => {
                    const message = JSON.parse(event.data)
                    console.log('msg REC', message)
                    setMessages((prevState) => ([
                        ...prevState,
                        message
                    ]));
                }
                const handleReceiveChannelStatusChange = (event) => {
                    // if (this.receiveChannel) {
                    //     console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
                    // }
                }
                const receiveChannelCallback = (event) => {
                    const receiveChannel = event.channel
                    receiveChannel.onmessage = handleReceiveMessage
                    receiveChannel.onopen = handleReceiveChannelStatusChange
                    receiveChannel.onclose = handleReceiveChannelStatusChange
                }
                pc.ondatachannel = receiveChannelCallback;
                pc.createOffer(sdpConstraints)
                    .then(sdp => {
                        pc.setLocalDescription(sdp);
                        sendToPeer('offer_chat', { sdp, roomId, dataFrom: userData.phone, dataTo: currentUser.phone });
                    })
            }
        })
        socket.on('candidate_chat', candidate => {
            // console.log('Candidates ...:', candidate)
            // candidates.current = [...candidates.current, candidate]
            pc.addIceCandidate(new RTCIceCandidate(candidate))
        })

        socket.on('offer_chat', data => {
            const handleSendChannelStatusChange = (event) => {
                // console.log('sendChannel status change:', sendChannels);
                // console.log('send channel status: ' + sendChannels[0].readyState)
            }
            console.log('pc:', pc)
            const sendChannel = pc.createDataChannel('sendChannel');
            sendChannel.onopen = handleSendChannelStatusChange
            sendChannel.onclose = handleSendChannelStatusChange

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
            console.log('sendChannel:', sendChannel, 'chs:', sendChannels)
            const handleReceiveMessage = (event) => {
                const message = JSON.parse(event.data);

                console.log('msg REC', message)
                setMessages((prevState) => ([
                    ...prevState,
                    message
                ]));
            }
            const handleReceiveChannelStatusChange = (event) => {
                // if (this.receiveChannel) {
                //     console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
                // }
            }
            const receiveChannelCallback = (event) => {
                const receiveChannel = event.channel
                receiveChannel.onmessage = handleReceiveMessage
                receiveChannel.onopen = handleReceiveChannelStatusChange
                receiveChannel.onclose = handleReceiveChannelStatusChange
            }
            pc.ondatachannel = receiveChannelCallback;

            pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            // 2. Create Answer
            pc.createAnswer(sdpConstraints)
                .then(sdp => {
                    pc.setLocalDescription(sdp);
                    sendToPeer('answer_chat', { sdp, roomId, dataFrom: userData.phone, dataTo: currentUser.phone });
                })
        })

        socket.on('answer_chat', data => {
            pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => { })
        })

        socket.on('close_chat', data => {
            if (socket.id === data) {
                pc.close();
            }
        })

    }, [])

    const sendToPeer = (eventType, payload) => {
        socket.emit(eventType, payload)
    }
    const handleOpenChatVideo = (name) => {
        // console.log('openVideo:', openVideo)
        let isCalling = true;
        dispatch(detectIsCallingVideo({ name, isCalling }));
        setOpenModalChatVideo(true);
        // console.log('Name:', name)
    }
    const handleOpenVideoCallGroup = (name) => {
        // console.log('openVideo:', openVideo)
        // let isCalling = true;
        // dispatch(detectIsCallingVideo({ name, isCalling }));

        setOpenModalVideoCallGroup(true);
        // console.log('Name:', name)
    }
    const handleStopVideoCall = (name) => {
        // console.log('openVideo:', openVideo)
        let isCalling = false;
        dispatch(detectIsCallingVideo({ name, isCalling }));
        // console.log('Name:', name)
    }

    const handleToggleModalChat = () => {
        setOpenModalChatVideo(!openModalChatVideo);
    }

    const handleToggleModalGroup = () => {
        console.log("Fire toggle ModalGroup")
        setOpenModalVideoCallGroup(!openModalVideoCallGroup);
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
        console.log('sendMessage, sendChannels:', sendChannels);
        console.log("sendMessage, pc:", pc);
        sendChannels.map(sendChannel => {
            // console.log('sendMessage sendChannel:', sendChannel);
            sendChannel.readyState === 'open' && sendChannel.send(JSON.stringify(msg))

        })
        sendToPeer('new-message', msg);
    }


    const handleSendMessage = () => {
        if (typeText) {
            // console.log("typeText:", typeText)
            sendMessage(typeText.trim());
            setTypeText("");
            typeTextRef.current.focus();
            scrollToBottom();
        }
    }
    const content = (
        <>
            {openModalVideoCallGroup === true &&
                <RoomApp
                    openModalVideoCallGroup={openModalVideoCallGroup}
                    handleToggleModalGroup={handleToggleModalGroup}
                    roomData={{ roomId: roomId, roomName: roomId }}
                    userData={{ phone: userData.phone, name: userData.name }}
                />
            }


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

                            onClick={() => handleOpenChatVideo(currentUser.name)}
                        ></i>
                        {/* <NavLink to={`/${roomId}`}> */}
                        <i className=
                            {callingDetect && callingUserName ?
                                currentUser.name === callingUserName ?
                                    "fas fa-object-group calling d-none"
                                    : "fas fa-object-group unallow d-none"
                                : "fas fa-object-group d-none"
                            }

                            onClick={() => handleOpenVideoCallGroup(currentUser.name)}
                        ></i>
                        {/* </NavLink> */}
                        {/* <i className=
                            {callingDetect && callingUserName ?
                                currentUser.name === callingUserName ?
                                    "fas fa-stop"
                                    : "fas fa-stop unallow"
                                : "fas fa-stop"
                            }
                            onClick={() => handleStopVideoCall(currentUser.name)}
                        ></i> */}
                    </div>
                </div>
                <div id="chat-place" className={callingDetect === true && currentUser.name === callingUserName ? "chat__place on-video" : "chat__place"}>
                    {callingDetect === true && currentUser.name === callingUserName
                        ?
                        // <ChatVideo
                        //     roomId={roomId}
                        //     currentUser={currentUser}
                        // />
                        <ModalChatVideo
                            openModalChatVideo={openModalChatVideo}
                            handleToggleModalChat={handleToggleModalChat}
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
        </>
    )

    return content;
}

export default Chat;