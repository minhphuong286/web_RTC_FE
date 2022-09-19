import axios from 'axios';

export default axios.create({
    baseURL: 'http://webrtc-project-2-video-call.herokuapp.com'
});