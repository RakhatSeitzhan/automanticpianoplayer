import React, { useState, useEffect} from 'react'
import { TextField } from '@mui/material'
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { db } from "../firerbase"
import { collection, doc, setDoc, serverTimestamp, query, getDocs} from "firebase/firestore"; 
import { getStorage, ref, uploadBytes } from "firebase/storage";

import { resizeImage } from '../utils/imageResizer';

import MidiParser from 'midi-parser-js';

export default function UploadSong({ tags }) {
    const allowedSongFormat = ['midi', 'mid']
    const allowedPicFormat = ['jpeg', 'jpg', 'png']
    const [selectedTags, setSelectedTags] = useState(['default'])
    const readMidiFile = async (file) => {
        
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try{
                    const midiArrayBuffer = new Uint8Array(e.target.result);
                    const parsedData = MidiParser.parse(midiArrayBuffer);
                    res(parsedData)
                } catch(err){
                    rej(err)
                }
            };
            reader.readAsArrayBuffer(file);
        })
    }
    const calculateDurataion = (midiData) => {
        let totalDuration = 0
        midiData.track.forEach(track => {
            track.event.forEach(event => {
                totalDuration+=event.deltaTime
            })
        });
        return totalDuration
    }
    const uploadSong = async (e) => {
        e.preventDefault()
        const midiFile = e.target.midifile.files[0]
        const coverPic = e.target.coverpic.files[0]
        const midiFileFormat = midiFile.name.split('.').pop()
        if (allowedSongFormat.indexOf(midiFileFormat) == -1){
            return false
        }
        const coverPicFormat = coverPic.name.split('.').pop()
        if (allowedPicFormat.indexOf(coverPicFormat) == -1){
            return false
        }
        const resizedCoverPic = await resizeImage(coverPic, 100)

        const title = e.target.title.value
        const artist = e.target.artist.value

        const parsedData = await readMidiFile(midiFile)
        const duration = calculateDurataion(parsedData)/1000

        const storage = getStorage();
        const midiSrc = 'midisongs/'+title+'-'+artist+'.'+midiFileFormat
        const coverSrc = 'coverpics/'+title+'-'+artist+'.'+coverPicFormat

        const midiFileStorageRef = ref(storage, midiSrc);
        const coverPicStorageRef = ref(storage, coverSrc);

        const filePromise = uploadBytes(midiFileStorageRef, midiFile)
        const picPromise = uploadBytes(coverPicStorageRef, resizedCoverPic)
        const fileWriteResults = await Promise.all([filePromise, picPromise])
        
        if (!fileWriteResults) {
            return false
        }
        const collectionRef = collection(db, "songs");
        await setDoc(doc(collectionRef), {
            title: title, 
            artist: artist,
            duration: duration,
            createdAt: serverTimestamp(),
            coverSrc: coverSrc,
            midiFileSrc: midiSrc,
            tags: selectedTags
        });
        alert("Uploaded new song!")
    }
    const handleSelectChange = (e, index) => {
        let temp = [...selectedTags]
        temp[index] = e.target.value
        setSelectedTags(temp)
    }
    const addSelect = () => {
        setSelectedTags([...selectedTags, 'default'])
    }
    return (
        <form onSubmit={uploadSong} className='flex flex-col items-start gap-4 rounded-lg shadow-lg p-8 w-fit'>
            <h2 className='text-blue-500 font-bold text-lg'>Add a song</h2>
            <TextField required variant="standard" name='title' size="small" placeholder='Song title'/>
            <TextField required variant="standard" name='artist' size="small" placeholder='Artist name'/>
            <h2 className=' text-gray-700 text-md'>Upload midi file</h2>
            <TextField required type='file' variant="standard" name='midifile' size="small" placeholder='File'/>
            <h2 className=' text-gray-700 text-md'>Upload cover picture</h2>
            <TextField required type='file' variant="standard" name='coverpic' size="small" placeholder='Cover'/>
            {selectedTags.map((selectedTag, index) => 
                <Select
                    key = {index}
                    value={selectedTag}
                    onChange={e => handleSelectChange(e,index)}
                >
                    <MenuItem value='default'>Select a related tag</MenuItem>
                    {tags?.map((tag, tagIndex) => <MenuItem key = {tagIndex} value={tag.title}>{tag.title}</MenuItem>)}
                </Select>
            )}
            <IconButton onClick={addSelect}>
                <AddRoundedIcon></AddRoundedIcon>
            </IconButton>
            <Button type = 'submit'>Submit</Button>
        </form>
    )
}
