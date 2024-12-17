import React from 'react'
import { serialContext } from '../contexts/serial'

export function SerialProviderReducer(state, action){
    switch (action.type){
        case 'SET':
            return action.value
    }
}

export function SerialProvider({ children, value, dispatch }) {
    return (
        <serialContext.Provider value = {{serial: value, dispatch: dispatch}}>
            {children}
        </serialContext.Provider>
    )
}