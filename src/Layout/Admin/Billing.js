import { db } from "../../firebase-config";
import { collection,query, where, onSnapshot } from "firebase/firestore";
import { UserAuth } from "../../context/authContext";
import { useState, useEffect} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import axios from "axios";

function Billing() {

    const [data, setData] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [billCustomerName, setBillCustomerName] = useState('');
    const [billCustomerEmail, setBillCustomerEmail] = useState('');
    const [addCustomerBill, setAddCustomerBill] = useState(0);
    const [meterReading, setMeterReading] = useState(0);
    const [billCustomerID, setBillCustomerID] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [selectedDate, setSelectedDate] = useState(null)
    const user = useSelector(state => state.user);
    const [isBillModal, setIsBillModal] = useState(false);
    const [isPayModal, setIsPayModal] = useState(false);

    const [penalty, setPenalty] = useState('');
    const [totalPayable, setTotalPayable] = useState('');

    const navigate = useNavigate();
    const { saveCustomerBill, createCustomerBill } = UserAuth();
    const [isFilter, setIsFilter] = useState(false);
    const [item, setItem] = useState('');

    useEffect( () => {
        if(!user.isLogin){
            navigate('/login');
        }
        else if(user.type !== "Admin") {
                    navigate('/login');
        }
    },
    []);

    const q = query(collection(db, "customers"), where("approve", "==", true));
    onSnapshot(q, (query) => {
        const allData = [];
        query.forEach((doc) => {
                allData.push(doc);
        });
        if(isFilter === false){
            setData(allData);
            setFilterData(allData);
        }
    });

    const handleChange = (e) => {
        setIsFilter(true);
        if(e && e.trim() !== ""){
            setFilterData(() => {
                return data.filter((value) => value.data().fullname.toLowerCase().includes(e.toLowerCase()))
              })
        }
        else{
            setFilterData(data);
        }
    }
    function getDifferenceInDays(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60 * 60 * 24);
      }

    const payBill = async (customerId, date, bill, reading, itemId, name, email, address, contact) => { 
        if(bill && bill !== 0){
            setIsFilter(false);
            setIsPayModal(true);
            setIsBillModal(false);
            setBillCustomerName(name);
            setBillCustomerEmail(email);
            setBillCustomerID(customerId);
            setAddress(address);
            setContact(contact);
            setItem(itemId);
            setSelectedDate(date);
            setAddCustomerBill(bill); 
            setMeterReading(reading);
            const currentDate = new Date();
            const  dueDate = new Date(date);
            if(dueDate.getTime() < currentDate.getTime()){
                const additional = Math.ceil(getDifferenceInDays(currentDate, dueDate));
                setPenalty(additional);
                setTotalPayable(parseInt(bill) + parseInt(additional));
            }else{
                setPenalty(0);
                setTotalPayable(bill);
            }
        }else{
            alert("This customer has no bill to pay");
        }
    }

    const savePayBill = async () => {
        await createCustomerBill(billCustomerID, selectedDate, addCustomerBill, meterReading, totalPayable, penalty, address, contact, billCustomerName);
           await  saveCustomerBill(item, null, null, null);
           const response = await axios.post('https://new-sms-api.herokuapp.com/https://water-bill-api.herokuapp.com/api/emails/',
                {
                "to":billCustomerEmail,
                "name":billCustomerName,
                "date":selectedDate,
                "bill":addCustomerBill,
                "reading":meterReading,
                "payed":totalPayable,
                "penalty":penalty
                }
              );
              console.log(response);
            alert("Bill Paid Successfully");
            setIsFilter(false);
            setIsBillModal(false);
            setIsPayModal(false);
            setBillCustomerID("");
            setMeterReading(0);
            setAddCustomerBill(0);
            setSelectedDate(null);
            setBillCustomerName('');
            setBillCustomerEmail('');
            setItem('');

    }
    const saveAddBill = () => {
        setIsFilter(false);
        let date = moment(selectedDate).format("MM-DD-YYYY")
        if(addCustomerBill && selectedDate && addCustomerBill.trim() && meterReading && meterReading.trim()){
            saveCustomerBill(billCustomerID, addCustomerBill, date.toString(), meterReading);
            alert("Bill Added Successfully");
            setIsBillModal(false);
            setBillCustomerID("");
            setMeterReading(0);
            setAddCustomerBill(0);
            setSelectedDate(null);
            setBillCustomerName('');
        }
        else{
            alert("Please fill all the fields");
        }
    }
    const addBill = (customerId, name, i, item, oldBill, oldMeterReading, oldDueDate) => {
        setIsFilter(false);
        setIsPayModal(false);
        setIsBillModal(true);
        if(oldMeterReading){
            setMeterReading(oldMeterReading);
        }else{
            setMeterReading('');
        }
        if(oldBill){
            setAddCustomerBill(oldBill);    
        }else{
            setAddCustomerBill('');
        }
        if(oldDueDate){
            setSelectedDate(new Date(oldDueDate));
        }else{
            setSelectedDate(null);
        }
        setBillCustomerName(name);
        setBillCustomerID(customerId);
    }
    const hideBill = () => {
        setIsFilter(false);
        setIsBillModal(false);
        setIsPayModal(false);
        setBillCustomerID("");
        setMeterReading(0);
        setAddCustomerBill(0);
        setSelectedDate(null);
        setBillCustomerName('');
    }
    const hidePayBill = () => {
        setIsFilter(false);
        setIsBillModal(false);
        setBillCustomerID("");
        setMeterReading(0);
        setAddCustomerBill(0);
        setSelectedDate(null);
        setBillCustomerName('');
        setIsPayModal(false);
        setIsBillModal(false);
    }
    return (
        <div className="billContainer">
            <div className="billSearchContainer">
                <span>Filter</span>
                <input className="billingSearch" type="name" onChange={(e) => handleChange(e.target.value)} placeholder="Enter Fullname To Filter" />
            </div>
            {isBillModal && 
               <div className="billModal">
                  <div className="setWidth">   
                        <span >{billCustomerName}</span>&nbsp;&nbsp;
                  </div>
                    <div className="billFormContainer">
                        <span>Bill Amount</span>
                        <input type="text" value={addCustomerBill} onChange={e => setAddCustomerBill(e.target.value)} placeholder="Enter Bill Amount" />
                    </div>
                    <div className="billFormContainer">
                        <span>Meter Reading</span>
                        <input type="text" value={meterReading} onChange={e => setMeterReading(e.target.value)} placeholder="Enter Meter Reading" />
                    </div>
                    <div className="billFormContainer">
                        <span>Due Date</span>
                        <DatePicker
                        selected={selectedDate}
                        onChange={date => setSelectedDate(date)}
                        placeholderText={'Enter Due Date'}
                        filterDate={date => date.getDay() !== 6 && date.getDay() !== 0} // weekends cancel
                        showYearDropdown // year show and scrolldown alos
                        scrollableYearDropdown
                        />
                    </div>
                    
                   <div className="setGroupWidth">
                        <button className="addBillButton1" onClick={hideBill}>
                            Cancel
                        </button>
                        <button onClick={saveAddBill}>
                            Add Bill
                        </button>
                    </div>
                </div>
            }
            {isPayModal && 
               <div className="billModal">
                  <div className="setWidth">   
                        <span >{billCustomerName}</span>&nbsp;&nbsp;
                  </div>
                    <div className="billFormContainer">
                        <span>Bill Amount</span>
                        <input type="text" value={addCustomerBill} onChange={e => setAddCustomerBill(e.target.value)} placeholder="Enter Bill Amount" />
                    </div>
                    <div className="billFormContainer">
                        <span>Penalty</span>
                        <input type="text" value={penalty} disabled />
                    </div>
                    <div className="billFormContainer">
                        <span>Total Payable</span>
                        <input type="text" value={totalPayable} disabled />
                    </div>
                    
                   <div className="setGroupWidth">
                        <button className="addBillButton1" onClick={hidePayBill}>
                            Cancel
                        </button>
                        <button onClick={savePayBill}>
                            Save Payment
                        </button>
                    </div>
                </div>
            }
            <table>
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>PUROK</th>  
                        <th>Bill</th>
                        <th>DUE DATE</th>
                        <th>METER READING</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                {filterData && filterData.map((item, i) => (
                    <tr key={i} >
                        <td>{item.data().fullname}</td>
                        <td>{item.data().address}</td>
                        {item.data().bill ?
                            <td>{parseInt(item.data().bill).toLocaleString()}.00</td>
                            :
                            <td>00</td>
                        }
                        {item.data().dueDate ?
                            <td>{item.data().dueDate}</td>
                            :
                            <td>No Due Date Yet</td>
                        }
                        {item.data().meterReading ?
                            <td>{item.data().meterReading} m<sup>3</sup></td>
                            :
                            <td>No Reading Yet</td>
                        }
                        
                        <td>
                            <button onClick={() => payBill(item.data().id,item.data().dueDate, item.data().bill, item.data().meterReading, item.id, item.data().fullname, item.data().email, item.data().address, item.data().contact)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M0 112.5V422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4V89.7c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64H64V352zm64-208c0 35.3-28.7 64-64 64V144h64zM512 304v64H448c0-35.3 28.7-64 64-64zM448 96h64v64c-35.3 0-64-28.7-64-64z"/></svg>
                                <span>Pay</span>
                            </button>
                            <button onClick={() => addBill(item.id, item.data().fullname, i, item, item.data().bill,item.data().meterReading, item.data().dueDate)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M96 96C96 60.65 124.7 32 160 32H576C611.3 32 640 60.65 640 96V320C640 355.3 611.3 384 576 384H160C124.7 384 96 355.3 96 320V96zM160 320H224C224 284.7 195.3 256 160 256V320zM160 96V160C195.3 160 224 131.3 224 96H160zM576 256C540.7 256 512 284.7 512 320H576V256zM512 96C512 131.3 540.7 160 576 160V96H512zM368 128C323.8 128 288 163.8 288 208C288 252.2 323.8 288 368 288C412.2 288 448 252.2 448 208C448 163.8 412.2 128 368 128zM48 360C48 399.8 80.24 432 120 432H520C533.3 432 544 442.7 544 456C544 469.3 533.3 480 520 480H120C53.73 480 0 426.3 0 360V120C0 106.7 10.75 96 24 96C37.25 96 48 106.7 48 120V360z"/></svg>
                                <span>Bill</span>
                            </button>   
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default Billing;