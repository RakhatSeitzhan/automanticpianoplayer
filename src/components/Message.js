import React, { useEffect } from 'react'
import Alert from '@mui/material/Alert';
import useMessage from '../pages/hooks/useMessage';
function Message() {
    const [message,] = useMessage()
    useEffect(() => {}, [message])
    return (
        <div key ={message.id} className='Message'>
            <Alert  severity={message.type}>{message.text}</Alert>
        </div>
    )
}

export default Message
