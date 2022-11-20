import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'
import '../Auth.css'
import { useSelector, useDispatch } from "react-redux";
import { setUserState } from "../actions";
import { UserAuth } from "../context/authContext";
import { db } from "../firebase-config";
import { collection,getDocs, query, where, } from "firebase/firestore";

function Login() {

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loginUser } = UserAuth(); 
    const user = useSelector(state => state.user);

    const onSubmit = async (e) => {
        e.preventDefault();

        if(!email.trim() || !password.trim()){
            alert('Please fill all fields')
            return
        }
        try {
            const newUser = await loginUser(email, password);
            const q = query(collection(db, "users"), where("id", "==", newUser.user.uid));
            const querySnapshot = getDocs(q);
            querySnapshot.then((snapshot) => {
                let count = 0;
                let userType = "Admin";
                snapshot.forEach((doc) => {
                    if (doc.data().id === newUser.user.uid) {
                        dispatch(setUserState({newUser, userType}));
                        navigate('/');
                        count++;
                    }
                });
                if (count === 0) {
                    alert('User not found');
                }   
            });
        } catch (error) {
            alert(error.message);
        }

    }

    useEffect(() => {
        if(user.isLogin && user.type === "Admin"){
                  navigate('/');
        }
    }, []);

    return (
        <div className='loginPanel'>
          <h1>Login</h1>
          <form>
            <div className="formItem">
            <label>Email</label>
            <input type="text" id='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="formItem">
            <label>Password</label>
            <input type="password" id='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <button onClick={ onSubmit} type="submit">Login</button>
            <Link to={'/register'}> <button>Register</button> </Link>
          </form>

        </div>
    )
}

export default Login;