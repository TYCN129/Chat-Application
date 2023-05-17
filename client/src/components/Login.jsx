import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const login = async (event) => {
    event.preventDefault();
    const response = await axios.post('/login', {
      username: username,
      password: password
    });

    if(response.data.status === "OK") {
      console.log("Logged in successfully");
      navigate('/');
    } else {
      alert("Incorrect Password");
      setPassword("");
    }
  }

  return (
    <div className='bg-blue-50 h-screen flex items-center'>
        <form className='w-64 mx-auto mb-12' onSubmit={login}>
            <input value={username} type='text' placeholder='Username' className='block w-full p-3 mb-3 border' onChange={(event) => {setUsername(event.target.value)}}/>
            <input value={password} type='password' placeholder='Password' className='block w-full p-3 mb-3 border' onChange={(event) => {setPassword(event.target.value)}}/>
            <button className='bg-white w-full text-blue-500 block rounded-md p-3 border-3 border-blue-500'>Login</button>
            <Link to='/register'> <p className='text-center mt-3 text-blue-800'>New here? Register now</p> </Link>
        </form>
    </div>
  )
}

export default Login;