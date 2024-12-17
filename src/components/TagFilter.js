import React, { useEffect, useState } from 'react'
import { db } from "../firerbase"
import { collection, query, getDocs} from "firebase/firestore"; 
import Skeleton from '@mui/material/Skeleton';
function TagFilter({ setFilter }) { 
    const [tags, setTags] = useState([])
    const [loading ,setLoading] = useState(true)
    const fetchTags = async () => {
        const q = query(collection(db, "tags"))
        const querySnapshot = await getDocs(q);
        let res = []
        querySnapshot.forEach((doc) => {
            res.push({...doc.data(), id: doc.id, active: false}) 
        });
        setLoading(false)
        setTags(res)
    }
    useEffect(() => {
        fetchTags()
    }, [])
    const handleClick = (id) => {
        let temp = [...tags]
        if (temp[id].active){
            setFilter(filter => {
                let t = {...filter}
                const index = filter.tags.findIndex(tag => tag == temp[id].title)
                if (index != -1){
                    t.tags.splice(index)
                }
                return t
            })
        } else {
            setFilter(filter => {
                let res = {...filter}
                const index = res.tags.findIndex(item => item == temp[id].title)
                if (index == -1) res.tags.push(temp[id].title)
                return res
            })
        }
        temp[id].active = !temp[id].active
        setTags(temp)
        
    }
    return (
        <div className='flex gap-x-2 h-8 items-center'>
            {loading && Array(5).fill(5).map((i, id) => <Skeleton key= {id}  variant="rectangular" style={{borderRadius: "0.5rem"}} height="1.75rem" width="4rem"></Skeleton>)}
            {!loading && tags?.map((tag, id) => {
                if (!tag.active) return (
                <div 
                    key = {id} 
                    onClick = {() => handleClick(id)}
                    className="
                    text-sm 
                    bg-gray-100 
                    hover:bg-gray-200 
                    cursor-pointer
                    px-2
                    py-1
                    rounded-lg
                ">
                    {tag.title}
            </div>
                )
                else return (
                <div 
                    key = {id} 
                    onClick = {() => handleClick(id)}
                    className="
                    text-sm 
                    bg-gray-900 
                    hover:bg-gray-800
                    cursor-pointer
                    px-2
                    py-1
                    rounded-lg
                    text-white
                ">
                    {tag.title}
                </div>
                )
            }
            
            )}
        </div>
    )
}

export default TagFilter
