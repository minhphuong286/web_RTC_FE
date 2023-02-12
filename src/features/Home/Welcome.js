import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from "socket.io-client"
import { useNavigate, NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';

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
    const navigate = useNavigate()
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
    const [incomingUser, setIncomingUser] = useState();
    const [friendList, setFriendList] = useState([]);
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
            dispatch(detectIsCallingVideo({ name: "", isCalling: false }));
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
        socket.on('connection-success', success => {
            console.log('Success welcome: ', success)
        })
        socket.on('offer', data => {
            if (data.dataTo === user) { //user ~= phone

                setDataSDP(data);
                setIncomingUser({
                    name: data.dataFrom.name,
                    phone: data.dataFrom.phone
                });
                setOpenModalVideoCall(true);
                // console.log('Data:', dataSDP)
            }
        })
        socket.on('answer', data => {
            // console.log("answer Welcome", data);
        })
    }, [])

    const sendToPeer = (eventType, payload) => {
        socket.emit(eventType, payload)
    }

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
            setCurrentUser(item);
            setIsMobile(false);
        }

    }

    const handleToggleMobile = () => {
        setIsMobile(!isMobile);
    }

    const handleLogout = (e) => {
        e.preventDefault()
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to log out, exactly?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, log out!"
        }).then(function (isConfirm) {
            if (isConfirm.value) {
                navigate("/");
            }
        })
    }

    const content = (
        <div className="container-fluid">
            {openModalVideoCall === true && dataSDP
                && < ModalVideoCall
                    openModalVideoCall={openModalVideoCall}
                    handleToggleModal={handleToggleModal}
                    dataSDP={dataSDP}
                    incomingUser={incomingUser}
                />
            }

            <div className="row flex-nowrap main-row">

                <div className="col-1 col-lg-1 col-md-1 side-bar">
                    <div className="tool-container">
                        <div className="avatar">
                            {userData && userData.avatar
                                ?
                                <img src={userData.avatar} alt="avatar" />
                                :
                                <img src={require('../../assets/img/avatar.png')} alt="avatar" />
                            }
                        </div>
                        <div className={isMobile ? "tool-box friend-chat active" : "tool-box friend-chat"}
                            onClick={() => handleToggleMobile()}>
                            <i className="fas fa-plus"></i>
                        </div>
                        <div className='tool-box bell-notify active'>
                            <i className="far fa-comment-dots">
                                {/* <span>1</span> */}
                            </i>
                        </div>
                        <div className='tool-box contact-notify'>
                            <NavLink to={'/contact'}>
                                <i className="far fa-address-book"><span className='d-none'>N</span></i>
                            </NavLink>
                        </div>
                        <div className='tool-box logout'>
                            <NavLink to={'/'} onClick={(e) => handleLogout(e)}>
                                <i className="fas fa-sign-out-alt"></i>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className={isMobile ? "col-11 main-side open" : "col-11 main-side"} >
                    <div className={isMobile ? "col-lg-4 col-md-4 main-side__left open" : "col-lg-4 col-md-4 main-side__left"}>
                        <div className="friend-list-container">
                            <div className="search-box">
                                <span><i className="far fa-handshake"></i><i className="far fa-handshake"></i><i className="far fa-handshake"></i></span>
                            </div>
                            <div className="option-list">
                                <button className="button button-person " ><i className="fas fa-user"></i></button>
                                <button className="button button-group non-active" ><i className="fas fa-users"></i></button>
                                {/* <button className={isFriend ? "button button-person" : "button button-person non-active"}
                                        onClick={() => handleDisplayFriendList()} ><i className="fas fa-user"></i></button>
                                    <button className={isFriend ? "button button-group non-active" : "button button-group"}
                                        onClick={() => handleDisplayGroupList()} ><i className="fas fa-users"></i></button> */}
                            </div>
                            <div className="friend-list">
                                {friendList && friendList.length === 0 &&
                                    <div className="friend-list-none">
                                        <img src={require('../../assets/img/friend-none.png')} alt="friend-none" />
                                    </div>
                                }
                                {friendList && friendList.length > 0 &&
                                    friendList.map(item => {
                                        return (
                                            <div className={item.phone === currentUser.phone ? "friend-single active" : "friend-single"} key={item.id}

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
                                                    <p className="info--preview-message">{item.phone} </p>
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

                                <h1 className='welcome__title'>
                                    {
                                        userData ?
                                            <p>Welcome to <span>T29 WebRTC</span></p>
                                            :
                                            `Welcome to T29 WebRTC`
                                    }
                                </h1>
                                <h3 className='welcome__username'>Hi, {userData ? userData.name : ""}</h3>
                                <div className='welcome__intro'>

                                </div>
                                <div id="carouselExampleDark" className="carousel carousel-dark slide" data-bs-ride="carousel" style={{ height: '60vh', minHeight: '368px' }}>
                                    <div className="carousel-indicators">
                                        <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                                        <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
                                    </div>
                                    <div className="carousel-inner">
                                        {/* data-bs-interval="10000" */}
                                        <div className="carousel-item active" >
                                            <img src={require('../../assets/img/chat.png')} className="d-block w-100" alt="..." />
                                            {/* <div className="carousel-caption d-none d-md-block">
                                                <h5>First slide label</h5>
                                                <p>Some representative placeholder content for the first slide.</p>
                                            </div> */}
                                        </div>
                                        <div className="carousel-item" >
                                            <img src={require('../../assets/img/video_call.png')} className="d-block w-100" alt="..." />
                                            {/* <div className="carousel-caption d-none d-md-block">
                                                <h5>Second slide label</h5>
                                                <p>Some representative placeholder content for the second slide.</p>
                                            </div> */}
                                        </div>
                                    </div>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Previous</span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span className="visually-hidden">Next</span>
                                    </button>
                                </div>
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