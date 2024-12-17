import React, { useReducer } from 'react'
import { messageContext, messageDispatchContext } from '../contexts/message'

function reducer(state, action){
    switch (action.type){
        case 'SET':
            return {...action.value, id: state.id+1}
    }
}

function MessageProvider({ children }) {

    const [message, dispatch] = useReducer(reducer, {type: '', text: '',id: 0})
    return (
        <messageContext.Provider value = {message}>
            <messageDispatchContext.Provider value={dispatch}>
                {children}
            </messageDispatchContext.Provider>
        </messageContext.Provider>
    )
}

export default MessageProvider
