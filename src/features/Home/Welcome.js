import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from "socket.io-client"
import { useNavigate } from 'react-router-dom'
import { NavLink, Link } from "react-router-dom"

import "../../assets/scss/common.scss";
import './Welcome.scss';

import { detectIsCallingVideo, detectDataTo, detectDataFrom } from './videoSlice';
import { selectCurrentUser, selectCurrentToken } from "../auth/authSlice"
import { selectCallingDetect, selectCallingUser, selectDataToDetect } from './videoSlice';
import { useFindUserMutation } from '../users/contactApiSlice';
import { useGetFriendListQuery } from "../friendList/friendListApiSlice";
import { useCreateRoomMutation } from './roomApiSlice';

import Chat from './Chat';
import ModalVideoCall from './ModalVideoCall';


const socket = io(
    '/webRTCPeers',
    {
        path: '/webrtc'
    }
)

const Welcome = () => {
    const dispatch = useDispatch()

    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)
    const callingUser = useSelector(selectCallingUser)
    const callingDetect = useSelector(selectCallingDetect)
    const [findUser] = useFindUserMutation();
    const { data: friendListData } = useGetFriendListQuery();
    const [createRoom] = useCreateRoomMutation();

    let [userData, setUserData] = useState();
    let [dataSDP, setDataSDP] = useState();
    let [currentUser, setCurrentUser] = useState('');
    let [currentId, setCurrentId] = useState('');
    let [roomId, setRoomId] = useState('');
    const [openModalVideoCall, setOpenModalVideoCall] = useState(false);

    useEffect(async () => {
        if (user && token) {
            let userData = await findUser({ search: user });
            setUserData(userData.data.data[0]);
            dispatch(detectDataFrom({ dataFrom: userData.data.data[0] }));
        }
    }, [])

    let friendList = [];

    if (friendListData) {
        friendList = friendListData.data.data;
        // console.log('friendList:', friendList)
    }

    useEffect(() => {
        socket.on('info-socket', info => {
            console.log('Info socket:', info)
        })
        socket.on('connection-success', success => {
            console.log('Success welcome: ', success)
        })
        socket.on('sdp', data => {
            if (data.sdp.type === 'offer') {
                if (data.dataTo.phone === user) {
                    setOpenModalVideoCall(true);
                    setDataSDP(data);
                    console.log('Data:', dataSDP)
                }
            }
        })
    }, [])
    const handleToggleModal = () => {
        setOpenModalVideoCall(!openModalVideoCall);
    }

    const handleChatWithFriend = async (item) => {
        // console.log('From handleChatWithFriend:', item)
        let phone = item.phone;
        let createdRoom = await createRoom({ phone });
        let createedRoomData = createdRoom.data.data;
        // console.log('createRoom:', createdRoom.data.data);
        let roomId = createedRoomData.id;
        // console.log('check roomId:', roomId)
        if (roomId) {
            setRoomId(roomId);
            setCurrentUser(item)
            setCurrentId(item.id)
        }
    }
    const content = (
        <div className="container-fluid">
            {openModalVideoCall === true && dataSDP
                && < ModalVideoCall
                    openModalVideoCall={openModalVideoCall}
                    handleToggleModal={handleToggleModal}
                    dataSDP={dataSDP}
                />
            }

            <div className="row">
                <div className="col-lg-1 col-md-1">
                    <div className="tool-container">
                        <div className="avatar">
                            <img src={require('../../assets/img/avatar.png')} alt="avatar" />
                        </div>
                        <div className='bell-notify active'>
                            <i className="far fa-comment-dots">
                                {/* <span>1</span> */}
                            </i>
                        </div>
                        <div className='contact-notify'>
                            <NavLink to={'/contact'}>
                                <i className="far fa-address-book"><span>N</span></i>
                            </NavLink>
                        </div>
                        <div className='logout'>
                            <NavLink to={'/'}>
                                <i className="fas fa-sign-out-alt"></i>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-4">
                    <div className="friend-list-container">
                        <div className="search-box">

                        </div>
                        <div className="option-list">
                            <span>Option list</span>
                        </div>
                        <div className="friend list">
                            {friendList && friendList.length > 0 &&
                                friendList.map(item => {
                                    return (
                                        <div className={item.id === currentId ? "friend-single active" : "friend-single"} key={item.id}

                                            onClick={() => handleChatWithFriend(item)}
                                        >
                                            {callingDetect && callingUser ?
                                                item.name === callingUser ?
                                                    <i className="fas fa-video"></i>
                                                    : ""
                                                : ""
                                            }
                                            <div className="friend-single__avatar">
                                                <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                            </div>
                                            <div className="friend-single__info">
                                                <h4 className="info--name">{item.name}

                                                </h4>

                                                <p className="info--preview-message">{item.phone} Latest message</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="col lg-7 col-md-7" style={{ padding: "0px" }}>
                    {/* {console.log('Check Chat/Welcome:', currentUser)} */}
                    {currentUser ?
                        <Chat
                            currentUser={currentUser}
                            roomId={roomId}
                        />
                        :
                        <div className='welcome'>
                            <h1 className='welcome-title'>
                                {userData ?
                                    `Welcome ${userData.name} to RTC`
                                    : `Welcome to RTC`
                                }
                            </h1>
                        </div>
                    }

                </div>
            </div>
        </div>
    )

    return content
}
export default Welcome