import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'
import { Link } from "react-router-dom";
import axios from '../../axios';

import './Register.scss';

const REGISTER_URL = '/auth/register';

const Register = () => {
    const phoneRef = useRef()
    const usernameRef = useRef()
    const emailRef = useRef()
    const errRef = useRef()


    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')

    const [errMsg, setErrMsg] = useState('')

    const navigate = useNavigate()

    const [register, { isLoading }] = useLoginMutation()
    const dispatch = useDispatch()

    useEffect(() => {
        usernameRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [phone, password, username, email])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // console.log('username:', username, 'email:', email);
            // console.log('phone:', phone, 'password:', password);
            let name = username;
            const registerData = await register({ name, email, phone, password }).unwrap()
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
            dispatch(setCredentials({ ...registerData, phone }))
            setPhone('')
            setPassword('')
            setEmail('')
            setUserName('')
            // console.log('OK');
            // <Link to="/welcome">Back to Welcome</Link>
            navigate('/welcome')
        } catch (err) {
            // console.log('check Register:', err)
            if (!err?.originalStatus) {
                // isLoading: true until timeout occurs
                setErrMsg('No Server Response');
            } else if (err.originalStatus === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.originalStatus === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
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

    const content = isLoading ? <h1>Loading...</h1> : (
        <section className="register">
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

            <h1>Register</h1>

            <form onSubmit={handleSubmit} id="register-form">
                <table>
                    <tbody>
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
                        {/* <tr className='form-content'>
                            <td>
                                <label htmlFor="avatar">Avatar:</label>
                            </td>
                            <td>
                                <input
                                    type="file"
                                    id="avatar"
                                    // onChange={(e) => setPassword(e.target.value)}
                                    // value={password}
                                    // required
                                />
                            </td>
                        </tr> */}
                    </tbody>
                </table>

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