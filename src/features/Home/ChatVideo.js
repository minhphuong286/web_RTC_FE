import { useRef, useState, useEffect } from 'react';
import Peer from "simple-peer"
import io from "socket.io-client"
import './ChatVideo.scss';
// const socket = io.connect('http://localhost:5000')


const ChatVideo = () => {

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pc = useRef(new RTCPeerConnection(null));
    const textRef = useRef();

    useEffect(() => {
        const constraints = {
            audio: false,
            video: true,
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                localVideoRef.current.srcObject = stream

                stream.getTracks().forEach(track => {
                    _pc.addTrack(track, stream)
                })
            })
            .catch(e => {
                console.log('getUserMedia Error:', e);
            })

        const _pc = new RTCPeerConnection(null)
        _pc.onicecandidate = (e) => {
            if (e.candidate) {
                console.log(JSON.stringify(e.candidate))
            }
        }
        _pc.oniceconnectionstatechange = (e) => {
            console.log('stateChange:', e)
        }

        _pc.ontrack = (e) => {
            //got remote stream

            remoteVideoRef.current.srcObject = e.streams[0]
        }

        pc.current = _pc;
    }, [])

    const createOffer = () => {
        pc.current.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }).then(sdp => {
            console.log(JSON.stringify(sdp))
            pc.current.setLocalDescription(sdp)
        }).catch(e => console.log('createOffer error:', e))
    }

    const createAnswer = () => {
        pc.current.createAnswer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }).then(sdp => {
            console.log(JSON.stringify(sdp))
            pc.current.setLocalDescription(sdp)
        }).catch(e => console.log('createAnswer error:', e))
    }

    const setRemoteDescription = () => {
        const sdp = JSON.parse(textRef.current.value)
        console.log('setRemoteDescription sdp:', sdp)

        pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
    }

    const addCandidate = () => {
        const candidate = JSON.parse(textRef.current.value)
        console.log('addCandidate...', candidate)

        pc.current.addIceCandidate(new RTCIceCandidate(candidate))

    }
    const content = (
        <>
            <div>
                <video playsInline ref={localVideoRef} autoPlay style={{ width: 200, height: 200, margin: 5, backgroundColor: 'black' }} />
                <video playsInline ref={remoteVideoRef} autoPlay style={{ width: 200, height: 200, margin: 5, backgroundColor: 'black' }} />
            </div>
            <div>
                <button onClick={() => createOffer()}>Create Offer</button>
                <button onClick={() => createAnswer()}>Create Answer</button>
                <br></br>
                <textarea ref={textRef}></textarea>
                <button onClick={() => setRemoteDescription()}>Set remote Des</button>
                <button onClick={() => addCandidate()}>Add candidates</button>

            </div>
        </>
    )

    return content;
}
export default ChatVideo;