import { useGetUsersQuery } from "./usersApiSlice"
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";
import '../../assets/scss/common.scss';
import "./Contact.scss";

const Contact = () => {
    const {
        data: users,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetUsersQuery('0379245526');

    let content;
    if (isLoading) {
        content = <p>"Loading..."</p>;
    } else if (isSuccess) {
        let usersList = users.data;
        content = (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-1 col-md-1">
                        <div className="tool-container">
                            <div className="avatar">
                                <img src={require('../../assets/img/avatar.png')} alt="avatar" />
                            </div>
                            <div className='bell-notify'>
                                <i class="far fa-bell"><span>1</span></i>
                            </div>
                            <div className='contact-notify'>
                                <i class="far fa-address-book"><span>N</span></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4">
                        <div className="friend-list-container">
                            <div className="search-box">
                                <input className="search-user" type="text" placeholder="Find user..." value="" />
                            </div>
                            <div className="option-list">
                                <span className="total-list">
                                    Total: <span>3</span>
                                </span>

                            </div>
                            <div className="friend list">

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
                    <div className="col lg-7 col-md-7" style={{ paddingLeft: "0px" }}>
                        <div className="chat-container">
                            {/* <div className="option" */}
                            <div className="row">
                                <div className="col-lg-6 col-md-6">
                                    <div className="contact-container">
                                        <h3 className="contact-list-title">Request contact</h3>
                                        <div className="contact-list">
                                            <div className="user-single">
                                                <div className="user-single__avatar">
                                                    <img src={require('../../assets/img/friend.png')} alt="avatar-user-contact" />
                                                </div>
                                                <div className="user-single__info">
                                                    <h4 className="info--name">User request name</h4>
                                                    <p className="info--preview-message">Hi, let's accept for new friend</p>
                                                </div>
                                                <div className="resolve">
                                                    <input type="button" className="button" value="Refuse" />
                                                    <input type="button" className="button" value="Accept" />
                                                </div>
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
    } else if (isError) {
        content = <p>{JSON.stringify(error)}</p>;
    }

    return content
}
export default Contact