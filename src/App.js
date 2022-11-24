import Login from '../src/pages/login'
import Register from '../src/pages/register'
import User from './pages/user';
import Admin from './pages/admin'
import { Route, Routes} from "react-router"
import { AuthContextProvider } from './context/authContext';

import './App.css';


function App() {

  return (
      <div className="main">
        <AuthContextProvider>
          <Routes>
            <Route exact path='/*' element={<User />}/>
            {/* <Route exact path='/login' element={<Login/>}/>
            <Route exact path='/register' element={<Register/>}/> */}
            <Route path='/admin/*' element={<Admin/>}/>
          </Routes>
        </AuthContextProvider>
      </div>
  );
}

export default App;
