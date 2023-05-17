import React, { useState } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const register = async (event) => {
    event.preventDefault();
    if(password === confirmPassword) {
      try{
        const response = await axios.post(`/register`,{
          username: username,
          password: password
        });

        if(response.data.status === "OK") {
          navigate('/login');
        }
      } catch(error) {
        console.log(error);
      }
    } else {
      console.log("Passwords do not match. Cannot register");
      setPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className='bg-blue-50 h-screen flex items-center'>
        <form className='w-64 mx-auto mb-12' onSubmit={register}>
            <input value={username} type='text' placeholder='Username' className='block w-full p-3 mb-3 border' onChange={(event) => {setUsername(event.target.value)}}/>
            <input value={password} type='password' placeholder='Password' className='block w-full p-3 mb-3 border' onChange={(event) => {setPassword(event.target.value)}}/>
            <input value={confirmPassword} type='password' placeholder='Confirm Password' className='block w-full p-3 mb-3 border' onChange={(event) => {setConfirmPassword(event.target.value)}}/>
            {(password !==  confirmPassword) && <p className='text-red-400 mb-3 text-center'>Passwords do not match</p>}
            <button className='bg-blue-500 w-full text-white block rounded-md p-3'>Register</button>
            <Link to='/login'> <p className='text-center mt-3 text-blue-800'>Already have an account? Login here</p> </Link>
        </form>
    </div>
  )
}

export default Register;