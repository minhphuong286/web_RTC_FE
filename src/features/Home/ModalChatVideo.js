import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap';

const ModalChatVideo = (props) => {
    const {
        openModalVideoCall,
        handleToggleModal,
        roomId,
        currentUser,
    } = props;
    const pc = useRef(new RTCPeerConnection(null));
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const textRef = useRef();

    const [mute, setMute] = useState(false);
    const [video, setVideo] = useState(true);
    const [successfulIceConnection, setSuccessfulIceConnection] = useState(false);

    useEffect(() => {
    }, []);
    const createAnswer = () => {
        pc.current.createAnswer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            // processSDP(sdp)
            // setAnswerVisible(false)
            // setStatus('Call established')
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
                console.log('Props ModalChatVideo:', props)}
            <Modal
                size="lg"
                backdrop="static"
                isOpen={openModalVideoCall}
                toggle={handleToggleModal}
            >
                <ModalHeader toggle={handleToggleModal}>

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
                            {mute === false
                                ? <i class="fas fa-microphone microphone-icon"></i>
                                : <i class="fas fa-microphone-slash microphone-icon"></i>
                            }
                        </div>

                        <div className='control-button  end-video'>
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
                    <textarea style={{
                        position: 'absolute',
                        bottom: '6rem',
                        left: 0
                    }} ref={textRef}>{ }</textarea>
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