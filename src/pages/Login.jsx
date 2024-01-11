import React, { useState } from 'react'
import {Box, Button, TextField, Typography} from '@mui/material'
import {auth,  db, storage} from '../firebase'
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from 'firebase/auth'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {  doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const blankPfp = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/340px-Default_pfp.svg.png'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")
  const [image, setImage] = useState(null)
  
//SignIn function 
   const signIn = async () => {
    if(username !== '' && password !== '' ){
      const imageFolderRef = ref(storage, `user-avatars/${image ? image.name : username}`) //store in firebase storage
      try {
        await uploadBytes(imageFolderRef, image)
        const imageUrl = await getDownloadURL(imageFolderRef); //get image Url to store in firestore 
        const userCredential = await createUserWithEmailAndPassword(auth, `${username}@example.com`, password);
        await updateProfile(userCredential.user, { displayName: username });
        await setDoc(doc(db, 'users', username), { name: username, status: false, typing: false, avatar: imageUrl || blankPfp });
        toast.success(`Register Successful`);
      } catch (error) {
        console.log(error);
        toast.error('Username already taken')
      }
    } else {
      toast.error('Please fill the required fields')
    }
   
  }

  //Login function 
  
  const login = async () => {
    if(username !== '' && password !== '' ){
    try {
      // Query Firestore to find the user document with the entered username
      const userSnapshot = await getDoc(doc(db, 'users', username));
     
      // Check if the document exists
      if (userSnapshot) {
        // Document exists, proceed with authentication
        const userCredential = await signInWithEmailAndPassword(
          auth,
          `${username}@example.com`, // Assuming the user document has an 'email' field
          password
        );
  
        // Update the user status in Firestore
        await updateDoc(doc(db, 'users', username), { status: true, typing: false });
  
        toast.success(`Welcome ${username}`);
        navigate('/chat');
      } else {
        // Document doesn't exist, handle the error
        toast.error('User not found');
      }
    } catch (error) {
      console.error(error);
      toast.error('User or password invalid');
    }
  }else {
    toast.error('Please fill the required fields')
  }
  };
  

  
  return (
    <Box sx={{
      width: { xs: '50%', md: '20%' },
      backgroundColor: 'black',
      height: '300px',
      margin: '150px auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '0.5em',
      color: 'white',
      opacity: '0.8',
      padding: '20px',
      gap: '5px'
    }}>
     
      <Typography variant='h6'>Username:</Typography>
      <TextField
        type='text'
        sx={{
          width: '90%',
          border: '1px solid gray',
          backgroundColor: 'white',
          opacity: '0.8',
          color: 'black',
          borderRadius: '0.2em',
          fontSize: '1.2em',
        }}
        required
        onChange={(e) => setUsername(e.target.value)}
      />
      <Typography variant='h6'>Password:</Typography>
      <TextField
        type='password'
        sx={{
          width: '90%',
          border: '1px solid gray',
          backgroundColor: 'white',
          opacity: '0.8',
          color: 'black',
          borderRadius: '0.2em',
          fontSize: '1.2em',
          marginBottom: '10px'
        }}
        required
        onChange={(e) => setPassword(e.target.value)}
      />
    
     
      <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
      Upload file
      <VisuallyHiddenInput
      type="file"   
      accept='.jpeg, .png, .jpg'
       onChange={(e) => setImage(e.target.files[0])} />
    </Button>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
     
      <Button onClick={signIn}>SIGN-IN</Button>
      <Button onClick={login}>LOG-IN</Button>
    </div>
    </Box>
  );
}

export default Login
