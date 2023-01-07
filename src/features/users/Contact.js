import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Link, NavLink } from "react-router-dom";

import { useGetUsersQuery } from "./usersApiSlice";
import { useGetFriendListQuery, useGetRequestListQuery } from "../friendList/friendListApiSlice";
import { useRefuseOrAcceptContactMutation } from "./contactApiSlice";

import '../../assets/scss/common.scss';
import "../Home/Welcome.scss";
import "./Contact.scss";

import ModalNewContact from "./ModalNewContact";


const Contact = () => {
    const { data: friendListData } = useGetFriendListQuery();
    const { data: requestListData } = useGetRequestListQuery();
    const [refuseOrAcceptContact] = useRefuseOrAcceptContactMutation();

    const [openModalAddNewContact, setOpenModalAddNewContact] = useState(false);
    const [actionId, setActionId] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [isCallingVideo, setIsCallingVideo] = useState(false);

    let content;
    let friendList = [];
    let requestList = [];

    if (friendListData) {
        friendList = friendListData.data.data;
        // console.log('friendList:', friendList)
    }

    if (requestListData) {
        requestList = requestListData.data.data;
        // console.log('requestList:', requestList)
    }

    const handleAddNewContact = () => {
        setOpenModalAddNewContact(!openModalAddNewContact);
    }

    const handleRefuseContact = async (userId) => {
        // console.log('From handleRefuseContact id:', userId)
        let res = await refuseOrAcceptContact({
            accepted: '0',
            user_two: `${userId}`
        })
        setActionId(`refuse ${userId}`);
        // console.log('res Refuse:', res)
    }

    const handleAcceptContact = async (userId) => {
        // console.log('From handleAcceptContact id:', userId)
        let res = await refuseOrAcceptContact({
            accepted: '1',
            user_two: `${userId}`
        })
        setActionId(`accept ${userId}`);
        // console.log('res Accept:', res)
    }

    const handleToggleMobile = () => {
        setIsMobile(!isMobile);
    }
    // const detectIsCallingVideo = (flag) => {
    //     setIsCallingVideo(flag);
    // }

    content = (
        <div className="container-fluid">
            <div className="row flex-nowrap main-row">
                <div className="col-1 col-lg-1 col-md-1 side-bar">
                    <div className="tool-container">
                        <div className="avatar">
                            <img src={require('../../assets/img/avatar.png')} alt="avatar" />
                        </div>
                        <div className='tool-box bell-notify'>
                            <NavLink to={'/message'}>
                                <i className="far fa-comment-dots"><span className="d-none">1</span></i>
                            </NavLink>
                        </div>
                        <div className={isMobile ? "tool-box friend-chat active" : "tool-box friend-chat"}
                            onClick={() => handleToggleMobile()}>
                            <i className="fas fa-plus"></i>
                        </div>
                        <div className='tool-box contact-notify active'>
                            <i className="far fa-address-book">
                                {/* <span>N</span> */}
                            </i>
                        </div>
                        <div className='tool-box logout'>
                            <NavLink to={'/'}>
                                <i className="fas fa-sign-out-alt"></i>
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className={isMobile ? "col-11 main-side open" : "col-11 main-side"}>
                    <div className={isMobile ? "col-lg-4 col-md-4 main-side__left open" : "col-lg-4 col-md-4 main-side__left"}>
                        <div className="friend-list-container">
                            <div className="search-box">
                                <input className="search-user" type="text" placeholder="Find user..." value="" />
                                <div className="option-contact">
                                    <button className="button" onClick={handleAddNewContact}><i className="fas fa-user-plus"></i></button>
                                    <ModalNewContact
                                        openModalAddNewContact={openModalAddNewContact}
                                        handleAddNewContact={handleAddNewContact}
                                    />
                                </div>
                            </div>
                            <div className="option-list">
                                <span className="total-list">
                                    Friend <span>({friendList.length})</span>
                                </span>

                            </div>
                            <div className="friend-list">
                                {friendList && friendList.length > 0 &&
                                    friendList.map(item => {
                                        return (
                                            <div className="friend-single" key={item.id}>
                                                <div className="friend-single__avatar">
                                                    <div className='avatar--frame'>
                                                        <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                                                    </div>
                                                </div>
                                                <div className="friend-single__info">
                                                    <h5 className="info--name">{item.name}</h5>
                                                    <p className="info--preview-message">{item.phone}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className={isMobile ? "col lg-7 col-md-7 main-side__right open" : "col lg-7 col-md-7 main-side__right"}>
                        <div className="chat-container">
                            {/* <div className="option" */}
                            <div className="row">
                                <div className="col-lg-12 col-md-12">
                                    <div className="contact-container">
                                        <h3 className="contact-list-title">Request contact ({requestList.length})</h3>
                                        <div className="contact-list">
                                            <div className="user-single" >
                                                <div className="user-single__avatar">
                                                    <img src={require('../../assets/img/friend.png')} alt="avatar-user-contact" />
                                                </div>
                                                <div className="user-single__info">
                                                    <h4 className="info--name">{`item.name`}</h4>
                                                    <p className="info--preview-message">{`item.phone`} {`item.message ? item.message : 'No message'`}</p>
                                                </div>
                                                <div className="resolve">
                                                    <input type="button" className="button" value="Accept"
                                                        onClick={() => handleAcceptContact(`item.id`)}
                                                    />
                                                    <input type="button" className="button button-refuse" value="Refuse"
                                                        onClick={() => handleRefuseContact(`item.id`)}
                                                    />
                                                </div>
                                            </div>
                                            {requestList && requestList.length > 0 &&
                                                requestList.map(item => {
                                                    return (
                                                        <div className="user-single" key={item.id}>
                                                            <div className="user-single__avatar">
                                                                <img src={require('../../assets/img/friend.png')} alt="avatar-user-contact" />
                                                            </div>
                                                            <div className="user-single__info">
                                                                <h4 className="info--name">{item.name}</h4>
                                                                <p className="info--preview-message">{item.phone} {item.message ? item.message : 'No message'}</p>
                                                            </div>
                                                            <div className="resolve">
                                                                <input type="button" className="button button-refuse" value="Refuse"
                                                                    onClick={() => handleRefuseContact(item.id)}
                                                                />
                                                                <input type="button" className="button" value="Accept"
                                                                    onClick={() => handleAcceptContact(item.id)}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        // <section className="users">
        //     <h1>Users List</h1>
        //     {console.log('check res: ', users.data, usersList.name)}
        //     {usersList.name}
        //     <Link to="/welcome">Back to Welcome</Link>
        // </section>
    )

    return content
}
export default Contact