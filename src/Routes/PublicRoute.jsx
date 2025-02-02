import React from 'react'
import { Navigate} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const PublicRoute = ({children}) => {
    const {mainUser} = useAuth()
  
    return !mainUser ? children : <Navigate to="/chats"/>
}
