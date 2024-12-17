import React from 'react'
import "../styles/DigitalPiano.css"
import { useSerialState } from '../pages/hooks/useSerialState'
import { sendDataOverSerial } from '../utils/serialCommunicationFunctions'
import useMessage from '../pages/hooks/useMessage'
function DigitalPiano({ pressedNotes }) {
    const notes = Array(88).fill(0)
    const [ serial, ] = useSerialState()
    const [ message, dispatchMessage ] = useMessage()
    const handlePress = (key) => {
        if (!serial) {
            dispatchMessage({
                type: "SET",
                value: {type: 'error', text: 'Please connect to the device first!'}
            })
            return
        }
        sendDataOverSerial(serial,`*${key},127,9,0#`)
    }
    const handleRelesase = (key) => {
        if (!serial) {
            dispatchMessage({
                type: "SET",
                value: {type: 'error', text: 'Please connect to the device first!'}
            })
            return
        }
        sendDataOverSerial(serial,`*${key},127,8,0#`)
    }
    return (
        <div className='overflow-x-scroll shadow-md'>
            <div className='flex w-fit'>
                {notes.map((i, index) => {
                    const k = pressedNotes.findIndex(item => index==item)
                    const style = k != -1 ? 'keypressed' : ''
                    const rem = index%12
                    if (rem == 1 || rem == 4 || rem == 6 || rem == 9 || rem == 11)
                        return <div key = {index} onMouseUp={() => handleRelesase(index)} onMouseDown={() => handlePress(index)} className={`keyblack cursor-pointer bg-black  rounded w-6 h-20 text-white ${style}`}>{index+1}</div>
                    else return<div key = {index}  onMouseUp={() => handleRelesase(index)} onMouseDown={() => handlePress(index)}  className={`key bg-white cursor-pointer shadow-md rounded w-8 h-32 ${style}`}>{index+1}</div>
                }
                )}
            </div>
        </div>
        
    )
}

export default DigitalPiano
