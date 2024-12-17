import React, { useReducer } from 'react'
import { currentSongContext, currentSongDispatchContext } from '../contexts/currentSong'

function reducer(state, action){
    switch (action.type){
        case 'SET':
            return action.value
    }
}

function CurrentSongProvider({ children }) {

    const [currentSong, dispatch] = useReducer(reducer, {})
    return (
        <currentSongContext.Provider value = {currentSong}>
            <currentSongDispatchContext.Provider value={dispatch}>
                {children}
            </currentSongDispatchContext.Provider>
        </currentSongContext.Provider>
    )
}

export default CurrentSongProvider
