import './Footer.scss';;

const Footer = () => {
    return (
        <div className='footer-container'>
            <div className='copyright'>
                © 2023 TDTU-T29
            </div>
            <div className='information'>
                <div className="information__content">
                    <a href="#" className="">Privacy</a>
                    <a href="#" className=" ml-10">Legal</a>
                    <a href="#" className=" ml-10">Contact</a>
                </div>
            </div>
        </div>
    )
}
export default Footer