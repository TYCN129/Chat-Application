import React, { createContext, useState } from 'react';
import Register from './components/Register';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const [userID, setUserID] = useState("");

  return (
    <AppContext.Provider value={{setLoggedIn, loggedIn, setUsername, setUserID, userID, username}}>
    <div className='App'>
      <Router>

        <Routes>
          <Route path='/' element={<Navigate to='/login' />} />
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