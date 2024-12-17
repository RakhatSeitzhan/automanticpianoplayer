import React, { useReducer } from 'react'
import { AvailableSongs } from './components/AvailabeSongs';
import {BluetoothProvider, BluetoothProviderReducer} from './pages/reducers/BluetoothProvider';
import CurrentSongProvider from './pages/reducers/CurrentSongProvider';
import Player from './components/player/Player';
import {SerialProvider, SerialProviderReducer} from './pages/reducers/SerialProvider';
import "./App.css"
import MessageProvider from './pages/reducers/MessageProvider';
import DigitalPiano from './components/DigitalPiano';
import Message from './components/Message';

import { usePlayer } from './components/player/usePlayer';
import DigitalPianoController from './components/DigitalPianoController';
function App() {
    const [serial, dispatchSerial] = useReducer(SerialProviderReducer, null)
    const [bluetooth, dispatchBluetooth] = useReducer(BluetoothProviderReducer,null)
    const player = usePlayer(serial, bluetooth)
    return (
        <SerialProvider value={serial} dispatch={dispatchSerial}>
            <BluetoothProvider value = {bluetooth} dispatch={dispatchBluetooth}>
                <CurrentSongProvider>
                    <MessageProvider>
                        <main className='max-w-screen-lg mx-auto'>
                            <Message/>
                            <Player {...player}/>
                            <AvailableSongs/>
                            <br/><br/>
                            <DigitalPianoController></DigitalPianoController>
                            <DigitalPiano pressedNotes = {player.pressedNotes}/>
                        </main>
                    </MessageProvider>
                </CurrentSongProvider>
            </BluetoothProvider>
        </SerialProvider>
    )
}
export default App
