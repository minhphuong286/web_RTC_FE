import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Link, NavLink } from "react-router-dom";

import { useGetUsersQuery } from "./usersApiSlice";
import { useGetFriendListQuery, useGetRequestListQuery } from "../friendList/friendListApiSlice";
import { useRefuseOrAcceptContactMutation } from "./contactApiSlice";
import { useGetGroupListQuery, useGetGroupMemberListQuery } from "../users/groupApiSlice";

import '../../assets/scss/common.scss';
import "../Home/Welcome.scss";
import "./Contact.scss";

import ModalNewContact from "./ModalNewContact";
import ModalCreateNewGroup from "./ModalCreateNewGroup";
import GroupMember from "./GroupMember";

const Contact = () => {
    const { data: friendListData } = useGetFriendListQuery();
    const { data: requestListData } = useGetRequestListQuery();
    const { data: groupListData } = useGetGroupListQuery();
    const [roomId, setRoomId] = useState('');
    const { data: memberListData } = useGetGroupMemberListQuery(
        roomId,
        { skip: roomId === '', refetchOnMountOrArgChange: true, }
    );
    const [refuseOrAcceptContact] = useRefuseOrAcceptContactMutation();

    const [openModalAddNewContact, setOpenModalAddNewContact] = useState(false);
    const [openModalAddNewGroupMember, setOpenModalAddNewGroupMember] = useState(false);
    const [openModalCreateNewGroup, setOpenModalCreateNewGroup] = useState(false);
    const [openModalVideoCallGroup, setOpenModalVideoCallGroup] = useState(false);
    const [actionId, setActionId] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [isFriend, setIsFriend] = useState(true);
    const [isCallingVideo, setIsCallingVideo] = useState(false);
    const [currentGroup, setCurrentGroup] = useState('');
    const [memberCurrentGroupList, setMemberCurrentGroupList] = useState([]);


    let content;
    let friendList = [];
    let groupList = [];
    let requestList = [];

    if (friendListData) {
        friendList = friendListData.data.data;
    }
    if (groupListData) {
        groupList = groupListData.data;
    }


    useEffect(() => {
        if (memberListData && memberListData.data.length > 0) {
            setMemberCurrentGroupList(memberListData.data);
        }
    }, [memberListData])

    if (requestListData) {
        requestList = requestListData.data.data;
    }

    const handleAddNewContact = () => {
        setOpenModalAddNewContact(!openModalAddNewContact);
    }
    const handleAddNewGroupMember = () => {
        setOpenModalAddNewGroupMember(!openModalAddNewGroupMember);
    }
    const handleCreateNewGroup = () => {
        setOpenModalCreateNewGroup(!openModalCreateNewGroup);
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
    const handleDisplayFriendList = () => {
        setIsFriend(true);
    }
    const handleDisplayGroupList = () => {
        setIsFriend(false);
    }
    const handleViewGroup = (currentGroupData) => {
        if (currentGroupData.name && currentGroupData.id) {
            setCurrentGroup(currentGroupData);
            setRoomId(currentGroupData.id);
        }
    }
    const handleOpenVideoCallGroup = (name) => {
        // console.log('openVideo:', openVideo)
        // let isCalling = true;
        // dispatch(detectIsCallingVideo({ name, isCalling }));

        // setOpenModalVideoCallGroup(true);
        console.log('Name:', name)
    }
    const updateGroupMemberList = (type, data) => {
        switch (type) {
            case "delete":
                if (memberCurrentGroupList.length > 0 && data) {
                    const memberList = memberCurrentGroupList.filter(item => item.id !== data);
                    setMemberCurrentGroupList(memberList);
                }
                break
            case "add":
                if (memberCurrentGroupList.length > 0 && data) {
                    setMemberCurrentGroupList((prevState) => [...prevState, data]);
                }
                break
            default:
                return
        }


    }
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
                                    <button className="button" ><i className="fas fa-search"></i></button>
                                    {
                                        openModalAddNewContact &&
                                        <ModalNewContact
                                            openModalAddNewContact={openModalAddNewContact}
                                            handleAddNewContact={handleAddNewContact}
                                            addNewGroupMember={false}
                                        />
                                    }
                                </div>
                            </div>
                            <div className="option-list contact">
                                <div>
                                    <button className="button" onClick={handleAddNewContact}><i className="fas fa-user-plus"></i></button>
                                    <button className="button" onClick={handleCreateNewGroup}><i className="fas fa-users-cog"></i></button>
                                </div>
                                <div className="options">
                                    <button className={isFriend ? "button button-person" : "button button-person non-active"}
                                        onClick={() => handleDisplayFriendList()} ><i className="fas fa-user"></i></button>
                                    <button className={isFriend ? "button button-group non-active" : "button button-group"}
                                        onClick={() => handleDisplayGroupList()} ><i className="fas fa-users"></i></button>
                                </div>
                                {
                                    openModalCreateNewGroup &&
                                    <ModalCreateNewGroup
                                        openModalCreateNewGroup={openModalCreateNewGroup}
                                        handleCreateNewGroup={handleCreateNewGroup}
                                    />
                                }
                                <span className="total-list">
                                    {isFriend
                                        ? <span>Friend ({friendList.length})</span>
                                        : <span>Group ({friendList.length})</span>
                                    }

                                </span>

                            </div>
                            {isFriend === true
                                ?
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
                                :
                                <div className="friend-list">
                                    {groupList && groupList.length > 0 &&
                                        groupList.map(item => {
                                            return (
                                                <div className={item.id === currentGroup.id ? "friend-single active" : "friend-single"} key={item.id}
                                                    onClick={() => handleViewGroup({ name: item.name, id: item.id })}
                                                >
                                                    <div className="friend-single__avatar">
                                                        <div className='avatar--frame'>
                                                            <img src={require('../../assets/img/group.png')} alt="avatar-friend" />
                                                        </div>
                                                    </div>
                                                    <div className="friend-single__info">
                                                        <h5 className="info--name">{item.name}</h5>
                                                        <p className="info--preview-message">{item.id}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div className={isMobile ? "col lg-7 col-md-7 main-side__right open" : "col lg-7 col-md-7 main-side__right"}>
                        <div className="chat-container">
                            {isFriend === true
                                ?
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
                                :
                                currentGroup
                                    ? <>
                                        < div className="chat__friend">
                                            <div className="chat__friend--avatar">
                                                <img src={require('../../assets/img/group.png')} alt="avatar-group" />
                                            </div>
                                            <div className="chat__friend--info">
                                                <h4 className="info--name">{currentGroup.name}</h4>
                                                {/* <p className="info--state">Online </p> */}
                                            </div>
                                            <div className='chat__friend--video'>
                                                <i className="fas fa-user-plus" onClick={handleAddNewGroupMember}></i>
                                                <i className="fas fa-video"
                                                    onClick={() => handleOpenVideoCallGroup(currentGroup.name)}
                                                ></i>
                                            </div>
                                        </div>
                                        <div className="search-box">
                                            <input className="search-user" type="text" placeholder="Find member..." value="" />
                                            <div className="option-contact">
                                                <button className="button" ><i className="fas fa-search"></i></button>
                                                {
                                                    openModalAddNewGroupMember &&
                                                    <ModalNewContact
                                                        openModalAddNewContact={openModalAddNewGroupMember}
                                                        handleAddNewContact={handleAddNewGroupMember}
                                                        addNewGroupMember={true}
                                                        roomId={currentGroup.id}
                                                        updateGroupMemberList={updateGroupMemberList}
                                                    />
                                                }
                                            </div>
                                        </div>
                                        <GroupMember
                                            memberCurrentGroupList={memberCurrentGroupList}
                                            roomId={roomId}
                                            updateGroupMemberList={updateGroupMemberList}
                                        />
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                </div>

            </div >
        </div >
    )

    return content
}
export default Contact