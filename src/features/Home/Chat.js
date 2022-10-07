import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import './Chat.scss';
import ChatFrame from './ChatFrame';
import ChatVideo from './ChatVideo';

import { detectIsCallingVideo } from './videoSlice';
import { selectCallingDetect, selectCallingUser } from './videoSlice';

const Chat = (props) => {
    let { currentUser } = props;
    const callingUser = useSelector(selectCallingUser)
    const callingDetect = useSelector(selectCallingDetect)

    const dispatch = useDispatch()

    const typeTextRef = useRef();
    const isVideoRef = useRef(false)

    const [typeText, setTypeText] = useState('');
    const [openVideo, setOpenVideo] = useState(false);
    const [openCamera, setOpenCamera] = useState(true);

    console.log('Check props openVideo:', openVideo)

    const handleOpenVideoCall = (name) => {
        console.log('openVideo:', openVideo)
        let isCalling = true;
        setOpenVideo(isCalling);
        dispatch(detectIsCallingVideo({ name, isCalling }));
        console.log('Name:', name)
    }
    const handleStopVideoCall = (name) => {
        console.log('openVideo:', openVideo)
        let isCalling = false;
        setOpenVideo(isCalling);
        dispatch(detectIsCallingVideo({ name, isCalling }));
        console.log('Name:', name)
    }
    const content = (
        <div className="chat-container">
            <div className="chat__friend">
                <div className="chat__friend--avatar">
                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                </div>
                <div className="chat__friend--info">
                    <h4 className="info--name">{currentUser.name}</h4>
                    <p className="info--state">Online </p>
                </div>
                <div className='chat__friend--video'>
                    <i className=
                        {callingDetect && callingUser ?
                            currentUser.name === callingUser ?
                                "fas fa-video calling"
                                : "fas fa-video unallow"
                            : "fas fa-video"
                        }

                        onClick={() => handleOpenVideoCall(currentUser.name)}
                    ></i>
                    <i className=
                        {callingDetect && callingUser ?
                            currentUser.name === callingUser ?
                                "fas fa-stop"
                                : "fas fa-stop unallow"
                            : "fas fa-stop"
                        }
                        onClick={() => handleStopVideoCall(currentUser.name)}
                    ></i>
                </div>
            </div>
            <div className="chat__place">
                {openVideo === true && currentUser.name === callingUser
                    ?
                    <ChatVideo

                    />
                    :
                    <ChatFrame />
                }


            </div>
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
                        <input type="button" className='button' id='button-send' value="Send" />
                    </div>
                </div>

            </div>
        </div>
    )

    return content;
}

export default Chat;