import { Box, Button, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import React, { useEffect, useRef, useState } from 'react'
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Message = ({ selectedUser, close }) => {
    const [message, setMessage] = useState("")
    const [incomingMessages, setIncomingMessages] = useState([])
    const [username, setUsername] = useState(null);
    const messageEndRef = useRef(null)
    let conversationId = null 
    const participants = [username, selectedUser?.name].sort()
    conversationId = participants.join('')
    let typingTimeout;

    const checkTyping = async () => {
      try {
        if (username) {
          const userSnapshot = await getDoc(doc(db, 'users', username));
    
          if (userSnapshot.exists()) {
            // Set typing to true
            await updateDoc(doc(db, 'users', username), { typing: true });
    
            // Clear the previous timeout (if any)
            clearTimeout(typingTimeout);
    
            // Set a new timeout to set typing to false after a delay (e.g., 2 seconds)
            typingTimeout = setTimeout(async () => {
              await updateDoc(doc(db, 'users', username), { typing: false });
            }, 2000); // Adjust the delay as needed
          } else {
            console.log('User document not found in Firestore');
          }
        } else {
          console.log('Username is undefined');
        }
      } catch (error) {
        console.log(error);
      }
    };

    const sendMessage = async(event) => {
        event.preventDefault()
        if(message.trim() === "" && selectedUser){
            toast.error("Enter valid message")
            return;
        }
         //add in firestore 
          await addDoc(collection(db, "conversations", conversationId, "messages"), { 
             id: username,
             sender: username,
             receiver: selectedUser?.name,
             text: message,
             createdAt: serverTimestamp()
          })
        setMessage("")
    }

    useEffect(() => {
        if(!conversationId){
            return
        }
        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "desc")
          );

        //to get the newest changes in the messages collection 
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages = [];
            querySnapshot.forEach((doc) => {
              fetchedMessages.push({ ...doc.data(), id: doc.id });
            });
            const sortedMessages = fetchedMessages.sort(
              (a, b) => a.createdAt - b.createdAt
            );
            setIncomingMessages(sortedMessages);
            
          });
        
          return () => unsubscribe();
    }, [conversationId])

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUsername(user.displayName);
        }
      });
  
      // Cleanup function to unsubscribe from the observer when the component unmounts
      return () => unsubscribe();
    }, []);

    //scroll to the latest message 
    useEffect(() => {
       messageEndRef.current?.scrollIntoView();
    }, [incomingMessages])

    const handleChange = (event) => {
         setMessage(event.target.value)
         checkTyping()
    }
    return (
      <>
        {selectedUser ? (
          <>
            <Box
              sx={{
                width: '70%',
                display: 'flex',
                gap: '10px',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
             {/*When you want to stop or change the user you are conversing with */}
              <Button sx={{ fontSize: '1.8em' }} onClick={close}>
                <ArrowCircleLeftIcon sx={{ color: 'black' }} />
              </Button>
              <Box
                sx={{
                  overflowY: 'hidden',
                  height: '523px',
                }}
              >
               {incomingMessages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent:
                            message.sender === username ? 'flex-start' : 'flex-end',
                          margin: '5px' 
                        }}
                      >
                        <Box
                          sx={{
                            width: '40%',
                            backgroundColor: 'white',
                            height: '100px',
                            padding: '5px',
                            borderRadius: '0.5em',
                          }}
                        >
                          <Typography variant="h6">
                            {message.sender}:
                          </Typography>
                          <Typography variant="p">{message.text}</Typography>
                        </Box>
                      </Box>
                    ))}
                   <div ref={messageEndRef} />
              </Box>
              <Box
              sx={{
                width: '100%',
                height: '70px',
                backgroundColor: 'blue',
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bottom: 0,
                right: 0,
                padding: '5px',
              }}
            >
              <input
                style={{
                  width: '90%',
                  padding: '10px',
                }}
                value={message}
                onChange={handleChange}
              />
              <Button onClick={sendMessage}>
                <SendIcon />
              </Button>
            </Box>
            </Box>
           
          </>
        ) : (
          <h1 style={{ margin: '300px auto' }}>Start A Chat!!</h1>
        )}
      </>
    );
    
        }
export default Message
