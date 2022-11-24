import { db } from "../../firebase-config";
import { collection,getDocs, query, where, } from "firebase/firestore";
import { UserAuth } from "../../context/authContext";
import { useState, useEffect} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Approval() {
    const [data, setData] = useState([]);
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const { approveCustomer } = UserAuth();

    useEffect( () => {
        if(!user.isLogin){
            navigate('/login');
        }
        else if(user.type !== "Admin") {
                    navigate('/login');
        }
        if(user.isLogin && user.type === "Admin"){
            getCustomer();
        }
    },
    []);
    const getCustomer = () => {
         const q = query(collection(db, "customers"), where("approve", "==", false));
         const querySnapshot = getDocs(q);
         querySnapshot.then((snapshot) => {
             snapshot.forEach((doc) => {
                setData((data) => [...data, doc]);
             });
         });
     }
     const onApproveCustomer = (customerId, i) => {
        approveCustomer(customerId);
        alert("Customer Approved Successfully");
        setData(oldArray => {
            return oldArray.filter((value, index) => index !== i)
          })

     }
    return (
        <div className="approveContainer">
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Purok</th>
                            <th>confirm?</th>
                        </tr>
                    </thead>
                    <tbody>
                    {data && data.map((item, i) => (
                        <tr key={i} >
                            <td>{item.data().id.substring(1, 6)}</td>
                            <td>{item.data().fullname}</td>
                            <td>{item.data().contact}</td>
                            <td>{item.data().email}</td>
                            <td>{item.data().address}</td>
                            <td>
                                <button onClick={() => onApproveCustomer(item.id, i)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Approval;