import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Box } from '@mui/material'
import { auth } from '../firebase';
import Message from './Message'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';

const Chat = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const unHandleSelectUser = () => {
    setSelectedUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName);
      } else {
        // If there is no user, navigate to the homepage
        navigate('/');
        toast.error('Please login first')
      }
    });

    // Cleanup function to unsubscribe from the observer when the component unmounts
    return () => unsubscribe();
  }, [navigate]);

  if (!username) {
    // If there is no user, don't render the Chat component
    return null;
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          gap: '10px',
          margin: '10px 0px 0 10px',
        }}
      >
        <Sidebar onSelectUser={handleSelectUser} />
        <Message selectedUser={selectedUser} close={unHandleSelectUser} />
      </Box>
    </>
  );
};

export default Chat
