import React from 'react'
import Button from '@mui/material/Button'
import { sendDataOverSerial } from '../utils/serialCommunicationFunctions'
import { useSerialState } from '../pages/hooks/useSerialState'
function DigitalPianoController() {
    const [serial, dispatch] = useSerialState()
    const startPlay = () => {
        sendDataOverSerial(serial, '*0,0,14,0#')
    }
    const stopPlay = () => {
        sendDataOverSerial(serial, '*0,0,13,0#')
    }
    const pedalPress = () => {
        sendDataOverSerial(serial, '*0,0,11,0#')
    }
    const pedalRelease = () => {
        sendDataOverSerial(serial, '*0,0,12,0#')
    }
    return (
        <div>
            <Button onClick={startPlay}>Start test</Button>
            <Button onClick={stopPlay}>Stop test</Button>
            <Button onMouseUp={pedalRelease} onMouseDown={pedalPress}>Pedal test</Button>
        </div>
    )
}

export default DigitalPianoController
