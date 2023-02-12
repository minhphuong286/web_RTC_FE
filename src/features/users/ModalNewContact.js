import { useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './ModalNewContact.scss';
import { useFindUserMutation, useRequestContactMutation } from './contactApiSlice';
import { useAddGroupMemberMutation } from './groupApiSlice';
import Swal from 'sweetalert2';

const ModalNewContact = (props) => {

    const userPhoneRef = useRef()
    const {
        openModalAddNewContact,
        handleAddNewContact,
        openModalAddNewGroupMember,
        handleAddNewGroupMember,
        addNewGroupMember,
        updateContact,
        roomId
    } = props;

    const [userPhone, setUserPhone] = useState('');
    const [userData, setUserData] = useState('');

    const [findUser] = useFindUserMutation();
    const [requestContact] = useRequestContactMutation();
    const [addGroupMember] = useAddGroupMemberMutation();


    const handleFindUser = async (e) => {
        if (userPhone) {
            let search = userPhone
            let dataFinded = await findUser({ search });
            setUserData(dataFinded.data.data[0])
        }
    }
    const handleContact = async () => {
        if (userData) {
            // console.log('userId:', userData.id)
            await requestContact({
                active: '1',
                user_two: `${userData.id}`
            }).then(res => {
                if (res.data.message === "Success") {
                    Swal.fire({
                        title: 'Added!',
                        text: `has sent the contact`,
                        icon: 'success',
                    })
                    handleAddNewContact();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: `Something went wrong, please try again later!`,
                        icon: 'error',
                    })
                }
            })
        }

    }

    const handleAddMemberGroup = async () => {
        if (userData && roomId) {
            await addGroupMember({ presence_room_id: `${roomId}`, phone: userData.phone })
                .then(res => {
                    if (res.data.message === "Success") {
                        Swal.fire({
                            title: 'Added!',
                            text: `has added new member`,
                            icon: 'success',
                        })
                        const userData = res.data.data.user;
                        updateContact("add-member", {
                            name: userData.name,
                            phone: userData.phone,
                            id: userData.id
                        });
                        handleAddNewGroupMember();
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: `Something went wrong, please try again later!`,
                            icon: 'error',
                        })
                    }
                })
        }
    }
    useEffect(() => {
        // if (count === 0) {
        //     // alert('Stop countdown Hooks')
        //     return;
        // }
        // let Timer = setInterval(() => {
        //     // console.log('Count: ', count)
        //     setCount(count - 1)
        // }, 1000)
        // return () => {
        //     clearInterval(Timer)
        // }
        if (userPhone.length < 10) {
            setUserData('');
        }

    }, [userPhone])

    return (
        <div>
            {/* {console.log('Props AddNewContact:', props)}
            {console.log('Props AddNewContact, userDate:', userData)} */}
            <Modal
                backdrop="static"
                centered="true"
                isOpen={addNewGroupMember ? openModalAddNewGroupMember : openModalAddNewContact}
                toggle={addNewGroupMember ? handleAddNewGroupMember : handleAddNewContact}
            >
                <ModalHeader className='modal-add-new-contact' toggle={handleAddNewContact}>{addNewGroupMember === false ? "Add new contact" : "Add new group member"}</ModalHeader>
                <ModalBody className='body-container add-new-contact-modal-body'>
                    <div className='find-user'>
                        <div className='find-user__phone'>
                            <label htmlFor='phone'></label>
                            <input id='phone' type="text" placeholder="Find user by phone..."
                                ref={userPhoneRef}
                                onChange={(e) => setUserPhone(e.target.value)}
                                value={userPhone}
                            />
                        </div>
                        <div className='find-user__button'>
                            <button id='find' className='button button-icon'
                                onClick={handleFindUser}
                            ><i className="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div className="contact-list">
                        {userData &&
                            <div className="user-single">
                                <div className="user-single__avatar">

                                    {userData && userData.avatar
                                        ?
                                        <img src={userData.avatar} alt="avatar-user-contact" />
                                        :
                                        <img src={require('../../assets/img/friend.png')} alt="avatar-user-contact" />
                                    }
                                </div>
                                <div className="user-single__info">
                                    <h4 className="info--name">{userData.name}</h4>
                                    <p className="info--preview-message">
                                        {userData.bio ? userData.bio : 'No bio'}
                                    </p>
                                </div>

                            </div>
                        }
                        {userData
                            &&
                            <input type="button" className={addNewGroupMember === false ? "button" : "button d-none"} value="Contact"
                                onClick={handleContact}
                            />
                        }
                        {userData
                            &&
                            <input type="button" className={addNewGroupMember === true ? "button" : "button d-none"} value="Add"
                                onClick={() => handleAddMemberGroup()}
                            />
                        }
                    </div>

                </ModalBody>
            </Modal>
        </div >
    );
}

export default ModalNewContact;