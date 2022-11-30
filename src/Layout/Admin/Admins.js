import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import statCell from '../../statCell.png'
import { db } from "../../firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import { UserAuth } from "../../context/authContext";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from 'moment';

function Admins() {

    const [paid, setPaid] = useState(0);
    const [penalties, setPenalties] = useState(0);
    const [overdue, setOverdue] = useState(0);
    const [allAppointments, setAllAppointments] = useState([]);
    const [personalAppointments, setPersonalAppointments] = useState([]);
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const { setDoneCustomerAppointment } = UserAuth();
    const currentDate = moment(new Date()).format("MM-DD-YYYY");
    let hour = new Date().getHours();
    let minute = new Date().getMinutes();
    let seconds = new Date().getSeconds() < 10 ? `0${new Date().getSeconds()}` : new Date().getSeconds();

    const getHour = () => {
        hour =  new Date().getHours()
    }

    const getMinutes = () => {
        minute = new Date().getMinutes();
    }
    const getSeconds = () => {
        seconds = new Date().getSeconds() < 10 ? `0${new Date().getSeconds()}` : new Date().getSeconds();
    }
    setInterval(getSeconds, 1000);
    setInterval(getMinutes, 60000);
    setInterval(getHour, 36000000)


    useEffect(() => {
        if(!user.isLogin){
            navigate('/login');
        }
        else if(user.type !== "Admin") {
                    navigate('/login');
        }
    },[])

    const q = collection(db, "appointments");
    onSnapshot(q, (query) => {
        const allData = [];
        query.forEach((doc) => {
            if(new Date(doc.data().date).getTime() >= new Date().getTime()){
                allData.push(doc);
            }
        });
        setAllAppointments(allData);
        setPersonalAppointments(allData.sort(function(a, b){
            let dateA = a.data().date.toLowerCase();
            let dateB = b.data().date.toLowerCase();
                if (dateA < dateB) 
                {
                    return -1;
                }else if (dateA > dateB){
                    return 1;
                }   
            return 0;
          }));
    });
    const setDone = async (id) => {
        await setDoneCustomerAppointment(id);
    }
    return (
        <div className="adminContainer">
            
            <div className="dashHead">            
                <h2>Dashboard</h2> 
                <Link to="/admin/manage"><button>Manage</button></Link>
            </div>
           <div className="dateContainer">
                <span>{ currentDate }</span> <span>{ hour }:{ minute }:{ seconds }</span>
           </div>
            
            <div className="admin-Dashboard">
                <div className="dashboardLeft">
                    <div className="dashboardStatCell">
                        <div className="statCellHead statPaid">
                            <img src={statCell} alt="" srcSet="" />
                            <h3>Customers Paid Today</h3>
                        </div>
                        <span>{ paid }</span>
                    </div>
                    <div className="dashboardStatCell">
                        <div className="statCellHead">
                            <img src={statCell} alt="" srcSet="" />
                            <h3>Customers with Penalties</h3>
                        </div>
                        <span>{ penalties }</span>
                    </div>
                    <div className="dashboardStatCell">
                        <div className="statCellHead">
                            <img src={statCell} alt="" srcSet="" />
                            <h3>Customers with Overdue Balance</h3>
                        </div>
                        <span>{ overdue }</span>
                    </div>
                </div>
                <div className="dashboardRight">
                    <table>
                        <thead>
                        {personalAppointments && personalAppointments.length? 
                            <tr>
                                <th>Name</th>
                                <th>Number</th>
                                <th>Purok</th>
                                <th>Appointment Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>:
                            <tr>
                                <th>No Upcoming Appointments</th>
                            </tr>
                        }
                        </thead>
                        <tbody>
                            {personalAppointments && personalAppointments.map((item, i) => (
                                
                                <tr key={i}>
                                    <td>{item.data().fullname}</td>
                                    <td>{item.data().contact}</td>
                                    <td>{item.data().address}</td>
                                    <td>{item.data().date}</td>
                                    <td>{item.data().status}</td>
                                    <td>
                                        <button onClick={() => setDone(item.id)} className="mark-done-appointment">Mark Done</button>    
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

export default Admins;