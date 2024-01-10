import { Avatar, Box, Button, Stack, Tooltip, Typography } from '@mui/material'
import {People, PersonSearch, ArrowBack, Circle} from '@mui/icons-material'
import React, { useCallback, useEffect,useRef,useState } from 'react'
import { getFirestore, collection, getDocs, getDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

const Sidebar = ({onSelectUser}) => {
  const [users, setUsers] = useState([]);
  const [view, setView] = useState(true)
  const [searchUsers, setSearchUsers] = useState([]);
  const [username, setUsername] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getAllUser = useCallback(() => {
    try {
      const q = collection(db, 'users');
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usernames = querySnapshot.docs.map(doc => doc.data());
        const filteredUsers = usernames.filter(user => user.name !== username);
        console.log(filteredUsers)
        setUsers(prevUsers => [...filteredUsers]);
      });
  
      // Return the unsubscribe function to clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
    }
  }, [username]);

  const getUser = async () => {
    try {
      //to find the user that matches the searchTerm
      const q = query(collection(db, 'users'), where('name', '==', searchTerm));
      const querySnapshot = await getDocs(q);
      const userResults = querySnapshot.docs.map(doc => doc.data());
      if(userResults.length === 0){
        toast.error('Not Found')
      }
      setSearchUsers(userResults);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Check if the username is set before calling getAllUser
    if (username) {
      getAllUser();
    }
  }, [username, getAllUser]);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName);
      }
    });

    // Cleanup function to unsubscribe from the observer when the component unmounts
    return () => unsubscribe();
  }, []);
  return (
   
      <Box sx={{
      backgroundColor: 'white',
      height: '650px',
      width: '30%'
    }}>
       
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        padding: '10px'
      }}>
        <div style={{
          display: 'flex'
        }}>
          <People sx={{
            fontSize: '1.8em'
          }} />
          <Typography variant='h5' sx={{ fontWeight: 700 }}>Friends</Typography>
        </div>
        <div style={{
          display: 'flex',
          width: '80%'
        }}>
          <input style={{
            width: '90%'
          }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Tooltip title='search'>
            <Button onClick={getUser}>
              <PersonSearch />
            </Button>
          </Tooltip>
        </div>
      </Box>
      <Stack sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        gap: '10px'
      }}>
  
        {searchUsers.length > 0 ? (
          <>
            <Button onClick={() => setSearchUsers([])}>
              <ArrowBack />
            </Button>
            {searchUsers.map((u) => (
              <Link
                style={{ textDecoration: 'none', color: 'black' }}
                to={`/chat`}
                key={u.name}
                onClick={() => onSelectUser(u)}
              >
                <Box
                  sx={{
                    width: { xs: '85%', md: '95%' },
                    border: '1px solid gray',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Typography variant="h5">{u.name}</Typography>
                    {u.typing ? (<Typography variant='subtitle2'>Typing....</Typography>) : null}
                  </div>
  
                  {u.status === true ? (
                    <Tooltip title='Online'>
                      <Circle style={{ fontSize: '0.8em', color: 'green' }} />
                    </Tooltip>
                  ) : null}
                </Box>
              </Link>
            ))}
          </>
        ) : (
          <>
            {users.map((user) => (
              <Link
                style={{ textDecoration: 'none', color: 'black' }}
                to={`/chat`}
                key={user.name}
                onClick={() => onSelectUser(user)}
              >
                <Box
                  sx={{
                    width: { xs: '85%', md: '95%' },
                    border: '1px solid gray',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                 <div style={{display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center'}}>
                 <Avatar src={user.avatar} />
                  <div>
                    <Typography variant="h5">{user.name}</Typography>
                    {user.typing ? (<Typography variant='subtitle2'>Typing....</Typography>) : null}
                  </div>
  
                 </div>
                  {user.status === true ? (
                    <Tooltip title='Online'>
                      <Circle style={{ fontSize: '0.8em', color: 'green' }} />
                    </Tooltip>
                  ) : null}
                </Box>
              </Link>
            ))}
          </>
        )}
  
      </Stack>
    </Box>
    
  );
}  

export default Sidebar
