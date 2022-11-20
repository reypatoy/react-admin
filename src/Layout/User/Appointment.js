import { useEffect } from "react";
import { useState } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from 'moment';
import { db } from "../../firebase-config";
import { collection,getDocs, query, where, onSnapshot } from "firebase/firestore";
import { UserAuth } from "../../context/authContext";

function Appointment() {

    const [date, setDate] = useState(null);
    const [bills, setBills] = useState([]);
    const navigate = useNavigate();

    const [allAppointments, setAllAppointments] = useState([]);
    const [personalAppointments, setPersonalAppointments] = useState([]);
    const [filterBills, setFilterBills] = useState([]);
    const user = useSelector(state => state.user);
    const [customerId, setCustomerId] = useState('');
    const [fullname, setFullname] = useState('');
    const [description, setDescription] = useState('');

    const [number, setNumber] = useState('');
    const [address, setAddress] = useState('')
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const { createCustomerAppointment, deleteCustomerAppointment } = UserAuth();

    useEffect(() => {
        if(!user.isLogin){
            navigate('/login/');
        }
        else if(user.type !== "Customer") {
                    navigate('/login/');
        }
        if(user.isLogin && user.type === "Customer"){
            getCustomer();
            getCustomerBills();
        }
    },[])
    const getCustomerBills = async () => {
        const billsRef = query(collection(db, "bills"), where("customerId", "==", user.user.user.uid)); // create collection reference
         onSnapshot(billsRef, (query) => {
            const allData = [];
            query.forEach((doc) => {
                    allData.push(doc);
            });
            setBills(allData);
                setFilterBills(allData);
        });
     }
    const getCustomer = () => {
        const q = query(collection(db, "customers"), where("id", "==", user.user.user.uid));
        const querySnapshot = getDocs(q);
        querySnapshot.then((snapshot) => {
            snapshot.forEach((doc) => {
                setCustomerId(doc.data().id);
                setFullname(doc.data().fullname);
                setNumber(doc.data().contact);
                setAddress(doc.data().address)
            });
        });
    }
    const q = collection(db, "appointments");
    onSnapshot(q, (query) => {
        const allData = [];
        const allData2 = [];
        query.forEach((doc) => {
                allData.push(doc);
                if(doc.data().customerId === user.user.user.uid &&
                    new Date(doc.data().date).getTime() >= new Date().getTime()
                ){
                    allData2.push(doc);
                }
        });
        setAllAppointments(allData);
        setPersonalAppointments(allData2.sort(function(a, b){
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

    const deleteAppointment = async (id) => {
        await deleteCustomerAppointment(id);
        alert('Appointment Deleted');
    }
    const setAppointment = async () => {
       if(date !== null && description.trim() !== ''){
            let count = 0;
            allAppointments.forEach(appointment => {
                if(appointment.data().date === date){
                    count++;
                }   
            });
            if(count > 20){
                alert("Sorry, No Appointments Available on this Date");
            }else{
                setButtonDisabled(true);
                let selectedDate = moment(date).format("MM-DD-YYYY")
                await createCustomerAppointment(customerId, selectedDate, fullname, description, address, number);
                setDate(null);
                setDescription('');
                alert('Appointment has been set');
                setButtonDisabled(false);
            }
       }
       else{
        alert('Please fill all the fields');
       }
    }

    return (
        <>
        
        <div className="appointmentContainer">
            <div className="dateSelect">
                <div className="billFormContainer">
                        <h3>Appointment</h3>
                        <input type="text" placeholder="Appointment Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <DatePicker
                        selected={date}
                        onChange={date => setDate(date)}
                        placeholderText={'Select Appointment Date'}
                        filterDate={date => date.getDay() !== 6 && date.getDay() !== 0} // weekends cancel
                        showYearDropdown // year show and scrolldown alos
                        minDate={new Date()}
                        scrollableYearDropdown
                        />
                        <button disabled={buttonDisabled} onClick={setAppointment} className="appointment-button" type="submit">Set Appointment</button>
                    </div>
                </div>
                <div className="content-containers">
                <div className="manageCard-customer">
                    <div className="manageCardHead">
                        <span>Past Records</span>
                        <h3>{fullname}</h3>
                    </div>
                    <div className="manageCardBody">
                        
                        <table>
                            <tbody className="tableBody">
                                {bills.length ?
                                    <tr>
                                        <th>Date</th>
                                        <th>Reading</th>
                                        <th>Bill Amount</th>
                                        <th>Penalty</th>
                                        <th>Total Payed</th>
                                    </tr> :
                                    <tr>
                                        <td>No Records</td>
                                    </tr>
                                }
                                {bills && bills.map((item, i) => (
                                    <tr key={i} >
                                        <td>{item.data().date}</td>
                                        <td>{item.data().reading}m<sup>3</sup></td>
                                        <td>₱‎{parseInt(item.data().bill).toLocaleString()}.00</td>
                                        <td>{item.data().penalty}</td>
                                        <td>₱‎{parseInt(item.data().totalPayable).toLocaleString()}.00</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            <div className="manageCard-customer">
                    <div className="manageCardHead">
                        <span>Incoming Appointments</span>
                        <h3>{fullname}</h3>
                    </div>
                    <div className="manageCardBody">
                        
                        <table>
                            <tbody className="tableBody">
                                {personalAppointments.length ?
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr> :
                                    <tr>
                                        <td>No Incoming Appointments</td>
                                    </tr>
                                }
                                {personalAppointments && personalAppointments.map((item, i) => (
                                    <tr key={i} >
                                        <td>{item.data().date}</td>
                                        <td>{item.data().description}</td>
                                        <td>
                                            <button onClick={() => deleteAppointment(item.id)} className="delete">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>
        </>
    )
}

export default Appointment;