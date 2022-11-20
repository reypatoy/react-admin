import { useState, useEffect } from 'react';
import { UserAuth } from "../../context/authContext";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { db } from "../../firebase-config";
import { collection,getDocs, query } from "firebase/firestore";
import axios from "axios";
// const nexmo = require('nexmo')

function Notifications() {

    const [notifications, setNotifications] = useState('');
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateTo, setSelectedDateTo] = useState(null);
    const [isSend, setIsSend] = useState(false);
    // const nexmo = require('nexmo');
    const { createCustomerNotification } = UserAuth();
    
    useEffect(() => {
        if(user.isLogin && user.type === 'Admin'){
            const q = query(collection(db, "notifications"));
            const querySnapshot = getDocs(q);
            querySnapshot.then((snapshot) => {
                snapshot.forEach((doc) => {
                    setIsSend(doc.data().isSend)
                    setSelectedDate(new Date(doc.data().dateFrom));
                    setSelectedDateTo(new Date(doc.data().dateTo));
                    setNotifications(doc.data().notice);
                });
            });
        }
        else{
            navigate('/login/');
        }
    }, []);
    const sendNotification = async () => {
        if(!isSend){
            await createCustomerNotification(notifications, moment(selectedDate).format("MM-DD-YYYY"),
                 moment(selectedDateTo).format("MM-DD-YYYY"))
                 const response = await axios.post('https://water-bill-api.herokuapp.com/api/',{
                    "to": '+639078721057',
                    "text": `Notice: Water Interuption from ${selectedDate} until ${selectedDateTo}`,
                    });
                if(response.status === 200){
                    alert("Notification Sent");
                }
            alert('Notive Send Successfully!!!')
        }
    }
    const setNotice = (e) => {
        setIsSend(false);
        setNotifications(e);
    }
    const setDateFrom = (e) => {
        setSelectedDate(e);
        setIsSend(false);
    }
    const setDateTo = (e) => {
        setSelectedDateTo(e);
        setIsSend(false);
    }
    return (
        <div className="adminContainer">
            <div className="notifContainer">
                <h1>Notice of Water Interruption</h1>
                <div className="notif">
                    <label>Notice: </label>
                    <textarea className="notifInput" placeholder="Enter notice here" 
                                value={notifications} onChange={(e) => setNotice(e.target.value)}> 
                    </textarea>
                </div>
                <div className="notif-date">
                    <label>Date From : </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={date => setDateFrom(date)}
                        placeholderText={'Enter Date From'}
                        filterDate={date => date.getDay() !== 6 && date.getDay() !== 0} // weekends cancel
                        showYearDropdown // year show and scrolldown alos
                        scrollableYearDropdown
                    />
                    <label>Date To: </label>
                    <DatePicker
                        selected={selectedDateTo}
                        onChange={date => setDateTo(date)}
                        placeholderText={'Enter Date To'}
                        filterDate={date => date.getDay() !== 6 && date.getDay() !== 0} // weekends cancel
                        showYearDropdown // year show and scrolldown alos
                        scrollableYearDropdown
                    />
                </div>
                <div className="notif-label">
                    <label>Send</label>
                    <input type="checkbox" checked={isSend} disabled className="notif-checkbox" />
                </div>
                <div onClick={sendNotification} className="statButtons">
                    <button>Send</button>
                </div>
            </div>
        </div>
    )
}

export default Notifications;