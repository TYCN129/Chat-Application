import React, { createContext, useEffect, useState } from 'react';
import Register from './components/Register';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import axios from 'axios';
import Home from './components/Chat';

export const backend = `http://localhost:3001`;
export const AppContext = createContext();

const App = () => {
  axios.defaults.baseURL = backend;
  axios.defaults.withCredentials = true;

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState();

  const logout = async () => {
    try {
      const response = await axios.get('/logout');
      if(response.data.status === "OK") {
        setLoggedIn(false);
      }
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <AppContext.Provider value={{setLoggedIn, loggedIn, logout, setUsername, setUserID}}>
    <div className='App'>
      <Router>

        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </Router>
    </div>
    </AppContext.Provider>
  )
}

export default App