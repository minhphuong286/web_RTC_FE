import { useGetUsersQuery } from "./usersApiSlice"
import { Link } from "react-router-dom";

const UsersList = () => {
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
            <section className="users">
                <h1>Users List</h1>
                {console.log('check res: ', users.data, usersList.name)}
                {usersList.name}
                <Link to="/welcome">Back to Welcome</Link>
            </section>
        )
    } else if (isError) {
        content = <p>{JSON.stringify(error)}</p>;
    }

    return content
}
export default UsersList