// react imports
import { useRef, useEffect, useState } from "react"

// mui imports
import {Box, Snackbar, Alert} from "@mui/material"
import { makeStyles } from '@mui/styles'

// components imports
import {UserHeader} from "../UserHeader"
import { Message } from './Message'
import { SendMessage } from "./SendMessage"
import { NoActiveChat } from "./NoActiveChat"

// css style import
import "./chats.css"

// contexts import
import { useAuth } from "../../contexts/AuthContext"

// firebase and firebase config file import
import { onSnapshot,collection,query, orderBy, doc, updateDoc,} from "firebase/firestore"
import { db } from "../../firebase-config"

// react-router-dom imports
import { useParams } from 'react-router-dom'

// react-spinners-kit
import { CircleSpinner } from "react-spinners-kit";

const useStyles = makeStyles({
    // styles 
    root:{
        maxHeight:"100%",
        width:"70vw"
    },
    userHeaderBox:{
        width:"100%",
        zIndex:"99",
    },
    messageBox:{
        maxHeight:"85vh",
        minHeight:"85vh",
        overflowY:"auto",    
    },
    sendBox:{
        width:"100%",
        background: "#f7f7f7",
        height:"7vh",
        display:"flex",
    }
})

export const Chats = () => {
  // using mui styles
  const classes = useStyles()

  // creating the contacts array and mainUser object using the object destructing from the Auth context
  const { contacts, mainUser } = useAuth()

  // creating the roomID parameter passed with the url from react-router-dom
  const {roomId} = useParams()
  
  // state variables
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState()
  const [lastSeen, setLastSeen] = useState()
  
  // ref variables
  const endDiv = useRef(null)

  // getting the particular contact from the contacts array using the roomId params
  const contact = contacts.filter(contact => contact.id===roomId)[0]


  useEffect(()=>{
    const fetchData = async () =>{
        try{
            // using try with an async fetch function to get the contacts messages
            const q = query(collection(db,`user/${mainUser.email}/contacts/${roomId}/messages`), orderBy("timeStamp"))
            await onSnapshot(q,snapShot=>{
                const array1 = snapShot.docs.map(data=>({
                    
                    data:data.data(),
                    id:data.id
                    
                }))
                setMessages(array1)
                setLoading(false)
            })
            await onSnapshot(doc(db,"user",contact.data.sender),user=>{
                // using if and else to check the if the contact is online or their last seen
                if(user.data().lastSeen==="online"){
                    setLastSeen(user.data().lastSeen)
                }
                else{
                    setLastSeen(new Date(user.data().lastSeen?.toDate()).toUTCString())
                }
            })
        }catch(err){
            // getting the error in the case of an error
            setError(err.code)
        }
    }
    fetchData()
},[roomId])

 
  useEffect(()=>{
    if(contact && !contact.data.blocked){
        // making the chat scroll to the bottom on change of url
        endDiv.current.scrollIntoView()
        if(contact.data.unReadMessages>0){
            // changing the unread messages from whatsoever number to zero
            updateDoc(doc(db, `user/${mainUser.email}/contacts/${roomId}`),{
                unReadMessages:0
            })
        }
    }
  },[roomId])
  useEffect(()=>{
    if(contact && !contact.data.blocked){
        // making the chat scroll to the bottom on change of url
        endDiv.current.scrollIntoView()
        if(contact.data.unReadMessages>0){
            // changing the unread messages from whatsoever number to zero
            updateDoc(doc(db, `user/${mainUser.email}/contacts/${roomId}`),{
                unReadMessages:0
            })
        }
    }
  })
  

  if(contact && !contact.data.blocked){

        return (
        // render the chat component if there is a contact with the roomID and if the contact isn't blocked
        <>  
            <Box className="chats">
                <Box
                    className={classes.root}
                >
                    <Box className={classes.userHeaderBox}>
                        <UserHeader
                            user={contact.data}
                            userID={contact.id}
                            lastSeen={lastSeen}
                        />
                    </Box>
                    <Box
                        className={classes.messageBox}
                    >
                        {
                        // using conditional rendering to render a loading screen when trying to get messages
                        loading?
                            <CircleSpinner size={18} color="#686769" loading={loading} />
                            :
                            messages.map((message) =>
                                    <Message
                                        key={message.id}
                                        message={message.data}
                                    />
                                )
                            }
                         <Box sx={{float:"right", clear:"both"}} ref={endDiv}></Box>

                    </Box>
                    <Box className={classes.sendBox}>
                    <SendMessage
                        contact={contact}
                    />
                    </Box>

                </Box>
                
            </Box>
            <Snackbar
                open={error}
                autoHideDuration={3000}
                onClose={() => setError(null)}
            >
                {error&&<Alert  severity="error"sx={{ width: '100%' }}>
                    {error}
                </Alert>}
            </Snackbar>
        </>
        )
    }
    else{
        // render the noactive chat component if either fails
        return <NoActiveChat/>
    }
}
