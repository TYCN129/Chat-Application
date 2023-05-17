import React from 'react';
import Register from './components/Register';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import axios from 'axios';
import Home from './components/Home';

export const backend = `http://localhost:3001`;
const tempVar = "Making a temporary variable";

const App = () => {
  axios.defaults.baseURL = backend;
  axios.defaults.withCredentials = true;

  return (
    <div className='App'>
      <Router>

        <Routes>
          <Route path='/' Component={Home} />
          <Route path='/register' Component={Register} />
          <Route path='/login' Component={Login} />
        </Routes>
      </Router>
    </div>
  )
}

export default App