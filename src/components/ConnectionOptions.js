import React from 'react'
import BluetoothRoundedIcon from '@mui/icons-material/BluetoothRounded';
import UsbRoundedIcon from '@mui/icons-material/UsbRounded';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useBluetoothState } from '../pages/hooks/useBluetoothState';
import { useSerialState } from '../pages/hooks/useSerialState';
import useMessage from '../pages/hooks/useMessage';

import { connectBluetooth } from '../utils/bluetoothFunctions'
import { connectSerial } from '../utils/serialCommunicationFunctions';

function ConnectionOptions() {
    const [ bluetooth, dispatchBluetooth ] = useBluetoothState()
    const [ serial, dispatchSerial ] = useSerialState()
    const [ message, dispatchMessage ] = useMessage()
    const serialOptions = { baudRate: 19200 }
    const MIDI_SERVICE_UUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
    const MIDI_CHARACTERISTIC_UUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';

    const handleSerialConnect = () => {
        connectSerial(serialOptions).then(data => {
            dispatchSerial({
                type: "SET",
                value: data
            })
        }).catch(err => {
            const errorMessage = err.message.split(':')[1]
            dispatchMessage({
                type: "SET",
                value: {type: 'error', text: errorMessage}
            })
        })
    }
    const handleBluetoothConnect = () => {
        connectBluetooth(MIDI_SERVICE_UUID, MIDI_CHARACTERISTIC_UUID).then(data => {
            if (data){
                dispatchBluetooth({
                    type: "SET",
                    value: data
                })
            } 
        }).catch(err => {
            dispatchMessage({type: "SET", value: {type:"error", text: err.message}})
        })
    }
    
    return (
        <div>
            <Tooltip title = 'Connect by Bluetooth'>
                <IconButton onClick={handleBluetoothConnect}>
                    <BluetoothRoundedIcon fontSize='medium'></BluetoothRoundedIcon>
                </IconButton>
            </Tooltip>
            <Tooltip title = 'Connect by USB'>
                <IconButton onClick={handleSerialConnect}>
                    <UsbRoundedIcon fontSize='medium'></UsbRoundedIcon>
                </IconButton>
            </Tooltip>
        </div>
    )
}

export default ConnectionOptions
