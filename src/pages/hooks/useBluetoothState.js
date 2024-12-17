import { useContext } from 'react'
import { bluetoothContext, bluetoothDispatchContext } from '../contexts/bluetooth'

export function useBluetoothState() {
    const bluetooth = useContext(bluetoothContext)
    const dispatch = useContext(bluetoothDispatchContext)
    return [bluetooth, dispatch]
}