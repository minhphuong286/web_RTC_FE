import { useRef, useState, useEffect } from 'react'
import { useSelector } from "react-redux"
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser, selectCurrentToken } from "../auth/authSlice"
import { NavLink, Link } from "react-router-dom"
import "../../assets/scss/common.scss";
import './Welcome.scss';
import { useGetFriendListQuery } from "../friendList/friendListApiSlice"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const Welcome = () => {
    const navigate = useNavigate()

    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)
    const { data: friendListData } = useGetFriendListQuery();

    console.log('check: ', user, 'token:', token)
    const welcome = user ? `Welcome ${user}!` : 'Welcome!'
    const tokenAbbr = `${token.slice(0, 9)}...`

    const typeTextRef = useRef();

    const [typeText, setTypeText] = useState('');

    // const {
    //     data: friendList,
    //     isLoading,
    //     isSuccess,
    //     isError,
    //     error
    // } = useGetFriendListQuery();
    let friendList = [];

    if (friendListData) {
        friendList = friendListData.data.data;
        console.log('friendList:', friendList)
    }

    const handleClickToContact = () => {

        navigate('/contact')
    }
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
                                        <div className="friend-single" key={item.id}>
                                            <div className="friend-single__avatar">
                                                <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                            </div>
                                            <div className="friend-single__info">
                                                <h4 className="info--name">{item.name}</h4>
                                                <p className="info--preview-message">{item.phone} Latest message</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name1</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name2</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name3</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name4</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name5</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name6</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name7</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name8</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                            <div className="friend-single">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <h4 className="info--name">Friend Name9</h4>
                                    <p className="info--preview-message">Latest message </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div className="col lg-7 col-md-7" style={{ padding: "0px" }}>
                    <div className="chat-container">
                        <div className="chat__friend">
                            <div className="chat__friend--avatar">
                                <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                            </div>
                            <div className="chat__friend--info">
                                <h4 className="info--name">Friend Name</h4>
                                <p className="info--state">Online </p>
                            </div>
                        </div>
                        <div className="chat__place">
                            <div className="friend-single ">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <p className="info--preview-message">Message by friend</p>
                                </div>

                            </div>
                            <div className="friend-single current-host">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/avatar.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <p className="info--preview-message">Message by host</p>
                                </div>

                            </div>
                            <div className="friend-single current-host">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/avatar.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <p className="info--preview-message">
                                        Message by host Message by host Message by host Message by host
                                        Message by host Message by host Message by host Message by host
                                        Message by host Message by host Message by host Message by host
                                        Message by host Message by host Message by host Message by host
                                        Message by host Message by host Message by host Message by host
                                    </p>
                                </div>

                            </div>
                            <div className="friend-single ">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <p className="info--preview-message">
                                        Message by friend Message by friend Message by friend Message by
                                        friend Message by friend Message by friend Message by friend
                                    </p>
                                </div>
                            </div>
                            <div className="friend-single ">
                                <div className="friend-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                </div>
                                <div className="friend-single__info">
                                    <p className="info--preview-message">Message by friend</p>
                                </div>

                            </div>
                        </div>
                        <div className="chat__type">
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
                </div>
            </div>
        </div>
        // <section className="welcome">
        //     <h1>{welcome}</h1>
        //     <p>Token: {tokenAbbr}</p>
        //     <p><Link to="/users">Go to the Users List</Link></p>
        // </section>
    )

    return content
}
export default Welcome