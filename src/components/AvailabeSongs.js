import {  useEffect, useRef, useState } from "react";
import { db } from "../firerbase"
import { collection, query, getDocs, orderBy, startAt, endAt, limit, startAfter } from "firebase/firestore"; 
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Skeleton from '@mui/material/Skeleton';
import { useCurrentSongState } from "../pages/hooks/useCurrentSong";
import SearchBar from "./SearchBar";
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { IconButton } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import MidiParser from "midi-parser-js";
import TagFilter from "./TagFilter";

export function AvailableSongs(){
    
    const [filter, setFilter] = useState({text: '', tags: []})
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [dataLoaded, setDataLoaded] = useState(false)
    const [ currentPage, setCurrentPage ] = useState(0)
    const [ songs, setSongs] = useState([])
    const fetchId = useRef(0)
    const itemsPerPage = 5
    const downloadLimit = 100
    useEffect(() => {
        fetchSongs(fetchId.current+1)
        fetchId.current = fetchId.current + 1
    },[filter])

    const [ currentSong, dispatch ] = useCurrentSongState()
    const setCurrentSong = (newState) => {
        dispatch({
            type: "SET",
            value: newState
        })
    }
    const fetchSongs = async (id) => {
        setIsLoading(true)
        setDataLoaded(false)
        let songsInfo = []
        if (filter.text != ''){
            const q = query(collection(db, "songs"), orderBy('title'), startAt(filter.text), endAt(filter.text+'~'),limit(downloadLimit))
            const q2 = query(collection(db, "songs"), orderBy('artist'), startAt(filter.text), endAt(filter.text+'~'),limit(downloadLimit))
            const querySnapshot = await getDocs(q);
            const querySnapshot2 = await getDocs(q2);
            querySnapshot.forEach((doc) => {
                songsInfo.push({...doc.data(), id: doc.id,docSnap: doc}) 
            });
            querySnapshot2.forEach((doc) => {
                const index = songsInfo.findIndex(song => song.id == doc.id)
                if (index == -1){
                    songsInfo.push({...doc.data(), id: doc.id, docSnap: doc}) 
                }
            });
        } else {
            const q = query(collection(db, "songs"), orderBy('title'),limit(downloadLimit))
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                
                songsInfo.push({...doc.data(), docSnap: doc}) 
            });
        }

        if (id != fetchId.current) return

        let filteredByTags = []
        if (filter.tags.length == 0){
            filteredByTags = songsInfo
        } else {
            songsInfo.forEach(song => {
                for (var i = 0; i < filter.tags.length; i++){
                    if (song.tags){
                        if (song.tags.includes(filter.tags[i])) {
                            filteredByTags.push(song)
                            break
                        }
                    }
                }
            })
        }
        setData(filteredByTags)
        setDataLoaded(true)
        fetchCovers(filteredByTags.slice(currentPage*itemsPerPage, (currentPage+1)*itemsPerPage), currentPage+0)
    }
    const fetchCovers = (songsInfo, page) => {
        Promise.all(songsInfo.map(song => loadPicFile(song))).then(songPics => {
            setSongs(songsInfo.map((song, index) => ({...song, coverpic: songPics[index]})))
            setIsLoading(false)
        })
    }
    const loadPicFile = async (song) => {
        const storage = getStorage();
        const fileRef = ref(storage, song.coverSrc)
        const url = await getDownloadURL(fileRef)
        // the following is need to load the image in advance
        return new Promise(async (res, rej) => {
            const img = new Image()
            img.src = url;
            img.onload = () => {
                res(url)
            }
        })
    }  
    const getRandomSkeletonWidth = (min, max) => {
        return `${Math.floor(Math.random() * (max - min + 1)) + min}rem`
    }
    const nextPage = () => {
        if ((currentPage+1)*itemsPerPage >= data.length) return
        setCurrentPage(currentPage+1)
        fetchCovers(data.slice((currentPage+1)*itemsPerPage, (currentPage+2)*itemsPerPage), currentPage+0)
        setIsLoading(true)
    }
    const previousPage = () => {
        if (currentPage > 0){
            setIsLoading(true)
            setCurrentPage(currentPage-1)
            fetchCovers(data.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage),currentPage+0)
        }
    }
    const fileInputRef = useRef()
    const calculateDurataion = (midiData) => {
        let totalDuration = 0
        midiData.track.forEach(track => {
            track.event.forEach(event => {
                totalDuration+=event.deltaTime
            })
        });
        return totalDuration
    }
    const handleFileLoad = (e) =>{ 
        const file = e.target.files[0]
        const reader = new FileReader();
        reader.onload = (e) => {
            const midiArrayBuffer = new Uint8Array(e.target.result);
            const parsedData = MidiParser.parse(midiArrayBuffer);
            
            setCurrentSong({title: file.name, midiData: parsedData, artist: 'Unknown', duration: calculateDurataion(parsedData)})
        };
        reader.readAsArrayBuffer(file);
    }
    const handleFileClick = () => {
        fileInputRef.current.click()
    }
    const min = (a,b) => {
        if (a > b) return b
        else return a
    }
    return (
    <div style={{height: '25rem'}} className="flex flex-col gap-y-2 mt-2">

        <SearchBar setFilter = {setFilter}/>
        <TagFilter setFilter = {setFilter}></TagFilter>
        
        <div className="flex">
            <div className="flex items-center w-full">
                <IconButton size = 'small' onClick={previousPage}>
                    <NavigateBeforeRoundedIcon/>
                </IconButton>
                    
                {currentPage*itemsPerPage+1} — {min((currentPage+1)*itemsPerPage, data.length)}
                    
                <IconButton size = 'small' onClick={nextPage}>
                    <NavigateNextRoundedIcon/>
                </IconButton>
                {!dataLoaded ? <CircularProgress style = {{color: "black"}} thickness={5} size={20} /> : <div> {data.length} results</div>}
                
                
                <div className="ml-auto">
                    <div type="file" onClick={handleFileClick} className="flex items-center justify-center text-gray-700 bg-gray-100 hover:bg-gray-200 gap-x-1 px-2 h-8 rounded-md cursor-pointer">
                        <FileUploadRoundedIcon fontSize="small"/>
                        <span className="text-sm">Upload file</span>
                        <input type="file" onChange={handleFileLoad} ref={fileInputRef} className="hidden"></input>                            
                    </div>
                </div>
            </div>
        </div>
        <div className="flex gap-x-4 items-center border-b">
            <div className="text-sm w-12 overflow-hidden whitespace-nowrap text-ellipsis">Cover</div>
            <h2 className="text-sm w-16 overflow-hidden whitespace-nowrap text-ellipsis">Duration</h2>
            <h1 className="text-sm w-36 overflow-hidden whitespace-nowrap text-ellipsis">Title</h1>
            <h2 className="text-sm w-36 overflow-hidden whitespace-nowrap text-ellipsis">Artist</h2>
            <h2 className="text-sm w-36 overflow-hidden whitespace-nowrap text-ellipsis">Genre</h2>
        </div>
        {!isLoading && dataLoaded && data?.length == 0 && <h2 clasname = "text-md">No such song was found!</h2>}
        
        {isLoading && 
            Array(itemsPerPage).fill(0).map((i, index) => 
            <div key = {index} className="flex gap-x-4 items-center">
                <Skeleton variant="rectangular" style={{borderRadius: "0.25rem"}} width="3rem" height="3rem"/>
                <Skeleton variant="rectangular" style={{borderRadius: "0.25rem"}} width="4rem" height="1.2rem"/>
                <div className="w-36">
                    <Skeleton variant="rectangular" style={{borderRadius: "0.25rem"}} width={getRandomSkeletonWidth(6,9)} height="1.2rem"/>
                </div>
                <div className="w-36">
                    <Skeleton variant="rectangular" style={{borderRadius: "0.25rem"}} width={getRandomSkeletonWidth(6,9)} height="1.2rem"/>
                </div>
            </div>
            )
        }
        
        {!isLoading && songs?.map((song, index) => {
            const minutes = Math.floor(song.duration / 60)
            const seconds = Math.floor(song.duration % 60)
            const timeText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
            
            return (
            <div key = {index} onClick={() => setCurrentSong(song)} className="flex gap-x-4 items-center hover:bg-gray-50 cursor-pointer">
                <img 
                    className="w-12 h-12 rounded-md" 
                    src = {song.coverpic} 
                />
                <h2 className="text-md w-16 overflow-hidden whitespace-nowrap text-ellipsis">{timeText}</h2>
                <h1 className="text-md w-36 overflow-hidden whitespace-nowrap text-ellipsis">{song.title}</h1>
                <h2 className="text-md w-36 overflow-hidden whitespace-nowrap text-ellipsis">{song.artist}</h2>
                <div className="flex gap-x-1">
                    {song?.tags?.map((tag, tagindex)=> <span key = {tagindex} className="text-sm px-3 py-1 bg-gray-100 rounded-full">{tag}</span>)}
                </div>
            </div>
            
        )})}
    </div>)
}