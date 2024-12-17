import React from 'react'
import { bluetoothContext, bluetoothDispatchContext } from '../contexts/bluetooth'
export function BluetoothProviderReducer(state, action){
    switch (action.type){
        case 'SET':
            return action.value
    }
}

export function BluetoothProvider({ children, value, dispatch }) {
    return (
        <bluetoothContext.Provider value = {value}>
            <bluetoothDispatchContext.Provider value={dispatch}>
                {children}
            </bluetoothDispatchContext.Provider>
        </bluetoothContext.Provider>
    )
}
