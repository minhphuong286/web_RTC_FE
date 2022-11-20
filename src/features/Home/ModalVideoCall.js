import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap';
import './ModalVideoCall.scss';
import { selectCallingDetect, selectCallingUser, selectDataToDetect } from './videoSlice';
import io from "socket.io-client"
const socket = io(
    '/webRTCPeers',
    {
        path: '/webrtc'
    }
)

const ModalVideoCall = (props) => {
    const {
        openModalVideoCall,
        handleToggleModal,
        dataSDP
    } = props;
    const pc = useRef(new RTCPeerConnection(null));
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const textRef = useRef(JSON.stringify(dataSDP.sdp));
    // const [remoted, setRemoted] = useState()
    // const [candidate, setCandidate] = useState();
    const [mute, setMute] = useState(false);
    const [video, setVideo] = useState(true);
    const [successfulIceConnection, setSuccessfulIceConnection] = useState(false);
    const [acceptCalling, setAcceptCalling] = useState(false);

    useEffect(() => {
        socket.on('candidate', candidate => {
            console.log('Candidates Modal...:', candidate)
            console.log('PC:', pc)

            // pc.current.addIceCandidate(new RTCIceCandidate(candidate))
            // candidates.current = [...candidates.current, candidate]
        })
        const constraints = {
            audio: false,
            video: true
        }

        const _pc = new RTCPeerConnection(null);
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
                console.log('Stream:', stream);
                console.log('Track:', stream.getTracks())
                console.log('_pc before:', _pc)
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
        pc.current.setRemoteDescription(new RTCSessionDescription(dataSDP.sdp));

        pc.current.createAnswer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            processSDP(sdp);
            setSuccessfulIceConnection(true);
            setAcceptCalling(true);
        }).catch(e => console.log('createAnswer Error...', e))
    }

    const handleMute = () => {
        setMute(!mute);
    }
    const handleVideo = () => {
        setVideo(!video);
    }
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
                <ModalHeader toggle={handleToggleModal}>
                    {dataSDP.dataFrom ? dataSDP.dataFrom.name : 'Incoming call ...'}
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
                    {/* {showHideButtons()}
                    <div>{status}</div> */}
                    <div className='control-box d-flex align-items-center'>
                        <div className='control-button'
                            onClick={() => { handleMute() }}
                        >
                            {mute === false
                                ? <i className="fas fa-microphone microphone-icon"></i>
                                : <i className="fas fa-microphone-slash microphone-icon"></i>
                            }
                        </div>

                        <div className='control-button  end-video'>
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
                    {acceptCalling === false &&
                        <div className='incoming-notification d-flex align-items-center justify-content-evenly flex-column'>
                            <div className='incoming-notification-info'>
                                <h2 className='info-name'>{dataSDP.dataFrom.name}</h2>
                                <p className='info-notification text-center'>Incoming video call...</p>
                            </div>
                            <div className='option-control-box d-flex'>
                                <div className='option-box'>
                                    <div className='control-button end-video'>
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
                    <textarea style={{
                        position: 'absolute',
                        bottom: '6rem',
                        left: 0
                    }} ref={textRef}>{JSON.stringify(dataSDP.sdp)}</textarea>
                </ModalBody>
                <ModalFooter>

                    <input type="button" className="button fas fa-phone" value="Answer"
                        onClick={() => createAnswer()}
                    />
                    {/* <input type="button" className="button" value="Accept"
                        onClick={() => createAcceptOrReject(true)}
                    />
                    <input className='button button-cancel' type="button" onClick={() => createAcceptOrReject(false)}
                        value="Reject"
                    /> */}
                </ModalFooter>
            </Modal>
        </div >
    );
}

export default ModalVideoCall;