import { useState, useEffect } from 'react';
import { UserAuth } from "../../context/authContext";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { db } from "../../firebase-config";
import TimePicker from 'react-time-picker';
import axios from "axios";
import { collection,query, where, onSnapshot, getDocs, } from "firebase/firestore";
// const nexmo = require('nexmo')

function Notifications() {

    const [notifications, setNotifications] = useState('');
    const [notificationId, setNotificationId] = useState('');
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedDateTo, setSelectedDateTo] = useState(null);
    const [isSend, setIsSend] = useState(false);
    // const nexmo = require('nexmo');
    const { createCustomerNotification } = UserAuth();
    const [value, onChange] = useState('10:00');
    const [customers, setCustomers] = useState([]);
    
    useEffect(() => {
        if(user.isLogin && user.type === 'Admin'){
            const q = query(collection(db, "notifications"));
            const querySnapshot = getDocs(q);
            querySnapshot.then((snapshot) => {
                snapshot.forEach((doc) => {
                    setNotificationId(doc.id);
                    setIsSend(doc.data().isSend)
                    setSelectedDate(new Date(doc.data().dateFrom));
                    setSelectedDateTo(new Date(doc.data().dateTo));
                    setNotifications(doc.data().notice);
                });
            });
        }
        else{
            navigate('/login');
        }
    }, []);

    const q = query(collection(db, "customers"), where("approve", "==", true));
    onSnapshot(q, (query) => {
        const allData = [];
        query.forEach((doc) => {
                allData.push(doc);
        });
        setCustomers(allData);
    });

    const sendNotification = async () => {
        if(!isSend){
            await createCustomerNotification(notifications, notificationId)
            alert("Notification Saved");
            setIsSend(true);
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
    const send = async (number, name) => {
        console.log(number);
        const response = await axios.post('https://new-sms-api.herokuapp.com/https://water-bill-api.herokuapp.com/api/',{
            "to":  number,
            "text": `Notice: Dear Mr/Ms ${name}, ${notifications} from ${selectedDate} until ${selectedDateTo}`,
            });
            alert("Notification Sent");
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
                  <div className='check-label'>
                    <span>isSave: </span>
                    <input type={'checkbox'} readOnly checked={isSend}/>
                  </div>
                  <button className="notifBtn-send" onClick={sendNotification}>Save</button>
                </div>
                <div className="manageContainer scroll-manage-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Purok</th>
                                <th>Email</th>
                                <th>Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {customers && customers.map((item, i) => (
                            <tr key={i} >
                                <td>{item.data().id.substring(1, 6)}</td>
                                <td>{item.data().fullname}</td>
                                <td>{item.data().address}</td>
                                <td>{item.data().email}</td>
                                <td>{item.data().contact}</td>
                                <td>
                                    <button onClick={() => send(item.data().contact, item.data().fullname)} className="view_more">Send</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Notifications;