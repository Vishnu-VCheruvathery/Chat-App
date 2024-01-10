import React, { useEffect, useState } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout';
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);     

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName);
      }
    });

    // Cleanup function to unsubscribe from the observer when the component unmounts
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      if (username) {
        const userSnapshot = await getDoc(doc(db, 'users', username));
        
        if (userSnapshot.exists()) {
          await updateDoc(doc(db, 'users', username), { status: false });
        } else {
          console.log('User document not found in Firestore');
        }
      } else {
        console.log('Username is undefined');
      }

      await signOut(auth);
      navigate('/');
      toast.success('Logged out');
    } catch (error) {
      console.log(error);
    }
  };
  

  
  return (
    <Box sx={{
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '70px',
      paddingLeft: '10px',
      paddingRight: '10px'
    }}>
       <Box sx={{
        width: {xs: '60%', md:'55%'},
        display: 'flex',
        justifyContent: 'flex-end',
       }}>
       <Typography variant='h4' sx={{fontWeight: 700}}>ChatApp</Typography>
       </Box>
       <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
       }}>
       <Tooltip title='Current User'>
       <Typography sx={{cursor: 'pointer'}} variant='h6'>{username}</Typography>
       </Tooltip>
       <Button onClick={logout}>
      <Tooltip title='Logout'>
      <LogoutIcon sx={{
          color: 'white'
        }}/>
      </Tooltip>
     
      </Button>
       </Box>
      
    </Box>
  )
}

export default Navbar
