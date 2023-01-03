import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Public from './components/Public'
import Login from './features/auth/Login'
import Welcome from './features/Home/Welcome'
import RequireAuth from './features/auth/RequireAuth'
import UsersList from './features/users/UsersList'
import Register from './features/auth/Register'
import RegisterTest from './features/auth/RegisterTest'
import "./assets/fontawesome/index.js"
import Contact from './features/users/Contact'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="register-test" element={<RegisterTest />} />
        {/* protected routes */}
        {/* <Route > */}
        <Route element={<RequireAuth />}>
          <Route path="message" element={<Welcome />} />
          <Route path="contact" element={<Contact />} />
          <Route path="users" element={<UsersList />} />
        </Route>

      </Route>
    </Routes>
  )
}

export default App;
