import { Routes, Route } from 'react-router-dom' 
import {Toaster} from 'react-hot-toast'
import './App.css'
import Login from './pages/Login'
import Chat from './pages/Chat'


function App() {
  

  return (
    <>
                   
                    <Toaster 
           position={window.innerWidth < 768 ? 'bottom-center' : 'bottom-right'}
          toastOptions={{duration: 5000}} />
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/chat' element={<Chat/>}/>
      </Routes>
    </>
  )
}

export default App
