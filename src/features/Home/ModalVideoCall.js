import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap';
import io from "socket.io-client";
import Swal from 'sweetalert2';
import { Howl } from 'howler';
import './ModalVideoCall.scss';
import { selectCallingDetect, selectCallingUser, selectDataToDetect, detectIsCallingVideo } from './videoSlice';

import incomingSound from '../../assets/sound/incoming.wav';

const socket = io(
    '/webRTCPeers',
    {
        path: '/webrtc'
    }
)
let pc_config = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ],
}

const ModalVideoCall = (props) => {
    const {
        openModalVideoCall,
        handleToggleModal,
        dataSDP,
        incomingUser
    } = props;
    const dispatch = useDispatch();
    const pc = useRef(new RTCPeerConnection(pc_config));
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    // const [remoted, setRemoted] = useState()
    // const [candidate, setCandidate] = useState();
    const [mute, setMute] = useState(true);
    const [video, setVideo] = useState(true);
    const [successfulIceConnection, setSuccessfulIceConnection] = useState(false);
    const [acceptCalling, setAcceptCalling] = useState(false);
    const sound = useRef(new Howl({
        src: [incomingSound],
        loop: true
    }));


    useEffect(() => {
        socket.on('candidate', candidate => {
            // console.log('Candidates Modal...:', candidate)

            // pc.current.addIceCandidate(new RTCIceCandidate(candidate))
            // candidates.current = [...candidates.current, candidate]
        })
        socket.on('close', data => {
            console.log('Close -data: ', data);
            if (pc.current) {
                pc.current.close();
            }
            dispatch(detectIsCallingVideo({ name: "", isCalling: false }));
            setTimeout(() => {
                handleToggleModal();
                Swal.fire({
                    title: '',
                    text: `${incomingUser.name} đã kết thúc cuộc gọi`,
                    icon: 'warning',
                });
            }, 2000);
        })
        const constraints = {
            audio: true,
            video: { facingMode: "user" }
        }

        const _pc = new RTCPeerConnection(pc_config);
        _pc.onicecandidate = (e) => {
            if (e.candidate) {
                // console.log(JSON.stringify(e.candidate))`
                sendToPeer('candidate', e.candidate)
            }
        }
        _pc.oniceconnectionstatechange = (e) => {
            console.log("oniceconnectionstatechange: ", e)
        }
        _pc.ontrack = (e) => {
            console.log("ontrack: ", e)
            remoteVideoRef.current.srcObject = e.streams[0]
        }
        pc.current = _pc;


        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                localVideoRef.current.srcObject = stream
                // console.log('Stream:', stream);
                // console.log('Track:', stream.getTracks())
                // console.log('_pc before:', _pc)
                stream.getTracks().forEach(track => {
                    _pc.addTrack(track, stream)
                })
            })
            .catch(e => {
                console.log('getUserMedia Error ...', e)
            })


    }, []);
    const sendToPeer = (eventType, payload) => {
        socket.emit(eventType, payload)
    }

    const processSDP = (sdp) => {
        // console.log(JSON.stringify(sdp))
        pc.current.setLocalDescription(sdp)
        sendToPeer('sdp', { sdp })
    }
    const createAnswer = () => {
        sound.current.stop();
        pc.current.setRemoteDescription(new RTCSessionDescription(dataSDP.sdp));

        pc.current.createAnswer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            pc.current.setLocalDescription(sdp)
            sendToPeer('answer', { sdp, roomId: dataSDP.roomId, dataFrom: dataSDP.dataFrom.phone, dataTo: dataSDP.dataTo })
            setSuccessfulIceConnection(true);
            setAcceptCalling(true);
        }).catch(e => console.log('createAnswer Error...', e))
    }

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
    const handleStopCalling = (type) => {
        console.log('Stop call: ', pc);
        if (type === 'stop') {
            if (pc.current) {
                pc.current.close();
            }
        }
        else if (type === 'decline') {
            // sendToPeer('close-decline', { roomId, dataFrom: userData, dataTo: currentUser })
            sound.current.stop();
            // setAcceptCalling(true);
        }
        dispatch(detectIsCallingVideo({ name: "", isCalling: false }));
        sendToPeer('close', { roomId: dataSDP.roomId, dataFrom: dataSDP.dataFrom.phone, dataTo: dataSDP.dataTo });
        setTimeout(() => {
            handleToggleModal();
        }, 500);
    }
    const soundPlayer = (start) => {
        console.log('start:', start)
        if (start === true) {
            // sound.loop = true;
            console.log('sound:', sound)
            sound.current.play();
        } else {
            sound.current.stop();
        }
    }
    useEffect(() => {
        if (acceptCalling === false) {
            // sound.loop = true;
            console.log('sound:', sound)
            sound.current.play();
        } else {
            sound.current.stop();
        }
    }, [acceptCalling])

    return (
        <div>
            {
                console.log('Props ModalVideoCall:', props)}
            <Modal
                size="lg"
                backdrop="static"
                isOpen={openModalVideoCall}
                toggle={handleToggleModal}
            >
                <ModalHeader className='modal-video-call'>
                    {incomingUser ? incomingUser.name : 'Incoming call ...'}
                </ModalHeader>
                <ModalBody className='video-call-modal-body'>
                    <video
                        className={
                            successfulIceConnection === true ? 'small-frame local-video' : 'large-frame init'
                        }
                        ref={localVideoRef} autoPlay></video>
                    <video
                        className={
                            successfulIceConnection === true ? 'large-frame remote-video' : 'small-frame remote-init'
                        }
                        ref={remoteVideoRef} autoPlay></video>
                    {/* {showHideButtons()}
                    <div>{status}</div> */}
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
                            onClick={() => { handleStopCalling('stop') }}
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
                    {/* {acceptCalling === false ? soundPlayer(true) : soundPlayer(false)} */}
                    {acceptCalling === false &&
                        <div className='incoming-notification d-flex align-items-center justify-content-evenly flex-column'>
                            <div className='incoming-notification-info'>
                                <h2 className='info-name'>{dataSDP.dataFrom.phone}</h2>
                                <p className='info-notification text-center'>Incoming video call...</p>
                            </div>
                            <div className='option-control-box d-flex'>
                                <div className='option-box'>
                                    <div className='control-button end-video'
                                        onClick={() => handleStopCalling('decline')}
                                    >
                                        <i className="fas fa-phone end-call-icon"></i>
                                    </div>
                                    <p className='option-box-description'>Decline</p>
                                </div>
                                <div className='option-box'>
                                    <div className='control-button start-video'>
                                        <i className="fas fa-video start-call-icon"
                                            onClick={() => createAnswer()}
                                        ></i>
                                    </div>
                                    <p className='option-box-description'>Accept</p>
                                </div>

                            </div>
                        </div>
                    }
                </ModalBody>
            </Modal>
        </div >
    );
}

export default ModalVideoCall;