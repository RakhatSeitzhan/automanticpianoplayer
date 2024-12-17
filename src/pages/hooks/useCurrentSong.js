import { useContext } from 'react'
import { currentSongContext, currentSongDispatchContext } from '../contexts/currentSong'

export function useCurrentSongState() {
    const currentSong = useContext(currentSongContext)
    const dispatch = useContext(currentSongDispatchContext)
    return [currentSong, dispatch]
}