import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import './Chat.scss';
import ChatFrame from './ChatFrame';
import ChatVideo from './ChatVideo';
import ModalChatVideo from './ModalChatVideo';

import { detectIsCallingVideo } from './videoSlice';
import { selectCallingDetect, selectCallingUser } from './videoSlice';

const Chat = (props) => {
    let { currentUser, roomId } = props;
    const callingUserName = useSelector(selectCallingUser)
    const callingDetect = useSelector(selectCallingDetect)

    const dispatch = useDispatch()

    const typeTextRef = useRef();

    const [typeText, setTypeText] = useState('');
    const [openModalVideoCall, setOpenModalVideoCall] = useState(false);
    // console.log('Check props openVideo:', openVideo)

    const handleOpenVideoCall = (name) => {
        // console.log('openVideo:', openVideo)
        let isCalling = true;
        dispatch(detectIsCallingVideo({ name, isCalling }));
        setOpenModalVideoCall(true);
        // console.log('Name:', name)
    }
    const handleStopVideoCall = (name) => {
        // console.log('openVideo:', openVideo)
        let isCalling = false;
        dispatch(detectIsCallingVideo({ name, isCalling }));
        // console.log('Name:', name)
    }

    const handleToggleModal = () => {
        setOpenModalVideoCall(!openModalVideoCall);
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
                        {callingDetect && callingUserName ?
                            currentUser.name === callingUserName ?
                                "fas fa-video calling"
                                : "fas fa-video unallow"
                            : "fas fa-video"
                        }

                        onClick={() => handleOpenVideoCall(currentUser.name)}
                    ></i>
                    <i className=
                        {callingDetect && callingUserName ?
                            currentUser.name === callingUserName ?
                                "fas fa-stop"
                                : "fas fa-stop unallow"
                            : "fas fa-stop"
                        }
                        onClick={() => handleStopVideoCall(currentUser.name)}
                    ></i>
                </div>
            </div>
            <div className={callingDetect === true && currentUser.name === callingUserName ? "chat__place on-video" : "chat__place"}>
                {callingDetect === true && currentUser.name === callingUserName
                    ?
                    // <ChatVideo
                    //     roomId={roomId}
                    //     currentUser={currentUser}
                    // />
                    <ModalChatVideo
                        openModalVideoCall={openModalVideoCall}
                        handleToggleModal={handleToggleModal}
                        roomId={roomId}
                        currentUser={currentUser}
                    />
                    :
                    <ChatFrame />
                }
            </div>
            {callingDetect === true && currentUser.name === callingUserName
                ?
                <div></div>
                :
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
            }

        </div>
    )

    return content;
}

export default Chat;