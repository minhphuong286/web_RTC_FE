import { useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import './ModalNewContact.scss';
import './ModalCreateNewGroup.scss';
import { useCreateGroupMutation } from './groupApiSlice';
import Swal from 'sweetalert2';

const ModalNewContact = (props) => {

    const nameGroupRef = useRef()
    const { openModalCreateNewGroup, handleCreateNewGroup } = props;

    const [nameGroup, setNameGroup] = useState('');
    const [createGroup] = useCreateGroupMutation();

    const handleCreate = async () => {
        if (nameGroup && nameGroup.length > 0) {
            // console.log('userId:', userData.id)
            await createGroup({
                name: nameGroup,
            }).then(res => {
                console.log("handleCreate:", res);
                if (res.data.message === "Success") {
                    Swal.fire({
                        title: 'Created!',
                        text: `create a new group successfully`,
                        icon: 'success',
                    })
                    setNameGroup("");
                    handleCreateNewGroup();
                }
            })
        }
    }

    return (
        <div>
            {console.log('Props AddNewContact:', props)}
            <Modal
                backdrop="static"
                centered="true"
                isOpen={openModalCreateNewGroup}
                toggle={handleCreateNewGroup}
            >
                <ModalHeader className='modal-add-new-contact' toggle={handleCreateNewGroup}>Create new group</ModalHeader>
                <ModalBody className='body-container add-new-contact-modal-body create-new-group-modal-body'>
                    <div className='find-user'>
                        <div className='find-user__phone'>
                            <label htmlFor='name-group'>Name:</label>
                            <input id='name-group' className='type-content' type="text" placeholder="Enter name of group..."
                                ref={nameGroupRef}
                                onChange={(e) => setNameGroup(e.target.value)}
                                value={nameGroup}
                            />
                        </div>
                    </div>
                    <div className="contact-list">
                        <input type="button" className="button" value="Create"
                            onClick={handleCreate}
                        />
                    </div>

                </ModalBody>
            </Modal>
        </div >
    );
}

export default ModalNewContact;