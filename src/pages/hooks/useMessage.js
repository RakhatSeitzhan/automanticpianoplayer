import { useContext } from 'react'
import { messageContext, messageDispatchContext } from '../contexts/message'

function useMessage() {
    const message = useContext(messageContext)
    const dispatch = useContext(messageDispatchContext)
    return [message, dispatch]
}

export default useMessage
