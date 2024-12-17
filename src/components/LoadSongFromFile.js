import React from 'react'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import MidiParser from 'midi-parser-js';
import WebMscore from 'webmscore'
import convertAudioToMidi from '../Converter';
import { useCurrentSongState } from '../pages/hooks/useCurrentSong';
function LoadSongFromFile() {
    const [ currentSong, dispatch ] = useCurrentSongState()
    console.log(currentSong)
    const addMidiDataToCurrentSong = (midiData) => {
        dispatch({
            type: 'SET',
            value: {...currentSong, midiData: midiData}
        })
    }
    // const [fileLoading, setFileLoading] = useState(false)
    // const [bluetooth, setBluetooth] = useState()
    const [midiData, setMidiData] = useState()
    const [audioData, setAudioData] = useState()
    const [fileType, setFileType] = useState()
    // const [alert, setAlert] = useState()
    const readMidiFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const midiArrayBuffer = new Uint8Array(e.target.result);
            console.log('Converting the midi file into JSON...')
            const parsedData = MidiParser.parse(midiArrayBuffer);
            // setMidiData(parsedData);
            addMidiDataToCurrentSong(parsedData)
            // setFileLoading(false)
            // setAlert({type: 'success', message: 'Successfully converted into midi file!'})
        };
        reader.readAsArrayBuffer(file);
    }
    const readAudioFile = (file) => {
        convertAudioToMidi(file).then(([notes, fileData]) => {
            setAudioData(notes)
            // const parsedData = MidiParser.parse(fileData);
            // console.log(parsedData)
            // setFileLoading(false)
            // setAlert({type: 'success', message: 'Successfully converted into midi file!'})
        })
    }
    const readSheetMusicFile = (file) => {
        WebMscore.ready.then(async () => {
        const score = await WebMscore.load('mscz', file)
        console.log(score)
        // setFileLoading(false)
        // setAlert({type: 'success', message: 'Successfully converted into midi file!'})
        })
    }
    const handleFileChange = (event) => {
        // setAlert({type: 'info', message: 'Converting the given input file into midi...'})
        // setFileLoading(true)
        const fileInput = event.target;
        const file = fileInput.files[0];
        if (file){
            const fileExtension = file.name.split('.').slice(-1)
            setFileType(fileExtension)
            if (fileExtension == 'mid' || fileExtension == 'midi'){
                readMidiFile(file)
            } else if (fileExtension == 'mscz'){
                readSheetMusicFile(file)
            } else {
                readAudioFile(file)
            }
        }
    };
  return (
    <div>
        <TextField onChange={handleFileChange} type = "file"></TextField>
    </div>
  )
}

export default LoadSongFromFile
