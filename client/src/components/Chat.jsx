import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import Logo from './Logo'
import axios from 'axios';
import _ from 'lodash';

const Home = () => {
  const {loggedIn, setLoggedIn, setUsername, setUserID, userID, username} = useContext(AppContext);

  const [onlinePeople, setOnlinePeople] = useState([]);
  const [ws, setWs] = useState(null);
  const [selectedPersonID, setSelectedPersonID] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const emptyDiv = useRef();

  const getAuth = async () => {
    try {
      const response = await axios.get('/');
      if(response.data.status === "OK") {
        console.log("Login status: OK");
      } else {
        navigate('/login');
      }
    } catch(error) {
      console.log(error.message);
    }
  };

  const connectToWs = () => {
    const ws = new WebSocket('ws://localhost:3001');
    setWs(ws);

    ws.addEventListener('message', (event) => {
      const messageData = JSON.parse(event.data);
      console.log(messageData);

      if('online' in messageData) {
        const dupPeople = messageData.online;
        console.log(dupPeople);
        setOnlinePeople(_.uniqBy(dupPeople, 'userID'));
      } else if('text' in messageData) {
        setMessages(prev => [...prev, {from: messageData.from, text: messageData.text, to: userID}]);
        console.log(messages);
      }
    });

    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect...");
        connectToWs();
      })
    }, 2000);
  }

  const sendMessage = (event) => {
    event.preventDefault();
    
    ws.send(JSON.stringify({
      text: newMessage,
      to: selectedPersonID,
      from: userID
    }));
    
    setMessages(prev => [...prev, {to: selectedPersonID, text: newMessage, from: userID}]);
    setNewMessage("");
  }

  const getMessages = async () => {
    try {
      const response = await axios.get(`/messages/${selectedPersonID}`);

      setMessages(_.uniqBy(response.data.messages, '_id'));
    } catch(error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    if(!loggedIn) {
      getAuth();
    }
    connectToWs();
  }, []);

  useEffect(() => {
    const div = emptyDiv.current;
    if(div) {
      div.scrollIntoView({behavior: 'smooth'});
    }
  }, [messages]);

  useEffect(() => {
    if(selectedPersonID !== null) {
      getMessages();
    }
  }, [selectedPersonID])

  return (
    <div className='flex h-screen'>
      <div className='bg-blue-50 w-1/4 p'>
        <Logo />
        {onlinePeople.map(person => userID !== person.userID && (
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
        <div className='overflow-y-scroll flex-grow'>
          {!!selectedPersonID && (
            messages.map(message => (message.to === selectedPersonID || message.from === selectedPersonID) && (
            <div className={(message.from === userID ? 'text-right' : 'text-left')}>
              <div className={'text-left inline-block rounded-md py-2 px-3 m-2 ' + (message.from === userID ? 'bg-blue-500 text-white' : 'bg-white text-blue-600')}>
                {message.text}
              </div>
            </div>
          )))}
          <div ref={emptyDiv}></div>
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