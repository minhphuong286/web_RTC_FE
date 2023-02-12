import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useRegisterMutation } from './authApiSlice'
import { Link } from "react-router-dom";
import axios from '../../axios';
import CommonUtils from '../../utils/CommonUtils'

import './Register.scss';
import Swal from 'sweetalert2'

const REGISTER_URL = '/auth/register';

const Register = () => {
    const phoneRef = useRef()
    const usernameRef = useRef()
    const emailRef = useRef()
    const errRef = useRef()
    const avatarRef = useRef()

    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [avatar, setAvatar] = useState(require('../../assets/img/avatar.png'))

    const [errMsg, setErrMsg] = useState('')

    const navigate = useNavigate()

    const [register, { isLoading }] = useRegisterMutation()
    const dispatch = useDispatch()

    useEffect(() => {
        // usernameRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [phone, password, username, email])

    const handleChangeAvatar = (e) => {
        console.log("e:", e)
        const file = e.target.files[0];
        if (file) {
            const avatarURL = URL.createObjectURL(file);
            setAvatar(avatarURL)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // console.log('username:', username, 'email:', email);
            // console.log('phone:', phone, 'password:', password);
            let name = username;
            // let avt = avatarRef.current.files[0];
            let avt;
            if (avatarRef.current.files.length !== 0) {
                avt = await CommonUtils.getBase64(avatarRef.current.files[0]);
            }
            console.log("avat:", avt)
            // const dataForm = new FormData()
            // dataForm.append('avatar', avatarRef.current.files[0])
            // dataForm.append('name', username)
            // dataForm.append('email', email)
            // dataForm.append('phone', phone)
            // dataForm.append('password', password)

            // dataForm['avatar'] = avatarRef.current.files[0]

            // dataForm['name'] = username
            // dataForm['email'] = email
            // dataForm['phone'] = phone
            // dataForm['password'] = password

            // console.log("dataForm:", dataForm)
            const registerData = await register({ name: username, email, phone, password, avatar: avt }).unwrap()
            // const registerData = await register(data)
            // const registerData = axios.post("http://127.0.0.1:8000/auth/register", dataForm)
            // .then(res => {
            //     console.log('res:', res.message)
            //     if (res.message && res.message === "Success") {
            //         dispatch(setCredentials({ ...registerData, phone }))
            //         setPhone('')
            //         setPassword('')
            //         setEmail('')
            //         setUserName('')
            //         // console.log('OK');
            //         // <Link to="/welcome">Back to Welcome</Link>
            //         navigate('/message')
            //     }
            // })
            dispatch(setCredentials({ ...registerData, phone }))
            setPhone('')
            setPassword('')
            setEmail('')
            setUserName('')
            // console.log('OK');
            // <Link to="/welcome">Back to Welcome</Link>
            navigate('/message')
            // let name = username;
            // const response = await axios.post(REGISTER_URL,
            //     JSON.stringify({ name, email, phone, password }),
            //     {
            //         headers: { 'Content-Type': 'application/json' }
            //     }
            // );
            // console.log(response?.data);
            // console.log(response?.accessToken);
            // console.log(JSON.stringify(response))

        } catch (err) {
            // console.log('check Register:', err)
            if (!err?.originalStatus) {
                // isLoading: true until timeout occurs
                if (err.data.errors.phone) {
                    setErrMsg(err.data.errors.phone);
                } else if (err.data.errors.email) {
                    setErrMsg(err.data.errors.email);
                }
                else {
                    setErrMsg("Something went wrong, please try again later!")
                }
            } else if (err.originalStatus === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.originalStatus === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            // errRef.current.focus();
        }
    }

    const handleInputField = (e, type) => {
        if (type === 'username') {
            setUserName(e.target.value);
        } else if (type === 'email') {
            setEmail(e.target.value);
        } else if (type === 'phone') {
            setPhone(e.target.value);
        } else if (type === 'password') {
            setPassword(e.target.value);
        }
    }

    const content = isLoading ? <h1 style={{ textAlign: 'center', paddingTop: '5rem' }}>Loading...</h1> : (
        <section className="register">

            <div className='logo'></div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit} id="register-form">
                <table>
                    <tbody>
                        <tr className='form-content'>
                            <td colSpan={2}>
                                <div className='avatar-preview'>
                                    <img src={avatar} alt="avatar" />
                                </div>
                            </td>
                        </tr>
                        <tr className='form-content'>
                            <td>
                                <label htmlFor="password">Avatar:</label>
                            </td>
                            <td>
                                <input
                                    accept='image/png, image/jpeg, image/jpg'
                                    type="file"
                                    id="avatar"
                                    ref={avatarRef}
                                    onChange={(e) => handleChangeAvatar(e)}
                                />
                            </td>
                        </tr>
                        <tr className='form-content'>
                            <td>
                                <label htmlFor="username">Name:</label>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    id="username"
                                    ref={usernameRef}
                                    value={username}
                                    onChange={(e) => setUserName(e.target.value)}
                                    autoComplete="off"
                                    required
                                />
                            </td>
                        </tr>
                        <tr className='form-content'>
                            <td>
                                <label htmlFor="email">Email:</label>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    id="email"
                                    ref={emailRef}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    required
                                />
                            </td>
                        </tr>
                        <tr className='form-content'>
                            <td>
                                <label htmlFor="phone">Phone:</label>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    id="phone"
                                    ref={phoneRef}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    autoComplete="off"
                                    required
                                />
                            </td>
                        </tr>
                        <tr className='form-content'>
                            <td>
                                <label htmlFor="password">Password:</label>
                            </td>
                            <td>
                                <input
                                    type="password"
                                    id="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                />
                            </td>
                        </tr>

                    </tbody>
                </table>
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                <button>Register</button>

            </form>
            <div className='login-case'>
                <span >Have an account? <span><Link to="/login">Login</Link></span></span>
            </div>
        </section>
    )

    return content
}
export default Register