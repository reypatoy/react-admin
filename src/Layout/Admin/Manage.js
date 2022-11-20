import { db } from "../../firebase-config";
import { collection,getDocs, query, where, } from "firebase/firestore";
import { useState, useEffect} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Manage() {

    const [data, setData] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [bills, setBills] = useState([]);
    const [filterBills, setFilterBills] = useState([]);
    const user = useSelector(state => state.user);
    const [isViewMoreModal, setIsViewMoreModal] = useState(false);
    const [fullname, setFullname] = useState('');
    const navigate = useNavigate();

    useEffect( () => {
        if(!user.isLogin){
            navigate('/login/');
        }
        else if(user.type !== "Admin") {
                    navigate('/login/');
        }
        if(user.isLogin && user.type === "Admin"){
            getCustomer();
            getCustomerBills();
        }
    },
    []);
    const getCustomer = () => {
         const q = query(collection(db, "customers"), where("approve", "==", true));
         const querySnapshot = getDocs(q);
         querySnapshot.then((snapshot) => {
             snapshot.forEach((doc) => {
                setData((data) => [...data, doc]);
                setFilterData((data) => [...data, doc]);
             });
         });
     }
    const getCustomerBills = async () => {
        const billsRef = collection(db, 'bills') // create collection reference
    
         const querySnapshot = getDocs(billsRef);
         querySnapshot.then((snapshot) => {
             snapshot.forEach((doc) => {
                setBills((data) => [...data, doc]);
                setFilterBills((data) => [...data, doc]);
             });
         });
     }
    const viewMore = (id, _fullname) => {
        setIsViewMoreModal(true);
        setFullname(_fullname);
        setFilterBills(bills.filter(bill => bill.data().customerId === id));
    }
    const closeModal = () => {
        setIsViewMoreModal(false);
    }
    return (
        <div className="manageContainer">
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
                {filterData && filterData.map((item, i) => (
                    <tr key={i} >
                        <td>{item.data().id.substring(1, 6)}</td>
                        <td>{item.data().fullname}</td>
                        <td>{item.data().address}</td>
                        <td>{item.data().email}</td>
                        <td>{item.data().contact}</td>
                        <td>
                            <button onClick={() => viewMore(item.data().id, item.data().fullname)} className="view_more">view more</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {isViewMoreModal && 
                <div className="manageCard">
                    <div className="manageCardHead">
                        <span>Past Records</span>
                        <h3>{fullname}</h3>
                    </div>
                    <div className="manageCardBody">
                        
                        <table>
                            <tbody className="tableBody">
                                {filterBills.length ?
                                    <tr>
                                        <th>Date</th>
                                        <th>Reading</th>
                                        <th>Amount</th>
                                    </tr> :
                                    <tr>
                                        <td>No Records</td>
                                    </tr>
                                }
                                {filterBills && filterBills.map((item, i) => (
                                    <tr key={i} >
                                        <td>{item.data().date}</td>
                                        <td>{item.data().reading}m<sup>3</sup></td>
                                        <td>₱‎{parseInt(item.data().bill).toLocaleString()}.00</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="manageCardFoot">
                        {/* <button className="delete">Delete</button> */}
                        <button onClick={closeModal} className="close">Close</button>
                    </div>
                </div>
            }
        </div>
    )
}

export default Manage;