import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap';
import io from "socket.io-client"
// import './ChatVideo.scss';
import { useCallingVideoMutation, useRejectCallingVideoMutation } from './roomApiSlice';
import { selectCallingDetect, selectCallingUser, selectDataToDetect } from './videoSlice';
import { selectDataFromDetect } from './videoSlice';

const socket = io(
    '/webRTCPeers',
    {
        path: '/webrtc',
    }
)

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
        openModalVideoCall,
        handleToggleModal,
        roomId,
        currentUser,
    } = props;
    const pc = useRef(new RTCPeerConnection(pc_config));
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const userData = useSelector(selectDataFromDetect);

    const [mute, setMute] = useState(false);
    const [video, setVideo] = useState(true);
    const [successfulIceConnection, setSuccessfulIceConnection] = useState(false);
    const [offerVisible, setOfferVisible] = useState(true)
    const [answerVisible, setAnswerVisible] = useState(false)
    const [setUpState, setSetUpState] = useState(false);

    useEffect(() => {
        socket.on('connection-success', success => {
            console.log('Success:', success)
        })
        socket.on('sdp', data => {
            console.log('Data:', data)
            pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
            // setDataCall(data)
            // console.log('dataCall:', dataCall)
            if (data.sdp.type === 'offer') {
                setOfferVisible(false)
                setAnswerVisible(true)
            } else if (data.sdp.type === 'answer') {
            }
        })
        socket.on('candidate', candidate => {
            console.log('Candidates ...:', candidate)
            // candidates.current = [...candidates.current, candidate]
            pc.current.addIceCandidate(new RTCIceCandidate(candidate))
        })
        socket.on('close', data => {
            console.log('Close -data: ', data);
            if (pc.current) {
                pc.current.close();
            }

            setTimeout(() => {
                handleToggleModal();
            }, 2000);
        })
        const constraints = {
            audio: true,
            video: true
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                localVideoRef.current.srcObject = stream
                console.log('Stream:', stream);
                console.log('Track:', stream.getTracks())
                console.log('_pc before:', _pc)
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
            console.log("oniceconnectionstatechange: ", e)
        }
        _pc.ontrack = (e) => {
            console.log("ontrack: ", e)
            remoteVideoRef.current.srcObject = e.streams[0]
            console.log("Remove Ref:", remoteVideoRef)
        }

        pc.current = _pc;
        console.log('PC:', pc)

        // setTimeout(() => {

        // }, 2000)

    }, []);

    useEffect(() => {
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
        pc.current.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            //send the sdp to the server
            processSDP(sdp);
            setOfferVisible(false)
        }).catch(e => console.log('createOffer Error...', e))
    }
    const createAnswer = () => {
        pc.current.createAnswer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            processSDP(sdp)
            setAnswerVisible(false)
        }).catch(e => console.log('createAnswer Error...', e))
    }
    // const stopVideo = async () => {
    //     let stopCalling = await rejectCallingVideo({ roomId });
    //     console.log('stopCalling:', stopCalling)
    // }

    const showHideButtons = () => {
        if (offerVisible) {
            return (
                <button onClick={createOffer}>Call</button>
            )
        } else if (answerVisible) {
            // console.log('dataCall showHide:', currentUser.name)
            return (
                <button onClick={createAnswer}>Answer</button>
            )
        }
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

    const handleStopCalling = () => {
        console.log('Stop call: ', pc);
        pc.current.close();

        sendToPeer('close', { roomId, dataFrom: userData, dataTo: currentUser })
        handleToggleModal();
    }
    return (
        <div>
            {
                console.log('Props ModalChatVideo:', props)}
            <Modal
                size="lg"
                backdrop="static"
                isOpen={openModalVideoCall}
                toggle={handleToggleModal}
            >
                <ModalHeader toggle={handleToggleModal}>
                    {currentUser.name ? `${currentUser.name}` : ``}
                </ModalHeader>
                <ModalBody>
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
                    <div className='control-box d-flex align-items-center'>
                        <div className='control-button'
                            onClick={() => { handleMute() }}
                        >
                            {mute === true
                                ? <i class="fas fa-microphone microphone-icon"></i>
                                : <i class="fas fa-microphone-slash microphone-icon"></i>
                            }
                        </div>

                        <div className='control-button  end-video'
                            onClick={() => { handleStopCalling() }}
                        >
                            <i class="fas fa-phone end-call-icon"></i>
                        </div>
                        <div className='control-button'
                            onClick={() => { handleVideo() }}
                        >
                            {video === true
                                ? <i class="fas fa-video video-icon"></i>
                                : <i class="fas fa-video-slash video-icon"></i>
                            }
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <input type="button" className="button" value="Answer"
                        onClick={() => createAnswer()}
                    />
                </ModalFooter>
            </Modal>
        </div >
    );
}

export default ModalChatVideo;