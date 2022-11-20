import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector,useDispatch } from "react-redux";
import { setUserState } from "../../actions";
import { UserAuth } from "../../context/authContext";

function Register() {

    const [ password, setPassword ] = useState('')
    const [ fullname, setFullname ] = useState('')
    const [ address, setAddress ] = useState('')
    const [ email, setEmail ] = useState('')
    const [ contact, setContact ] = useState('')
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { createUser, createCustomerToFirestore } = UserAuth(); 
    const user = useSelector(state => state.user);
    const onSubmit = async (e) => {
        e.preventDefault()
        if(!password.trim() || !fullname.trim() || !address.trim() || !email.trim() || !contact.trim()){
            alert('Please fill all fields')
            return
        }
        if(password.length < 6){
            alert('Password must be at least 6 characters');
            return;
        }
        try {
          const newUser = await createUser(email, password);
          await createCustomerToFirestore(fullname, email, address, contact, newUser);
          let userType = "Customer";
          dispatch(setUserState({newUser, userType}));
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    }

    useEffect(() => {
        if(user.isLogin && user.type === 'Customer'){
                    navigate('/');
        }
    }, []);

    return (
        <div className='customerLoginPanel customer-register'>
          
          <h1>Register</h1>
          <form onSubmit={ onSubmit}>
            <div className="formItem">
            <label>Full Name</label>
            <input type="text" id='name' value={ fullname } onChange={(e) => setFullname(e.target.value)}/>
            </div>
            <div className="formItem">
            <label>Purok</label>
            <input type="text" id='address' value={ address } onChange={(e) => setAddress(e.target.value)}/>
            </div>
            <div className="formItem">
            <label>Contact Number</label>
            <input type="text" id='contact' value={ contact } onChange={(e) => setContact(e.target.value)}/>
            </div>
            <div className="formItem">
            <label>Email</label>
            <input type="text" id='email' value={ email } onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="formItem">
            <label>Password</label>
            <input type="password" id='password' value={ password } onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <button>Register</button>
            <Link to={'/login'}> <button>Login</button> </Link>
          </form>

          
        </div>
    )
}

export default Register;