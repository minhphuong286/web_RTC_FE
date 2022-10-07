

const ChatFrame = () => {


    const content = (
        <>
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
        </>
    )

    return content;
}
export default ChatFrame;