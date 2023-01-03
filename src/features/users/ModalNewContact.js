import { useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './ModalNewContact.scss';
import { useFindUserMutation, useRequestContactMutation } from './contactApiSlice';


const ModalNewContact = (props) => {

    const userPhoneRef = useRef()
    const { openModalAddNewContact, toggle, handleAddNewContact, modal } = props;

    const [userPhone, setUserPhone] = useState('');
    const [userData, setUserData] = useState('');

    const [findUser] = useFindUserMutation();
    const [requestContact] = useRequestContactMutation();


    const handleFindUser = async (e) => {
        if (userPhone) {
            let search = userPhone
            let dataFinded = await findUser({ search });
            setUserData(dataFinded.data.data[0])
            // console.log('userData: ', dataFinded.data.data[0])
            // setUserPhone('')
        }
    }
    const handleContact = async () => {
        if (userData) {
            // console.log('userId:', userData.id)
            let res = await requestContact({
                active: '1',
                user_two: `${userData.id}`
            })
            // console.log('Res:', res)
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
            {console.log('Props AddNewContact:', props)}
            <Modal
                backdrop="static"
                centered="true"
                isOpen={openModalAddNewContact}
                toggle={handleAddNewContact}
            >
                <ModalHeader toggle={handleAddNewContact}>Add new contact</ModalHeader>
                <ModalBody className='body-container'>
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
                            ><i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div className="contact-list">
                        {userData &&
                            <div className="user-single">
                                <div className="user-single__avatar">
                                    <img src={require('../../assets/img/friend.png')} alt="avatar-user-contact" />
                                </div>
                                <div className="user-single__info">
                                    <h4 className="info--name">{userData.name}</h4>
                                    <p className="info--preview-message">
                                        {userData.bio ? userData.bio : 'No bio'}
                                    </p>
                                </div>

                            </div>
                        }
                        {userData &&
                            <input type="button" className="button" value="Contact"
                                onClick={handleContact}
                            />
                        }
                    </div>

                </ModalBody>
                {/* <ModalFooter>
                    {userData &&
                        <input type="button" className="button" value="Contact"
                            onClick={handleContact}
                        />
                    }
                    <input className='button button-cancel' type="button" onClick={handleAddNewContact}
                        value="Cancel"
                    />
                </ModalFooter> */}
            </Modal>
        </div >
    );
}

export default ModalNewContact;