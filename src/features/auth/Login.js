import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'
import { Link } from "react-router-dom";

import './Login.scss'; import Footer from '../../components/Footer'
    ;

const Login = () => {
    const phoneRef = useRef()
    const errRef = useRef()
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const navigate = useNavigate()

    const [login, { isLoading }] = useLoginMutation()
    const dispatch = useDispatch()

    useEffect(() => {
        phoneRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [phone, password])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // console.log('phone:', phone, 'password:', password);
            const loginData = await login({ phone, password }).unwrap()
            dispatch(setCredentials({ ...loginData, phone }))
            setPhone('')
            setPassword('')
            // <Link to="/welcome">Back to Welcome</Link>
            navigate('/message')
        } catch (err) {
            // console.log('check LOGIN:', err)
            if (!err?.originalStatus) {
                console.log('check LOGIN:', err)
                if (err.data.message) {
                    setErrMsg(err.data.message);
                }
                // else if (err.data.errors.email) {
                //     setErrMsg(err.data.errors.email);
                // }
                else {
                    setErrMsg("Something went wrong, please try again later!")
                }
                // isLoading: true until timeout occurs
                // setErrMsg('No Server Response');
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

    const handleUserInput = (e) => {
        // console.log('check e: ', e)
        setPhone(e.target.value)
    }
    const handlePwdInput = (e) => setPassword(e.target.value)

    const content = isLoading ? <h1 style={{ textAlign: 'center', paddingTop: '5rem' }}>Loading...</h1> : (<>

        <div className='login-background'>
            <section className="login">
                <div className='logo'></div>
                <h1>Login</h1>

                <form onSubmit={handleSubmit} id="login-form">
                    <div className='form-content'>
                        <label htmlFor="username">Username:</label>
                        <input
                            ref={phoneRef}
                            value={phone}
                            onChange={handleUserInput}
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className='form-content'>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={handlePwdInput}
                            value={password}
                            required
                        />
                    </div>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <button>Login</button>

                </form>
                <div className='register-case'>
                    <span >Don't have an account? <span><Link to="/register">Register</Link></span></span>
                </div>

            </section>
        </div>
        {/* <Footer /> */}

    </>)

    return content
}
export default Login