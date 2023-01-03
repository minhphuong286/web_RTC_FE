import './Footer.scss';;

const Footer = () => {
    return (
        <div className='footer-container'>
            <div className='copyright'>
                © 2023 TDTU-T29
            </div>
            <div className='information'>
                <div class="information__content">
                    <a href="#" class="">Privacy</a>
                    <a href="#" class=" ml-10">Legal</a>
                    <a href="#" class=" ml-10">Contact</a>
                </div>
            </div>
        </div>
    )
}
export default Footer