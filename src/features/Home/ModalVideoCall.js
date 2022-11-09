import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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
            processSDP(sdp)
        }).catch(e => console.log('createAnswer Error...', e))
    }
    return (
        <div>
            {
                console.log('Props ModalVideoCall:', props)}
            <Modal
                backdrop="static"
                isOpen={openModalVideoCall}
                toggle={handleToggleModal}
            >
                <ModalHeader toggle={handleToggleModal}>
                    {dataSDP.dataFrom ? dataSDP.dataFrom.name : 'Incomming call ...'}
                </ModalHeader>
                <ModalBody>
                    {/* <div>
                <video playsInline ref={localVideoRef} autoPlay style={{ width: 200, height: 200, margin: 5, backgroundColor: 'black' }} />
                <video playsInline ref={remoteVideoRef} autoPlay style={{ width: 200, height: 200, margin: 5, backgroundColor: 'black' }} />
            </div>
            <div>
                <button onClick={() => stopVideo()}>Stop</button>
            </div> */}
                    <video
                        style={{
                            width: 240, height: 240,
                            margin: 5, backgroundColor: 'black'
                        }}
                        ref={localVideoRef} autoPlay></video>
                    <video
                        style={{
                            width: 240, height: 240,
                            margin: 5, backgroundColor: 'black'
                        }}
                        ref={remoteVideoRef} autoPlay></video>
                    {/* {showHideButtons()}
                    <div>{status}</div> */}
                    <div></div>
                    <textarea ref={textRef}>{JSON.stringify(dataSDP.sdp)}</textarea>
                </ModalBody>
                <ModalFooter>
                    <input type="button" className="button" value="Answer"
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