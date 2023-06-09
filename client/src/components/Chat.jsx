import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import Logo from './Logo'
import axios from 'axios';
import _ from 'lodash';

const Home = () => {
  const {loggedIn, userID, setUserID, setUsername, setLoggedIn} = useContext(AppContext);

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

  const connectToWs = () => {
    const ws = new WebSocket('ws://localhost:3001');
    setWs(ws);

    ws.addEventListener('message', (event) => {
      const messageData = JSON.parse(event.data);
      console.log(messageData);

      if('online' in messageData) {
        const dupPeople = messageData.online;
        console.log(dupPeople);
        setOnlinePeople(_.uniqBy(dupPeople, 'username'));
      } else if('text' in messageData) {
        setMessages(prev => [...prev, {from: messageData.from, text: messageData.text, to: userID}]);
      } else if('file' in messageData) {
        setMessages(prev => [...prev, {from: messageData.from, file: messageData.file, to: userID}]);
      }
    });

    ws.addEventListener('close', () => {
      ws.close();
      if(loggedIn) {
        setTimeout(() => {
          console.log("Disconnected. Trying to reconnect...");
          connectToWs();
        }, 2000);
      } else {
        console.log("User logged out. Closing websocket connection");
        setWs(null);
        navigate('/login');
      }
    });
  }

  const sendMessage = (event, file) => {
    if(event) {
      event.preventDefault();
    }

    if(file) {
      ws.send(JSON.stringify({
        to: selectedPersonID,
        from: userID,
        file: file,
      }));
      getMessages();
    } else { 
      ws.send(JSON.stringify({
        text: newMessage,
        to: selectedPersonID,
        from: userID,
      }));
      setMessages(prev => [...prev, {to: selectedPersonID, text: newMessage, from: userID}]);
    }

    setNewMessage("");
  }

  const getMessages = async () => {
    try {
      const response = await axios.get(`/messages/${selectedPersonID}`);

      setMessages(_.uniqBy(response.data.messages, '_id'));
      console.log(response.data.messages);
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
  }, [selectedPersonID]);

  const sendFile = (event) => {
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        filename: event.target.files[0].name,
        data: reader.result,
      });
    };

    console.log("file sent");
  }

  const logout = async () => {
    const response = await axios.post('/logout');
    if(response.data.status === "OK") {
      setLoggedIn(false);
      navigate('/login');
    }
  }

  return (
    <div className='flex h-screen'>
      <div className='bg-gradient-to-br to-blue-500 from-black via-blue-900 animate-gradient-x w-1/4 flex flex-col text-white'>
        <div className='flex-grow'>
          <div className='mx-auto'>
            <Logo />
          </div>
          <div className='overflow-y-scroll'>
            {onlinePeople.map(person => userID !== person.userID && (
              <div onClick={() => setSelectedPersonID(person.userID)} className={'border-b border-gray-400/75 py-1 flex items-center gap-2 cursor-pointer ' + (person.userID === selectedPersonID ? 'bg-blue-800' : '')}>
                {person.userID === selectedPersonID && <div className='w-1 bg-white h-12 rounded-r-lg'></div>}
                <div className='flex items-center gap-3 pl-3'>
                  <Avatar username={person.username} userID={person.userID} />
                  <div className='py-3'>{person.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='w-3/4 mb-5 mx-auto'>
          <button onClick={logout} className='bg-blue-800 w-full text-white block rounded-md p-2 border border-white transition duration-200 hover:font-semibold hover:bg-white hover:text-blue-600 hover:border hover:border-blue-500'>Logout</button>
        </div>
      </div>
      <div className='bg-gradient-to-br from-blue-400 to-blue-200 via-blue-300 animate-gradient-x flex flex-col w-3/4 px-2'>
        {!selectedPersonID && <div className='flex h-full items-center justify-center'>
          <div className='text-white text-3xl'>&larr; Select a contact</div>
        </div>}
        <div className='overflow-y-scroll flex-grow'>
          {!!selectedPersonID && (
            messages.map(message => (message.to === selectedPersonID || message.from === selectedPersonID) && (
            <div className={(message.from === userID ? 'text-right' : 'text-left')}>
              {message.text && (
                <div className={'text-left inline-block rounded-md py-2 px-3 m-2 ' + (message.from === userID ? 'bg-blue-600 text-white' : 'bg-white text-blue-600')}>
                  {message.text}
                </div>
              )} 
              {message.file && (
                <div className={'text-left inline-block rounded-md py-2 px-3 m-2 underline ' + (message.from === userID ? 'bg-blue-600 text-white' : 'bg-white text-blue-600')}>
                  <div className='flex gap-2 items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <a href={axios.defaults.baseURL + '/uploads/' + message.file.pathname} target='_blank' rel='noreferrer'>{message.file.name}</a>
                  </div>
                </div>
              )}
            </div>
          )))}
          <div ref={emptyDiv}></div>
        </div>
        {!!selectedPersonID && (
          <div className=''>
            <form onSubmit={sendMessage}>
              <div className='flex p-5 gap-2'>
                <input onChange={(event) => setNewMessage(event.target.value)} value={newMessage} type='text' placeholder='Message…' className='border w-64 rounded-md p-3 flex-grow' />
                <label className='px-3 bg-white border border-blue-200 rounded-md text-blue-500 flex items-center cursor-pointer'>
                  <input type='file' className='hidden' onChange={sendFile}/>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                  <path fill-rule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clip-rule="evenodd" />
                  </svg>
                </label>
                <button type='submit' className='bg-blue-600 px-3 text-white rounded-md'>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home;