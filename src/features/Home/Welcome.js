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
);

const Welcome = () => {


    const dispatch = useDispatch()

    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)
    const callingUser = useSelector(selectCallingUser)
    const callingDetect = useSelector(selectCallingDetect)
    const [findUser] = useFindUserMutation();
    const { data: friendListData } = useGetFriendListQuery();
    const [createRoom] = useCreateRoomMutation();

    const [userData, setUserData] = useState();
    const [dataSDP, setDataSDP] = useState();
    const [currentUser, setCurrentUser] = useState('');
    const [currentId, setCurrentId] = useState('');
    const [friendList, setFriendList] = useState();
    const [onlineList, setOnlineList] = useState([]);
    const [roomId, setRoomId] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [openModalVideoCall, setOpenModalVideoCall] = useState(false);

    useEffect(async () => {
        if (user && token) {
            let userData = await findUser({ search: user });
            setUserData(userData.data.data[0]);
            dispatch(detectDataFrom({ dataFrom: userData.data.data[0] }));
        }
    }, [])

    useEffect(() => {
        if (friendListData) {
            const _friendList = friendListData.data.data;
            setFriendList(_friendList);
        }
    }, [friendListData])
    // console.log("socket", socket)
    useEffect(() => {
        if (socket) { sendToPeer("onliner", { localId: socket.id, dataFrom: user }); }
        socket.on('onliner', data => {
            console.log("data - onliner - welcome:", data);
            let newOnlineList = data.map(item => item.dataFrom);
            setOnlineList(newOnlineList);
        })
        socket.on('init', data => {
            console.log("init2 socket:", data);
        })
        socket.on('connection-success', success => {
            console.log('Success welcome: ', success)
        })
        socket.on('offer', data => {
            if (data.dataTo === user) { //user ~= phone
                setOpenModalVideoCall(true);
                setDataSDP(data);
                // console.log('Data:', dataSDP)
            }
        })
        socket.on('answer', data => {
            console.log("answer Welcome", data);
        })
    }, [])
    const handleToggleModal = () => {
        setOpenModalVideoCall(!openModalVideoCall);
    }

    const handleChatWithFriend = async (item) => {
        console.log('From handleChatWithFriend:', item)
        let phone = item.phone;
        let createdRoom = await createRoom({ phone });
        let createedRoomData = createdRoom.data.data;
        // console.log('createRoom:', createdRoom.data.data);
        let roomId = createedRoomData.id;
        // console.log('check roomId:', roomId)
        if (roomId) {
            setRoomId(roomId);
            setCurrentUser(item);
            setCurrentId(item.id);
            setIsMobile(false);
        }

    }

    const handleToggleMobile = () => {
        setIsMobile(!isMobile);
    }

    const sendToPeer = (eventType, payload) => {
        socket.emit(eventType, payload)
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

            <div className="row flex-nowrap main-row">

                <div className="col-1 col-lg-1 col-md-1 side-bar">
                    <div className="tool-container">
                        <div className="avatar">
                            <img src={require('../../assets/img/avatar.png')} alt="avatar" />
                        </div>
                        <div className='tool-box friend-chat' onClick={() => handleToggleMobile()}>
                            <i className="far fa-comments"></i>
                        </div>
                        <div className='tool-box bell-notify active'>
                            <i className="far fa-comment-dots">
                                {/* <span>1</span> */}
                            </i>
                        </div>
                        <div className='tool-box contact-notify'>
                            <NavLink to={'/contact'}>
                                <i className="far fa-address-book"><span>N</span></i>
                            </NavLink>
                        </div>
                        <div className='tool-box logout'>
                            <NavLink to={'/'}>
                                <i className="fas fa-sign-out-alt"></i>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className={isMobile ? "col-11 main-side open" : "col-11 main-side"} >
                    <div className={isMobile ? "col-lg-4 col-md-4 main-side__left open" : "col-lg-4 col-md-4 main-side__left"}>
                        <div className="friend-list-container">
                            <div className="search-box">

                            </div>
                            <div className="option-list">
                                <span><i class="far fa-handshake"></i><i class="far fa-handshake"></i><i class="far fa-handshake"></i></span>
                            </div>
                            <div className="friend-list">
                                {friendList && friendList.length > 0 &&
                                    friendList.map(item => {
                                        return (
                                            <div className={item.id === currentId ? "friend-single active" : "friend-single"} key={item.id}

                                                onClick={() => handleChatWithFriend({ phone: item.phone, name: item.name, avatar: item.avatar })}
                                            >
                                                {callingDetect && callingUser ?
                                                    item.name === callingUser ?
                                                        <i className="fas fa-video"></i>
                                                        : ""
                                                    : ""
                                                }
                                                <div className="friend-single__avatar">
                                                    <div className='avatar--frame'>
                                                        <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                                        <span className={onlineList.includes(item.phone) ? 'status' : ''}></span>
                                                    </div>
                                                </div>
                                                <div className="friend-single__info">
                                                    <h4 className="info--name">{item.name}</h4>
                                                    <p className="info--preview-message">{item.phone} Latest message</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className={isMobile ? "col lg-7 col-md-7 main-side__right open" : "col lg-7 col-md-7 main-side__right"}>
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
        </div>
    )

    return content
}
export default Welcome