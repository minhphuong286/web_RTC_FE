import React, { Component } from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap';
// import './styles.css';
import './RoomApp.scss';
import Video from './Video'
import Videos from './Videos'

import Chat from './Chat'

import Draggable from './Draggable'
import { detectIsCallingVideo } from '../Home/videoSlice';
import { useGetGroupListQuery } from "../users/groupApiSlice";

class RoomApp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      localStream: null,    // used to hold local stream object to avoid recreating the stream everytime a new offer comes
      remoteStream: null,    // used to hold remote stream object that is displayed in the main screen

      remoteStreams: [],    // holds all Video Streams (all remote streams)
      peerConnections: {},  // holds all Peer Connections
      selectedVideo: null,

      status: 'Please wait...',

      pc_config: {
        "iceServers": [
          {
            urls: 'stun:stun.l.google.com:19302'
          }
        ]
      },

      sdpConstraints: {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      },

      messages: [],
      sendChannels: [],
      disconnected: false,
      memberNumber: 0
    }

    // DONT FORGET TO CHANGE TO YOUR URL
    // this.serviceIP = '/webrtcPeerGroup'

    // https://reactjs.org/docs/refs-and-the-dom.html
    // this.localVideoref = React.createRef()
    // this.remoteVideoref = React.createRef()

    this.socketGroup = null
    // this.candidates = []


  }

  getLocalStream = () => {
    // called when getUserMedia() successfully returns - see below
    // getUserMedia() returns a MediaStream object (https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
    const success = (stream) => {
      window.localStream = stream
      // this.localVideoref.current.srcObject = stream
      // this.pc.addStream(stream);
      this.setState({
        localStream: stream
      })

      this.whoisOnline()
    }

    // called when getUserMedia() fails - see below
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // see the above link for more constraint options
    const constraints = {
      audio: true,
      video: true,
      // video: {
      //   width: 1280,
      //   height: 720
      // },
      // video: {
      //   width: { min: 1280 },
      // }
      options: {
        mirror: true,
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    navigator.mediaDevices.getUserMedia(constraints)
      .then(success)
      .catch(failure)
  }

  whoisOnline = () => {
    // let all peers know I am joining
    this.sendToPeer('onlinePeers-group', null, { local: this.socketGroup.id })
  }

  sendToPeer = (messageType, payload, socketID) => {
    this.socketGroup.emit(messageType, {
      socketID,
      payload
    })
  }

  createPeerConnection = (socketID, callback) => {

    try {
      let pc = new RTCPeerConnection(this.state.pc_config)

      // add pc to peerConnections object
      const peerConnections = { ...this.state.peerConnections, [socketID]: pc }
      this.setState({
        peerConnections
      })

      pc.onicecandidate = (e) => {
        console.log("onicecandidate:", e)
        if (e.candidate) {
          this.sendToPeer('candidate-group', e.candidate, {
            local: this.socketGroup.id,
            remote: socketID
          })
        }
      }

      pc.oniceconnectionstatechange = (e) => {
        // if (pc.iceConnectionState === 'disconnected') {
        //   const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== socketID)

        //   this.setState({
        //     remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
        //   })
        // }

      }

      pc.ontrack = (e) => {

        let _remoteStream = null
        let remoteStreams = this.state.remoteStreams
        let remoteVideo = {}


        // 1. check if stream already exists in remoteStreams
        const rVideos = this.state.remoteStreams.filter(stream => stream.id === socketID)

        // 2. if it does exist then add track
        if (rVideos.length) {
          _remoteStream = rVideos[0].stream
          _remoteStream.addTrack(e.track, _remoteStream)
          remoteVideo = {
            ...rVideos[0],
            stream: _remoteStream,
          }
          remoteStreams = this.state.remoteStreams.map(_remoteVideo => {
            return _remoteVideo.id === remoteVideo.id && remoteVideo || _remoteVideo
          })
        } else {
          // 3. if not, then create new stream and add track
          _remoteStream = new MediaStream()
          _remoteStream.addTrack(e.track, _remoteStream)

          remoteVideo = {
            id: socketID,
            name: socketID,
            stream: _remoteStream,
          }
          remoteStreams = [...this.state.remoteStreams, remoteVideo]
        }

        // const remoteVideo = {
        //   id: socketID,
        //   name: socketID,
        //   stream: e.streams[0]
        // }

        this.setState(prevState => {

          // If we already have a stream in display let it stay the same, otherwise use the latest stream
          // const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: e.streams[0] }
          const remoteStream = prevState.remoteStreams.length > 0 ? {} : { remoteStream: _remoteStream }

          // get currently selected video
          let selectedVideo = prevState.remoteStreams.filter(stream => stream.id === prevState.selectedVideo.id)
          // if the video is still in the list, then do nothing, otherwise set to new video stream
          selectedVideo = selectedVideo.length ? {} : { selectedVideo: remoteVideo }

          return {
            // selectedVideo: remoteVideo,
            ...selectedVideo,
            // remoteStream: e.streams[0],
            ...remoteStream,
            remoteStreams, //: [...prevState.remoteStreams, remoteVideo]
          }
        })
      }

      pc.close = () => {
        // alert('GONE')
      }

      if (this.state.localStream)
        // pc.addStream(this.state.localStream)

        this.state.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.state.localStream)
        })

      // return pc
      callback(pc)

    } catch (e) {
      console.log('Something went wrong! pc not created!!', e)
      // return;
      callback(null)
    }
  }

  componentDidMount = () => {
    console.log("Mounted")
    this.socketGroup = io(
      '/webRTCPeers',
      {
        path: '/webrtc',
        query: {
          room: this.props.roomData.roomId,
        }
      }
    )
    if (this.socketGroup) {
      this.sendToPeer(
        "reconnect-group", { roomId: this.props.roomData.roomId }
      )
    }
    this.socketGroup.on('connection-success-group', data => {

      this.getLocalStream()

      console.log("RoomApp, connection-success", data.success)
      const status = data.peerCount > 1 ? `Attendee: ${data.peerCount}` : 'Waiting for others'

      this.setState({
        status: status,
        messages: data.messages,
        memberNumber: data.peerCount
      })
    })

    this.socketGroup.on('joined-peers-group', data => {

      this.setState({
        status: data.peerCount > 1 ? `Attendee: ${data.peerCount}` : 'Waiting for others',
        memberNumber: data.peerCount
      })
    })

    this.socketGroup.on('peer-disconnected-group', data => {
      console.log('peer-disconnected-group', data)
      if (this.state.remoteStreams) {
        const remoteStreams = this.state.remoteStreams.filter(stream => stream.id !== data.socketID);
        this.setState(prevState => {
          // check if disconnected peer is the selected video and if there still connected peers, then select the first
          const selectedVideo = prevState.selectedVideo.id === data.socketID && remoteStreams.length ? { selectedVideo: remoteStreams[0] } : null

          return {
            // remoteStream: remoteStreams.length > 0 && remoteStreams[0].stream || null,
            remoteStreams,
            ...selectedVideo,
            status: data.peerCount > 1 ? `Attendee: ${data.peerCount}` : 'Waiting for others',
            memberNumber: data.peerCount
          }
        })
      }
    })

    this.socketGroup.on('online-peer-group', socketID => {
      console.log('connected peers ...', socketID)

      // create and send offer to the peer (data.socketID)
      // 1. Create new pc
      this.createPeerConnection(socketID, pc => {
        // 2. Create Offer
        if (pc) {
          console.log('PC:', pc)
          // Send Channel
          const handleSendChannelStatusChange = (event) => {
            console.log('send channel status: ' + this.state.sendChannels[0].readyState)
          }

          const sendChannel = pc.createDataChannel('sendChannel')
          sendChannel.onopen = handleSendChannelStatusChange
          sendChannel.onclose = handleSendChannelStatusChange
          console.log('Sendchs:', this.state.sendChannels)
          this.setState(prevState => {
            return {
              sendChannels: [...prevState.sendChannels, sendChannel]
            }
          })
          console.log('SendchsAfter(onliner):', this.state.sendChannels)

          // Receive Channels
          const handleReceiveMessage = (event) => {
            const message = JSON.parse(event.data)

            console.log('mess REc:', message, event);
            this.setState(prevState => {
              return {
                messages: [...prevState.messages, message]
              }
            })
          }

          const handleReceiveChannelStatusChange = (event) => {
            console.log('HandleRec', this)
            if (this.receiveChannel) {
              console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
            }
          }

          const receiveChannelCallback = (event) => {
            const receiveChannel = event.channel
            receiveChannel.onmessage = handleReceiveMessage
            receiveChannel.onopen = handleReceiveChannelStatusChange
            receiveChannel.onclose = handleReceiveChannelStatusChange
          }

          pc.ondatachannel = receiveChannelCallback


          pc.createOffer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)

              this.sendToPeer('offer-group', sdp, {
                local: this.socketGroup.id,
                remote: socketID
              })
            })
        }
      })
    })

    this.socketGroup.on('offer-group', data => {
      this.createPeerConnection(data.socketID, pc => {
        pc.addStream(this.state.localStream)

        // Send Channel
        const handleSendChannelStatusChange = (event) => {
          console.log('send channel status: ' + this.state.sendChannels[0].readyState)
        }

        const sendChannel = pc.createDataChannel('sendChannel')
        sendChannel.onopen = handleSendChannelStatusChange
        sendChannel.onclose = handleSendChannelStatusChange

        this.setState(prevState => {
          return {
            sendChannels: [...prevState.sendChannels, sendChannel]
          }
        })

        // Receive Channels
        const handleReceiveMessage = (event) => {

          const message = JSON.parse(event.data)
          console.log("msg1=======:", message, event);
          this.setState(prevState => {
            console.log('preMsg1:', prevState)
            return {
              messages: [...prevState.messages, message]
            }
          })
        }

        const handleReceiveChannelStatusChange = (event) => {
          if (this.receiveChannel) {
            console.log("receive channel's status has changed to " + this.receiveChannel.readyState);
          }
        }

        const receiveChannelCallback = (event) => {
          const receiveChannel = event.channel
          receiveChannel.onmessage = handleReceiveMessage
          receiveChannel.onopen = handleReceiveChannelStatusChange
          receiveChannel.onclose = handleReceiveChannelStatusChange
        }

        pc.ondatachannel = receiveChannelCallback

        pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          // 2. Create Answer
          pc.createAnswer(this.state.sdpConstraints)
            .then(sdp => {
              pc.setLocalDescription(sdp)

              this.sendToPeer('answer-group', sdp, {
                local: this.socketGroup.id,
                remote: data.socketID
              })
            })
        })
      })
    })

    this.socketGroup.on('answer-group', data => {
      // get remote's peerConnection
      const pc = this.state.peerConnections[data.socketID]
      console.log(data.sdp)
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => { })
    })

    this.socketGroup.on('candidate-group', (data) => {
      // get remote's peerConnection
      // console.log("candidate:", data)
      const pc = this.state.peerConnections[data.socketID]

      if (pc)
        pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    })
  }

  switchVideo = (_video) => {
    console.log(_video)
    this.setState({
      selectedVideo: _video
    })
  }

  clearRoom = () => {
    const dispatch = useDispatch();
    dispatch(detectIsCallingVideo({ name: "", isCalling: false }));
    this.socketGroup.close()
    this.state.localStream.getTracks().forEach(track => track.stop())
  }

  exitRoom = (e) => {
    // e.preventDefault();
    Swal.fire({
      title: "Rời phòng!",
      text: "Bạn thực sự muốn rời khỏi phòng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rời",
      cancelButtonText: 'Hủy',
    }).then(function (isConfirm) {
      if (isConfirm.value) {
        console.log('ENTER ExitRoom:', e)


      }

    })

    // await this.clearRoom();
    // const dispatch = useDispatch();
    // // dispatch(detectIsCallingVideo({ name: "", isCalling: false }));

    // this.socketGroup.close()
    // this.state.localStream.getTracks().forEach(track => track.stop())

    // setTimeout(() => {
    //   console.log("This props:", this.props)
    //   this.props.handleToggleModalGroup();
    // }, 1000)
  }

  render() {
    let { openModalVideoCallGroup, handleToggleModalGroup, roomData, userData, handleSaveHistory } = this.props;

    if (this.state.disconnected) {
      console.log("render state:", this.state.memberNumber)
      this.socketGroup.close()
      this.state.localStream.getTracks().forEach(track => track.stop())
      if (this.state.memberNumber === 1) {

        // let config = {
        //   headers: { Authorization: `Bearer ` }
        // }
        // // axios.post('http://127.0.0.1:8000/private-chat/list-rooms', { is_end: 1, presence_room_id: this.props.roomData.roomId })
        // //   .then(res => {
        // //     console.log("end calling video:", res)
        // //   })

        // axios.get('http://127.0.0.1:8000/private-chat/list-rooms',config)
        //   .then(res => {
        //     console.log("end calling video:", res)
        //   })
        handleSaveHistory(1, this.props.roomData.roomId);
        console.log("Need to stop",);
      }
      setTimeout(() => {
        // console.log("render:", this.props);
        handleToggleModalGroup();
      }, 1000)
      // return (<div>You have successfully Disconnected</div>)
    }

    // console.log(this.state.localStream)

    const statusText = <div style={{ color: 'yellow', padding: 5 }}>{this.state.status}</div>

    return (

      <div>
        {
          console.log('Props ModalChatVideo:', this.props)}
        <Modal
          size="lg"
          backdrop="static"
          isOpen={openModalVideoCallGroup}
          toggle={handleToggleModalGroup}
          fullscreen={true}
        >
          <ModalHeader className='modal-room-app'>
            {roomData.roomName}
          </ModalHeader>
          <ModalBody className='room-app-modal-body'>
            <Draggable style={{
              zIndex: 101,
              position: 'absolute',
              right: '1rem',
              cursor: 'move',
              background: '#6a6a22'
            }}>
              <Video
                videoStyles={{
                  // zIndex:2,
                  // position: 'absolute',
                  // right:0,
                  width: 200,
                  // height: 200,
                  // margin: 5,
                  // backgroundColor: 'black'
                }}
                frameStyle={{
                  width: 200,
                  margin: 5,
                  borderRadius: 5,
                  backgroundColor: 'black',
                }}
                showMuteControls={true}
                // ref={this.localVideoref}
                videoStream={this.state.localStream}
                autoPlay muted>
              </Video>
            </Draggable>
            <Video
              videoStyles={{
                zIndex: 1,
                position: 'fixed',
                width: `calc(100% - 2rem)`,
                height: `calc(100% - 95px)`,
                backgroundColor: 'black'
              }}
              // ref={ this.remoteVideoref }
              videoStream={this.state.selectedVideo && this.state.selectedVideo.stream}
              autoPlay>
            </Video>
            <br />
            <div style={{
              zIndex: 3,
              position: 'absolute',
              // margin: 10,
              // backgroundColor: '#cdc4ff4f',
              // padding: 10,
              // borderRadius: 5,
            }}>
              {/* onClick={(e) => { this.exitRoom(e) }} */}
              <div onClick={(e) => { this.setState({ disconnected: true }) }}>
                <i style={{ cursor: 'pointer', paddingLeft: 15, color: 'red' }} className='material-icons'>highlight_off</i>
              </div>
              <div style={{
                margin: 10,
                backgroundColor: '#cdc4ff4f',
                padding: 10,
                borderRadius: 5,
              }}>{statusText}</div>
            </div>
            <div>
              <Videos
                switchVideo={this.switchVideo}
                remoteStreams={this.state.remoteStreams}
              ></Videos>
            </div>
            <br />

            <Chat
              user={{
                uid: `${userData.name} - ${userData.phone}`
              }}
              messages={this.state.messages}
              sendMessage={(message) => {
                this.setState(prevState => {
                  console.log('preMess:', prevState)
                  return { messages: [...prevState.messages, message] }
                })
                console.log('msg After:', this.state.messages)
                console.log('sendCS:', this.state.sendChannels)
                this.state.sendChannels.map(sendChannel => {
                  console.log("sendChannel:", sendChannel)
                  sendChannel.readyState === 'open' && sendChannel.send(JSON.stringify(message))
                })
                this.sendToPeer('new-message', JSON.stringify(message), { local: this.socketGroup.id })
              }}
            />
          </ModalBody>
          {/* <ModalFooter>
                    <input type="button" className="button" value="Answer"
                        onClick={() => createAnswer()}
                    />
                </ModalFooter> */}
        </Modal>
      </div >
    )
  }
}

export default RoomApp;