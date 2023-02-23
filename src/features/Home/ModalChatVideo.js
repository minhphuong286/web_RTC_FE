import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap';
import io from "socket.io-client";
import Swal from 'sweetalert2';
import './ModalChatVideo.scss';
import { useCallingVideoMutation, useRejectCallingVideoMutation } from './roomApiSlice';
import { selectCallingDetect, selectCallingUser, selectDataToDetect } from './videoSlice';
import { selectDataFromDetect, detectIsCallingVideo } from './videoSlice';

const socket = io(
    '/webRTCPeers',
    {
        path: '/webrtc',
    }
);

let pc_config = null;
pc_config = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ],
}

const ModalChatVideo = (props) => {
    const {
        openModalChatVideo,
        handleToggleModalChat,
        roomId,
        currentUser,
    } = props;


    const dispatch = useDispatch();
    const pc = useRef(new RTCPeerConnection(pc_config));
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const userData = useSelector(selectDataFromDetect);
    const sdpConstraints = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
    }
    const [mute, setMute] = useState(true);
    const [video, setVideo] = useState(true);
    const [successfulIceConnection, setSuccessfulIceConnection] = useState(false);
    const [setUpState, setSetUpState] = useState(false);


    useEffect(() => {
        //Register online 
        // if (socket) { sendToPeer("onliner", { localId: socket.id, roomId, dataFrom: userData.phone, dataTo: currentUser.phone }); }

        socket.on('connection-success', data => {
            console.log('connection-success - modal=ChatVideo:', data)
            // socketId.current = success.socketId;
            // if (socketId.current) {
            //     console.log("onliner - ", userData)
            //     sendToPeer("onliner", { socketIdFrom: socketId.current, roomId, dataFrom: userData });
            // }
        })

        socket.on('offer', data => {
            console.log('Data:', data);

            pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
        })
        socket.on('answer', data => {
            //when "answer" is in a call
            if (data.code && data.message) {
                console.log("onAnswer: code-", data.code, "message:", data.message);
                if (data.dataFrom === userData.phone) {
                    handleToggleModalChat();
                    Swal.fire({
                        title: 'Người dùng bận!',
                        text: `${currentUser.name} đang bận, vui lòng thử lại sau`,
                        icon: 'info',
                    })
                }
            } else {
                console.log("data -answer:", data, userData, currentUser);
                //check "answer" match with "offer"
                if (data.dataFrom === userData.phone && data.dataTo === currentUser.phone) {
                    pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
                }
            }

        })
        socket.on('candidate', candidate => {
            // console.log('Candidates ...:', candidate)
            // candidates.current = [...candidates.current, candidate]
            pc.current.addIceCandidate(new RTCIceCandidate(candidate))
        })
        socket.on('close', data => {
            // console.log('Close -data: ', data);
            if (pc.current) {
                pc.current.close();
            }
            dispatch(detectIsCallingVideo({ name: "", isCalling: false }));
            setTimeout(() => {
                handleToggleModalChat();
                Swal.fire({
                    title: '',
                    text: `${currentUser.name} đã kết thúc cuộc gọi`,
                    icon: 'warning',
                });
            }, 2000);
        })
        const constraints = {
            audio: true,
            video: true
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                localVideoRef.current.srcObject = stream
                // console.log('Stream:', stream);
                // console.log('Track:', stream.getTracks())
                // console.log('_pc before:', _pc)
                stream.getTracks().forEach(track => {
                    _pc.addTrack(track, stream)
                })
                setSetUpState(true);
            })
            .catch(e => {
                console.log('getUserMedia Error ...', e)
            })


        const _pc = new RTCPeerConnection(pc_config)
        _pc.onicecandidate = (e) => {
            if (e.candidate) {
                // console.log(JSON.stringify(e.candidate))
                sendToPeer('candidate', e.candidate)
            }
        }
        _pc.oniceconnectionstatechange = (e) => {
            if (e.target.iceConnectionState === "connected" && e.currentTarget.iceConnectionState === "connected") {
                sendToPeer("incall", { roomId, dataFrom: userData.phone, dataTo: currentUser.phone })
            }
        }
        _pc.ontrack = (e) => {
            // console.log("ontrack: ", e)
            remoteVideoRef.current.srcObject = e.streams[0]
            // console.log("Remove Ref:", remoteVideoRef)
        }

        pc.current = _pc;
        console.log('PC:', pc)

        // setTimeout(() => {

        // }, 2000)

    }, []);

    useEffect(() => {
        console.log("socket - modalChatVideo:", socket);
        if (setUpState === true) {
            createOffer();
        }

    }, [setUpState]);

    const sendToPeer = (eventType, payload) => {
        socket.emit(eventType, payload)
    }

    const processSDP = (sdp) => {
        // console.log(JSON.stringify(sdp))
        pc.current.setLocalDescription(sdp)
        sendToPeer('sdp', { sdp, roomId, dataFrom: userData, dataTo: currentUser })
    }

    const createOffer = () => {
        pc.current.createOffer(sdpConstraints)
            .then(sdp => {
                //send the sdp to the server
                pc.current.setLocalDescription(sdp);
                sendToPeer('offer', { sdp, roomId, localId: socket.id, dataFrom: { phone: userData.phone, name: userData.name }, dataTo: currentUser.phone });
            }).catch(e => console.log('createOffer Error...', e))
    }
    const createAnswer = () => {
        pc.current.createAnswer(sdpConstraints)
            .then(sdp => {
                pc.current.setLocalDescription(sdp);
                sendToPeer('answer', { sdp, roomId, dataFrom: userData.phone, dataTo: currentUser.phone });
            }).catch(e => console.log('createAnswer Error...', e))
    }
    // const stopVideo = async () => {
    //     let stopCalling = await rejectCallingVideo({ roomId });
    //     console.log('stopCalling:', stopCalling)
    // }

    const handleMute = () => {
        const stream = localVideoRef.current.srcObject.getTracks().filter(track => track.kind === 'audio');
        console.log('stream 0:', stream)
        if (stream) {
            stream[0].enabled = !mute;
            setMute(!mute);
        }
    }
    const handleVideo = () => {
        const stream = localVideoRef.current.srcObject.getTracks().filter(track => track.kind === 'video');
        console.log('stream 1:', stream)
        if (stream) {
            stream[0].enabled = !video;
            setVideo(!video);
        }
    }

    const handleStopCalling = () => {
        console.log('Stop call: ', pc);
        pc.current.close();
        dispatch(detectIsCallingVideo({ name: "", isCalling: false }));
        sendToPeer('close', { roomId, dataFrom: userData.phone, dataTo: currentUser.phone });
        setTimeout(() => {
            handleToggleModalChat();
        }, 500);
    }
    return (
        <div>
            {
                console.log('Props ModalChatVideo:', props)}
            <Modal
                size="lg"
                backdrop="static"
                isOpen={openModalChatVideo}
                toggle={handleToggleModalChat}
            >
                <ModalHeader className='modal-chat-video'>
                    {currentUser.name ? `${currentUser.name}` : ``}
                </ModalHeader>
                <ModalBody className='chat-video-modal-body'>
                    <video
                        className={
                            // successfulIceConnection === true ? 'small-frame local-video' : 'large-frame init'
                            successfulIceConnection === true ? 'small-frame' : 'small-frame'
                        }
                        ref={localVideoRef} autoPlay></video>
                    <video
                        className={
                            // successfulIceConnection === true ? 'large-frame remote-video' : 'small-frame remote-init'
                            successfulIceConnection === true ? 'large-frame' : 'large-frame'
                        }
                        ref={remoteVideoRef} autoPlay></video>
                    <div className='control-box d-flex align-items-center'>
                        <div className='control-button'
                            onClick={() => { handleMute() }}
                        >
                            {mute === true
                                ? <i className="fas fa-microphone microphone-icon"></i>
                                : <i className="fas fa-microphone-slash microphone-icon"></i>
                            }
                        </div>

                        <div className='control-button  end-video'
                            onClick={() => { handleStopCalling() }}
                        >
                            <i className="fas fa-phone end-call-icon"></i>
                        </div>
                        <div className='control-button'
                            onClick={() => { handleVideo() }}
                        >
                            {video === true
                                ? <i className="fas fa-video video-icon"></i>
                                : <i className="fas fa-video-slash video-icon"></i>
                            }
                        </div>
                    </div>
                </ModalBody>
                {/* <ModalFooter>
                    <input type="button" className="button" value="Answer"
                        onClick={() => createAnswer()}
                    />
                </ModalFooter> */}
            </Modal>
        </div >
    );
}

export default ModalChatVideo;