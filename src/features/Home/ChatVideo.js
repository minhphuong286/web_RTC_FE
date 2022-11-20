import { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Peer from "simple-peer"
import io from "socket.io-client"
import './ChatVideo.scss';
import { useCallingVideoMutation, useRejectCallingVideoMutation } from './roomApiSlice';
import { selectCallingDetect, selectCallingUser, selectDataToDetect } from './videoSlice';
import { selectDataFromDetect } from './videoSlice';
// const socket = io.connect('http://localhost:6001')
const socket = io(
    '/webRTCPeers',
    {
        path: '/webrtc'
    }
)

const ChatVideo = (props) => {
    let { roomId, currentUser } = props;
    const [callingVideo] = useCallingVideoMutation();
    const [rejectCallingVideo] = useRejectCallingVideoMutation();
    const userData = useSelector(selectDataFromDetect);
    const callingDetect = useSelector(selectCallingDetect)

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pc = useRef(new RTCPeerConnection(null));
    const textRef = useRef();

    const [offerVisible, setOfferVisible] = useState(true)
    const [answerVisible, setAnswerVisible] = useState(false)
    const [status, setStatus] = useState('Make a call now')
    const [dataCall, setDataCall] = useState();
    const [mute, setMute] = useState(false);
    const [video, setVideo] = useState(true);
    const [setUpState, setSetUpState] = useState(false);
    const [successfulIceConnection, setSuccessfulIceConnection] = useState(false);

    useEffect(() => {
        socket.on('connection-success', success => {
            console.log('Success:', success)
        })
        socket.on('sdp', data => {
            console.log('Data:', data)
            textRef.current.value = JSON.stringify(data.sdp)
            pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
            // setDataCall(data)
            // console.log('dataCall:', dataCall)
            if (data.sdp.type === 'offer') {
                setOfferVisible(false)
                setAnswerVisible(true)
                setStatus('Incoming call ...')
            } else if (data.sdp.type === 'answer') {
                setStatus('Call established')
            }
        })
        socket.on('candidate', candidate => {
            console.log('Candidates ...:', candidate)
            // candidates.current = [...candidates.current, candidate]
            pc.current.addIceCandidate(new RTCIceCandidate(candidate))
        })
        const constraints = {
            audio: false,
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

        const _pc = new RTCPeerConnection(null)
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
            setStatus('Calling...')
        }).catch(e => console.log('createOffer Error...', e))
    }
    const createAnswer = () => {
        pc.current.createAnswer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        }).then(sdp => {
            processSDP(sdp)
            setAnswerVisible(false)
            setStatus('Call established')
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
        setMute(!mute);
    }
    const handleVideo = () => {
        setVideo(!video);
    }
    const content = (
        <>
            {/* <div>
                <video playsInline ref={localVideoRef} autoPlay style={{ width: 200, height: 200, margin: 5, backgroundColor: 'black' }} />
                <video playsInline ref={remoteVideoRef} autoPlay style={{ width: 200, height: 200, margin: 5, backgroundColor: 'black' }} />
            </div>
            <div>
                <button onClick={() => stopVideo()}>Stop</button>
            </div> */}
            <video
                className='large-frame'
                ref={localVideoRef} autoPlay></video>
            <video
                className='small-frame'
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
            <div className='controllCalling'>
                {showHideButtons()}
            </div>

            <div>{status}</div>
            <textarea ref={textRef}></textarea>
        </>
    )

    return content;
}
export default ChatVideo;