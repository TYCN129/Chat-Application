import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../App';

const Login = () => {
  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const {setLoggedIn, setUserID, setUsername} = useContext(AppContext);

  const login = async (event) => {
    event.preventDefault();
    console.log("Calling login");

    try{
      const response = await axios.post('/login', {
        username: inputUsername,
        password: password
      });
      console.log(response.data);
      if(response.data.status === "OK") {
        console.log("Logged in successfully");
        setLoggedIn(true);
        setUsername(response.data.username);
        setUserID(response.data.userID);
        navigate('/home');
      } else {
        alert("Incorrect Password");
        setPassword("");
      }
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <div className='bg-blue-50 h-screen flex items-center'>
        <form className='w-64 mx-auto mb-12' onSubmit={login}>
            <input value={inputUsername} type='text' placeholder='Username' className='block w-full p-3 mb-3 border' onChange={(event) => {setInputUsername(event.target.value)}}/>
            <input value={password} type='password' placeholder='Password' className='block w-full p-3 mb-3 border' onChange={(event) => {setPassword(event.target.value)}}/>
            <button className='bg-white w-full text-blue-500 block rounded-md p-3 border-3 border-blue-500'>Login</button>
            <Link to='/register'> <p className='text-center mt-3 text-blue-800'>New here? Register now</p> </Link>
        </form>
    </div>
  )
}

export default Login;