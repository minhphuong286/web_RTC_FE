import { Link } from "react-router-dom"

const Public = () => {

    const content = (
        <section className="public"
            style={{ textAlign: "center", marginTop: "50px" }}>
            <header>

                <h1>Welcome to WEBRTC!</h1>
            </header>
            <main>

            </main>
            <footer>
                <Link to="/login">Login</Link>
            </footer>
        </section>

    )
    return content
}
export default Public