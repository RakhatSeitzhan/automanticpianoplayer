import { useRef, useState } from "react"
import { processMidiData } from "./serialPlayerFunctions"
import { sendDataOverSerial } from "../../utils/serialCommunicationFunctions"
import { sendNoteOverBle } from "../../utils/bluetoothFunctions"

export function usePlayer(serial, bluetooth){
    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [startTime, setStartTime] = useState(0)
    const [midiData, setMidiData] = useState()
    const [lastTimeout, setLastTimeout] = useState()
    const events = useRef()
    const eventsStartTimeFormat = useRef()
    const [currentNote, setCurrentNote] = useState(0)
    const [ pressedNotes, setPressedNotes ] = useState([])
    const [timeScale, setTimeScale] = useState(1)
    const [sliderValue, setSliderValue] = useState(0)
    const start = () => {
        setIsPlaying(true)
        setStartTime(new Date())
        if (serial) {
            sendDataOverSerial(serial, '*0,0,14,0#')
            rescursiveMidiPlaySerial(currentNote)
        } else if (bluetooth){
            rescursiveMidiPlayBluetooth(currentNote)
        }
    }
    const reset = () => {
        setCurrentNote(0)
        setSliderValue(0)
        releaseAllNotes()
        events.current = []
        eventsStartTimeFormat.current = []
        setIsPlaying(false)
        
    }
    const stop = () => {
        releaseAllNotes()
        setIsPlaying(false)
        clearTimeout(lastTimeout)
    }
    const releaseAllNotes = () => {
        setPressedNotes([])
        sendDataOverSerial(serial, '*0,0,13,0#')
    }
    
    const setSong = (midiData) => {
        setMidiData(midiData)
        const [ev,totalTime,evStartTime] = processMidiData(midiData)
        eventsStartTimeFormat.current = evStartTime
        events.current = ev
    }
    const changeNoteBySlider = (val) => {
        stop()
        releaseAllNotes()
        const newNote = Math.floor(val/100*events.current.length)
        setSliderValue(newNote/events.current.length*100)
        setCurrentNote(newNote)
    }
    const changeTime = (newTime) =>{
        for (var i = 0; i < eventsStartTimeFormat.current.length; i++){
            if (eventsStartTimeFormat.current[i].startTime < newTime){
                continue
            } else {
                if (i != 0){
                    if (newTime - eventsStartTimeFormat.current[i].startTime > newTime - eventsStartTimeFormat.current[i-1].startTime){
                        setCurrentNote(i-1)
                    } else {
                        setCurrentNote(i)
                    }
                } else {
                    setCurrentNote(i-1)
                }
            }
        }
    }
    const trackPressedNotes = (event) => {
        if (event.type == 9){
            setPressedNotes([...pressedNotes, event.data[0]])
        } else if (event.type == 8){
            let temp = [...pressedNotes]
            const index = temp.findIndex(i => i == event.data[0])
            temp.splice(index,1)
            setPressedNotes(temp)
        } 
    }
    const nextSong = () => {

    }
    
    const rescursiveMidiPlaySerial = (index) => {
        setCurrentNote(index)
        setSliderValue(index/events.current.length*100)
        if (index >= events.current.length){
            stop()
            reset()
            nextSong()
            releaseAllNotes()
            return
        }
        const timeoutId = setTimeout(async () => {
            clearTimeout(timeoutId)
            if (index <= events.current.length-1) {    
                trackPressedNotes(events.current[index])
                sendDataOverSerial(serial,`*${events.current[index].data[0]},${events.current[index].data[1]},${ events.current[index].type},0#`)
                rescursiveMidiPlaySerial(index+1)
            }
        }, events.current[index].deltaTime*timeScale)
        setLastTimeout(timeoutId)
    } 
    const rescursiveMidiPlayBluetooth = (index) => {
        setCurrentNote(index)
        setSliderValue(index/events.current.length*100)
        const timeoutId = setTimeout(async () => {
            clearTimeout(timeoutId)
            if (index <= events.current.length-1) {
                trackPressedNotes(events.current[index])
                //ble, type, note, velocity, detlaTime
                sendNoteOverBle(bluetooth, events.current[index].type,events.current[index].data[0], events.current[index].data[1],events.current[index].deltaTime)
                // sendDataOverSerial(serial,`*${events.current[index].data[0]},${events.current[index].data[1]},${ events.current[index].type},0#`)
                rescursiveMidiPlaySerial(index+1)
            }
        }, events.current[index].deltaTime*timeScale)
        setLastTimeout(timeoutId)
    } 
    return {isPlaying, currentNote, pressedNotes,currentTime, sliderValue, changeNoteBySlider,setSong, start, stop, reset,releaseAllNotes, changeTime}
}