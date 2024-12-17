import React, { useState, useEffect} from 'react'
import UploadSong from '../components/UploadSong';
import { TextField } from '@mui/material'
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';


import { db } from "../firerbase"
import { collection, doc, setDoc, query, getDocs} from "firebase/firestore"; 

function AdminPage() {
    const [tags, setTags] = useState([])
    
    const fetchTags = async () => {
        const q = query(collection(db, "tags"))
        const querySnapshot = await getDocs(q);
        let res = []
        querySnapshot.forEach((doc) => {
            res.push({...doc.data(), id: doc.id}) 
        });
        setTags(res)
    }

    useEffect(() => {
        fetchTags()
    }, [])

    const createNewTag = async (e) => {
        e.preventDefault()
        const collectionRef = collection(db, "tags");
        await setDoc(doc(collectionRef), {
            title: e.target.title.value
        });
        alert('Successfully created a new tag')
    }
    return (
    <div>
        <div className='flex'>{tags.map(tag => <Chip label={tag.title} variant="outlined" />)}</div>
        <form onSubmit={createNewTag} className='flex flex-col gap-4 rounded-lg shadow-lg p-8 w-fit'>
            <h2 className='text-blue-500 font-bold text-lg'>Create new tag</h2>
            <TextField required variant="standard" name='title' size="small" placeholder='Title'/>
            <Button type = 'submit'>Submit</Button>
        </form>
        <UploadSong tags = {tags}/>
    </div>)
}


export default AdminPage
