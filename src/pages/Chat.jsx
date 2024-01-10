import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Box } from '@mui/material'
import Message from './Message'

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const unHandleSelectUser = () => {
     setSelectedUser('')
  }
  return (
    <>
       <Navbar />
       <Box sx={{
        display: 'flex',
        gap: '10px',
        margin: '10px 0px 0 10px',
       }}>
       <Sidebar onSelectUser={handleSelectUser}/>
       <Message selectedUser={selectedUser} close={unHandleSelectUser}/>
       </Box>
       
    </>
  )
}

export default Chat
