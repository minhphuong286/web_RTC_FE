import { useRef, useState, useEffect } from 'react'
import { useSelector } from "react-redux"
import { useNavigate } from 'react-router-dom'
import { NavLink, Link } from "react-router-dom"

import "../../assets/scss/common.scss";
import './Welcome.scss';

import { selectCurrentUser, selectCurrentToken } from "../auth/authSlice"
import { selectCallingDetect, selectCallingUser } from './videoSlice';
import { useGetFriendListQuery } from "../friendList/friendListApiSlice"

import Chat from './Chat';


const Welcome = () => {
    const navigate = useNavigate()

    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)
    const callingUser = useSelector(selectCallingUser)
    const callingDetect = useSelector(selectCallingDetect)
    const { data: friendListData } = useGetFriendListQuery();

    console.log('check: ', user, 'token:', token)
    const welcome = user ? `Welcome ${user}!` : 'Welcome!'
    const tokenAbbr = `${token.slice(0, 9)}...`

    let [currentUser, setCurrentUser] = useState('');
    let [currentId, setCurrentId] = useState('');
    let [isCallingVideo, setIsCallingVideo] = useState(false);

    let friendList = [];

    if (friendListData) {
        friendList = friendListData.data.data;
        console.log('friendList:', friendList)
    }

    const handleChatWithFriend = (item) => {
        console.log('From handleChatWithFriend:', item)
        setCurrentUser(item)
        setCurrentId(item.id)
    }
    console.log('Check calling:', callingUser, callingDetect)
    // const detectIsCallingVideo = (flag) => {
    //     setIsCallingVideo(flag);
    // }
    const content = (
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-1 col-md-1">
                    <div className="tool-container">
                        <div className="avatar">
                            <img src={require('../../assets/img/avatar.png')} alt="avatar" />
                        </div>
                        <div className='bell-notify active'>
                            <i class="far fa-comment-dots">
                                {/* <span>1</span> */}
                            </i>
                        </div>
                        <div className='contact-notify'>
                            <NavLink activeClassName='active' to={'/contact'}>
                                <i class="far fa-address-book"><span>N</span></i>
                            </NavLink>
                        </div>
                        <div className='logout'>
                            <NavLink to={'/'}>
                                <i class="fas fa-sign-out-alt"></i>
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
                    {currentUser ?
                        <Chat
                            currentUser={currentUser}
                        />
                        :
                        <div className='welcome'>
                            <h1 className='welcome-title'>Welcome to RTC</h1>
                        </div>
                    }

                </div>
            </div>
        </div>
    )

    return content
}
export default Welcome