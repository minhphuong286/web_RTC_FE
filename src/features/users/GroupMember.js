import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import "./GroupMember.scss";
import { useDeleteGroupMemberMutation } from "../users/groupApiSlice";
import Swal from "sweetalert2";

const GroupMember = (props) => {
    const {
        memberCurrentGroupList, roomId, updateContact
    } = props;

    const [deleteGroupMember] = useDeleteGroupMemberMutation();

    const handleDeleteMember = async (id) => {
        if (id && roomId && memberCurrentGroupList.length > 1) {
            Swal.fire({
                title: "Xóa thành viên",
                text: "Bạn thực sự muốn xóa thành viên khỏi nhóm",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xóa",
                cancelButtonText: 'Hủy',
            }).then(async function (isConfirm) {
                if (isConfirm.value) {
                    await deleteGroupMember({
                        roomId: roomId,
                        memberId: id
                    }).then(res => {
                        if (res.data.message === "Success") {
                            Swal.fire({
                                title: 'Đã xóa!',
                                text: `Xóa thành viên thành công`,
                                icon: 'success',
                            })
                            updateContact("delete-member", id);
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: `Something went wrong, please try again later!`,
                                icon: 'error',
                            })
                        }
                    })
                }
            })
        } else {
            Swal.fire({
                title: 'Không thể xóa!',
                text: `Nhóm phải có ít nhất 1 thành viên`,
                icon: 'error',
            })
        }
    }
    const content = (
        <>
            <div id="member-list-place" className="list__place on-video">
                {memberCurrentGroupList && memberCurrentGroupList.map((member, index) => {
                    return (
                        <div className="container-single" key={index}>
                            <div className="button-delete"
                                onClick={() => handleDeleteMember(member.id)}>
                                <i className="fas fa-times"></i>
                            </div>
                            <div className={member.role === 1 ? "is-admin" : "is-admin d-none"}>
                                <i className="fas fa-star"></i>
                            </div>
                            <div className="container-single__avatar">
                                {member.avatar
                                    ?
                                    <img src={member.avatar} alt="avatar-member" />
                                    :
                                    <img src={require('../../assets/img/friend.png')}
                                        alt="avatar-member" />
                                }
                            </div>
                            <div className="container-single__info">
                                <p className="info--name">{member.name}</p>
                                <p className="info--phone">{member.phone}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )

    return content;
}
export default GroupMember;