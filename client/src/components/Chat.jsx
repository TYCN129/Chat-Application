import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { json, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import Logo from './Logo'
import arrayUniq from 'array-uniq';
import axios from 'axios';
import _ from 'lodash';

const Home = () => {
  const {logout, loggedIn, setLoggedIn} = useContext(AppContext);

  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState();

  const [onlinePeople, setOnlinePeople] = useState([]);
  const [ws, setWs] = useState(null);
  const [selectedPersonID, setSelectedPersonID] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const getAuth = async () => {
    try {
      const response = await axios.get('/');
      if(response.data.status === "OK") {
        setLoggedIn(true);
        setUsername(response.data.username);
        setUserID(response.data.userID);
      } else {
        navigate('/login');
      }
    } catch(error) {
      console.log(error.message);
    }
  };

  const initMessages = async () => {
    console.log("user id is: " + userID);
    const response = await axios.get('/loadChats', {
      userID: userID
    });

    if(response.data.status === "OK") {
      setMessages([...messages, response.data.messages.filter(message => (message.from === userID || message.to === userID))]);
      console.log(messages);
    }
  }

  useEffect(() => {
    getAuth();

    const ws = new WebSocket('ws://localhost:3001');
    setWs(ws);

    ws.addEventListener('message', (event) => {
      const messageData = JSON.parse(event.data);
      console.log(messageData);
      if('online' in messageData) {
        const dupPeople = messageData.online;
        
        // const people = dupPeople.reduce((accumulator, currentValue) => {
        //   if (!accumulator.includes(currentValue)) {
        //     accumulator.push(currentValue);
        //   }
        //   return accumulator;
        // }, []);
        
        setOnlinePeople(_.uniqBy(dupPeople, 'userID'));
        console.log(dupPeople);
        console.log(arrayUniq(dupPeople));
      } else {
        setMessages([...messages, {from: messageData.from, text: messageData.text, to: userID}]);
        console.log(messages);
      }
    });

    initMessages();
  }, [selectedPersonID]);

  const sendMessage = (event) => {
    event.preventDefault();
    
    ws.send(JSON.stringify({
      text: newMessage,
      to: selectedPersonID,
      from: userID
    }));

    setMessages([...messages, {to: selectedPersonID, text: newMessage, from: userID}])
    setNewMessage("");
  }

  return (
    <div className='flex h-screen'>
      <div className='bg-blue-50 w-1/4 p'>
        <Logo />
        {onlinePeople.map(person => username !== person.username && (
          <div onClick={() => setSelectedPersonID(person.userID)} className={'flex items-center gap-2 cursor-pointer ' + (person.userID === selectedPersonID ? 'bg-blue-200' : '')}>
            {person.userID === selectedPersonID && <div className='w-1.5 bg-blue-500 h-12 rounded-r-lg'></div>}
            <div className='flex items-center gap-3 pl-3'>
              <Avatar username={person.username} userID={person.userID} />
              <div className='border-b border-gray-200 py-3'>{person.username}</div>
            </div>
          </div>
        ))}
      </div>
      <div className='bg-blue-200 flex flex-col w-3/4 px-2'>
        {!selectedPersonID && <div className='flex h-full items-center justify-center'>
          <div className='text-gray-400 text-3xl'>&larr; Select a contact</div>
        </div>}
        <div className='m-5 bg-blue-50 p-3 rounded-md'>
          {!!selectedPersonID && messages.map(message => (message.to === selectedPersonID || message.from === selectedPersonID) && (
            <div className={' ' + message.isOur ? 'justify-end' : ''}>
              {message.text}
            </div>
          ))}
        </div>
        {!!selectedPersonID && (
        <form onSubmit={sendMessage}>
          <div className='flex m-5'>
            <input onChange={(event) => setNewMessage(event.target.value)} value={newMessage} type='text' placeholder='Message…' className='border w-64 rounded-md p-3 flex-grow' />
            <button className='bg-blue-500 w-20 ml-3 rounded-md'>Send</button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}

export default Home;