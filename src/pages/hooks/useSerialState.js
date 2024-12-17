import { useContext } from 'react'
import { serialContext } from '../contexts/serial'

export function useSerialState() {
    const {serial, dispatch} = useContext(serialContext)
    return [serial, dispatch]
}