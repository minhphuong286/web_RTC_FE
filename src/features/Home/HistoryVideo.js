import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from 'react-redux';
import "./HistoryVideo.scss";
import moment from "moment";
// import Swal from "sweetalert2";

import { useGetGroupHistoryQuery } from '../users/groupApiSlice';

const HistoryVideo = (props) => {
    const {
        groupId
    } = props;

    // const [groupId, setGroupId] = useState('');
    const { data: groupHistoryList } = useGetGroupHistoryQuery(
        groupId,
        { skip: groupId === '', refetchOnMountOrArgChange: true, }
    );

    const [currentGroupHistoryList, setCurrentGroupHistoryList] = useState([]);
    const [countTime, setCountTime] = useState('');

    useEffect(() => {
        if (groupHistoryList && groupHistoryList.data.length > 0) {
            let cMonth = 0;
            let cWeek = 0;
            groupHistoryList.data.map(item => {
                let time = moment(item.start_calling);
                if (time.isSame(new Date(), 'week') === true) {
                    cWeek += 1;
                }
                if (time.isSame(new Date(), 'month') === true) {
                    cMonth += 1;
                }
            })
            setCountTime({ 'cWeek': cWeek, 'cMonth': cMonth });
            setCurrentGroupHistoryList(groupHistoryList.data);
        } else {
            setCurrentGroupHistoryList([]);
        }
    }, [groupHistoryList])
    const getDuration = (seconds) => {
        let duration = moment.duration(seconds, 'seconds');
        const day = duration.get('days');
        const hour = duration.get('hours');
        const minute = duration.get('minutes');
        const second = duration.get('seconds');
        let res = {}
        if (day >= 10) {
            res['day'] = `${day}`
        } else if (day > 0 && day < 10) {
            res['day'] = `0${day}`
        }
        if (hour >= 10) {
            res['hour'] = `${hour}`
        } else if (hour > 0 && hour < 10) {
            res['hour'] = `0${hour}`
        }
        if (minute >= 10) {
            res['minute'] = `${minute}`
        } else if (minute > 0 && minute < 10) {
            res['minute'] = `0${minute}`
        }
        if (second >= 10) {
            res['second'] = `${second}`
        } else if (second > 0 && second < 10) {
            res['second'] = `0${second}`
        }

        return res
    }
    // console.log("HistoryVideo Prop:", groupId)
    const content = (
        <>
            {currentGroupHistoryList.length > 0
                ?
                <div className='history-calling'>
                    <div className="search-box">
                        <h3 className='count-to-month'>
                            {countTime.cWeek > 0 ? `Đã thực hiện ${countTime.cWeek} lần trong tuần` : `Chưa thực hiện cuộc gọi nào!`}
                            {countTime.cMonth > 1 ? `, ${countTime.cMonth} lần trong tháng.` : ``}
                        </h3>
                    </div>
                    <div className='history-list'>
                        {currentGroupHistoryList.map((item) => {
                            let date = moment.utc(item.start_calling).local().format('L');
                            let time = moment.utc(item.start_calling).local().format('H:mm');
                            let dur = getDuration(item.duration);
                            return (
                                <div className="history-single" key={item.id}>
                                    <div className="abstract">
                                        <img src={require('../../assets/img/history.png')} alt="avatar-user-contact" />
                                    </div>
                                    <div className="date-time">
                                        <h4 className="date"><i className="fas fa-calendar-alt"></i> {date}</h4>
                                        <p className="time"><i className="far fa-clock"></i> {time}</p>
                                    </div>
                                    <div className="duration">
                                        <p className='count'><i className="fas fa-stopwatch"></i>&nbsp;
                                            {dur.day ? `${dur.day}d:` : ``}
                                            {dur.hour ? `${dur.hour}h:` : ``}
                                            {dur.minute ? `${dur.minute}m:` : ``}
                                            {dur.second ? `${dur.second}s` : ``}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                :
                <>
                    <div className="history-calling">
                        <img className="history-none" src={require('../../assets/img/history-video.png')} alt="history-none" />
                    </div>
                </>
            }

        </>
    )

    return content;
}
export default HistoryVideo;