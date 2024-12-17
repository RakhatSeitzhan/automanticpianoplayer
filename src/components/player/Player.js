import React, { useEffect, useState } from 'react'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';

import { useCurrentSongState } from '../../pages/hooks/useCurrentSong';
import MidiParser from 'midi-parser-js';

import { getStorageFileBytes } from '../../utils/firebaseUtils';
import { useSerialState } from '../../pages/hooks/useSerialState';
import { useBluetoothState } from '../../pages/hooks/useBluetoothState';
// import { usePlayer } from './serialPlayerFunctions';
import { usePlayer } from './usePlayer';

import ConnectionOptions from '../ConnectionOptions';

import Slider from '@mui/material/Slider';
import { useTheme } from '@mui/material/styles';
import useMessage from '../../pages/hooks/useMessage';

export default function Player({currentNote,pressedNotes, sliderValue, changeNoteBySlider, setSong, isPlaying, start, stop, reset}) {
    const [ currentSong ] = useCurrentSongState()
    const [ serial, serialDispatch ] = useSerialState()
    const [ bluetooth, bluetoothDispatch ] = useBluetoothState()
    const [ mesesage, dispatchMessage ] = useMessage() 
    const [ readyToPlay, setReadyToPlay ] = useState(false)
    const downloadSong = async () => {
        const queryRes = await getStorageFileBytes(currentSong.midiFileSrc)
        const midiDataRaw = new Uint8Array(queryRes)
        let midiData = MidiParser.parse(midiDataRaw)
        setSong(midiData)
        setReadyToPlay(true)
    }
    useEffect(() => {
        setReadyToPlay(false)
        if (currentSong.midiFileSrc){
            reset()
            downloadSong()
        } 
        if (currentSong.midiData){
            // if there is already midiData in the currentSong,
            // the midi file was loaded directly in to the websites
            setSong(currentSong.midiData)
            setReadyToPlay(true)
        }
    },[currentSong])
    const play = async () => {
        if (!serial && !bluetooth) {
            dispatchMessage({
                type: "SET",
                value: {type: 'error', text: "Please connect to the device first!"}
            })
            return
        }  
        if (readyToPlay) {
            start()
        }
    }

    const theme = useTheme();
    return (
        <div className='border-b'>
            <div className='flex justify-center items-center gap-16'>
                <div className='flex items-center'>
                    <Tooltip title = 'Previous song'>
                        <IconButton>
                            <FastRewindRoundedIcon />
                        </IconButton>
                    </Tooltip>
                    
                    {isPlaying ? 
                    <Tooltip title = 'Stop'>
                        <IconButton onClick={stop}  disabled = {!currentSong || !readyToPlay}>
                            <StopRoundedIcon />
                        </IconButton>
                    </Tooltip> 
                    : 
                    <Tooltip title = 'Play'>
                        <IconButton onClick={play}  disabled = {!currentSong || !readyToPlay}>
                            <PlayArrowRoundedIcon />
                        </IconButton>
                    </Tooltip>
                    }
                
                    <Tooltip title = 'Next song'>
                        <IconButton>
                            <FastForwardRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </div>
                <div className='flex gap-2 items-center'>
                    {currentSong.coverpic ? 
                    <img src = {currentSong.coverpic} className='rounded-sm w-12 h-12'/> 
                    :
                    <div className='flex items-center justify-center bg-zinc-100 w-12 h-12'>
                        <MusicNoteRoundedIcon/>
                    </div>
                    }
                    
                    <div className='flex flex-col w-96 items-center'>
                        {currentSong.title && <span style={{fontSize:"0.8rem"}}>{currentSong.title}</span>}
                        {currentSong.artist && <span style={{fontSize:"0.8rem"}}>{currentSong.artist}</span>}
                        <Slider 
                            aria-label="Volume" 
                            disabled = {!currentSong.title}
                            value={sliderValue} 
                            onChange={e => changeNoteBySlider(e.target.value)} 
                            style={{padding: "0px 0px"}}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                                height: 4,
                                '& .MuiSlider-thumb': {
                                  width: 8,
                                  height: 8,
                                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                  '&::before': {
                                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                                  },
                                  '&:hover, &.Mui-focusVisible': {
                                    boxShadow: `0px 0px 0px 8px ${
                                      theme.palette.mode === 'dark'
                                        ? 'rgb(255 255 255 / 16%)'
                                        : 'rgb(0 0 0 / 16%)'
                                    }`,
                                  },
                                  '&.Mui-active': {
                                    width: 20,
                                    height: 20,
                                  },
                                },
                                '& .MuiSlider-rail': {
                                  opacity: 0.28,
                                },
                              }}
                        />
                    </div>
                </div>
                <div>
                    <ConnectionOptions></ConnectionOptions>
                </div>
            </div>
        </div>
    )
}
