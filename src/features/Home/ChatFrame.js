import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { selectDataFromDetect } from './videoSlice';

const ChatFrame = (props) => {
    const {
        roomId,
        currentUser,
        messages,
    } = props;

    const userData = useSelector(selectDataFromDetect);
    console.log('ChatFrame message PROPS:', messages)


    const content = (
        <>
            {messages && messages.map((msg, index) => {
                // console.log('mess:', msg)

                // let cN = msg.dataFrom.name === userData.name ? "friend-single" : "friend-single current-host";

                if (msg && msg.type === "text" && msg.message.data.text.length > 0) {
                    const content = msg.message.data.text;
                    return (
                        <div className={msg.message.dataFrom.phone === currentUser.phone ? "friend-single" : "friend-single current-host"}>
                            <div className="friend-single__avatar">
                                <img src={require('../../assets/img/friend.png')} alt="avatar-friend" />
                            </div>
                            <div className="friend-single__info">
                                <p className="info--preview-message">{content}</p>
                            </div>
                        </div>
                    )
                }
            })}
            {/* <div className="friend-single ">
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
            </div> */}
        </>
    )

    return content;
}
export default ChatFrame;