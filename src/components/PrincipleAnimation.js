import React, { useEffect, useRef, useState } from 'react'

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';


function PrincipleAnimation() {
    const songsInfo = [
        {
            name: 'Yeski taspa bii',
            singer: 'Ninety One',
            duration: '3:45',
            albumCoverSrc: 'ninetyone-min.jpeg'
        },
        {
            name: 'Demons',
            singer: 'Joji',
            duration: '2:56',
            albumCoverSrc: 'joji-min.jpg'
        },
        {
            name: 'Falling Down',
            singer: 'Lil Peep & XXXTENTACION',
            duration: '3:15',
            albumCoverSrc: 'fallingdown-min.jpeg'
        }
    ]
    
    const iphoneScale = 3.6
    const iphoneDimensions = {width: 71.4 * iphoneScale, height: 130 * iphoneScale}
    return (
        <section className='mt-32'>
            <h1 className='font-bold text-blue-500 text-md mb-4'>STEP 1</h1>
            <h2 className='mb-4'>The application sends signals to the circuit over bluetooth</h2>
            <div 
                style={{
                    height: `${iphoneDimensions.height}px`, 
                    width: `${iphoneDimensions.width}px`, 
                    borderRadius:'40px',
                    // border: 'solid 0.3rem rgba(34, 60, 80, 0.1)',
                    boxShadow: "0px -4px 10px 0px rgba(34, 60, 80, 0.2) inset ,0px 15px 40px 10px rgba(51,65,84,0.15)"
                }}  
                className='flex flex-col'
            >
                <div className='mx-auto my-auto'>
                    <AnimatedPics width = {200} height = {200}>
                        {songsInfo.map(song => <img className='rounded-md' src = {song.albumCoverSrc}/>)}
                    </AnimatedPics>
                
                    <AnimatedWords>
                        {songsInfo.map(song => <div>{song.name}</div>)}
                    </AnimatedWords>
                    <AnimatedWords>
                        {songsInfo.map(song => <div className='text-sm'>{song.singer}</div>)}
                    </AnimatedWords>
                    
                    
                    <div className='flex flex-col items-center mt-4'>
                        <div className='w-48 h-0.5 bg-gray-400'></div>
                        <div className='gap-4 flex content-between text-gray-400'>
                            <FastRewindRoundedIcon fontSize='large'/>
                            <PlayArrowRoundedIcon fontSize='large'/>
                            <FastForwardRoundedIcon fontSize='large'/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function AnimatedWords({ children, ...props}){
    const [ current, setCurrent ] = useState(0)
    const containerRef = useRef()
    const [ maxDimensions, setMaxDimensions ] = useState()
    useEffect(() => {
        let maxh = 0
        const numOfItems = containerRef.current.children.length
        for (var i = 0; i < numOfItems; i++){
            const height = containerRef.current.children[i].children[0].offsetHeight
            if (height > maxh) {maxh = height}
        }
        setMaxDimensions(maxh)
        const interval = setInterval(() => {
            setCurrent(state => {
                if (state + 1 == numOfItems) return 0
                return state + 1 
            })
        }, props.interval | 4000)
        return () => {
            clearInterval(interval)
        }
    }, [])
    return (
        <div {...props} ref = {containerRef} className='overflow-hidden flex flex-col' style={{height: maxDimensions}}>
            {children.map((child, index) => {
                return (
                <div 
                    className = 'transition-all ease-in-out duration-700 w-fit' 
                    style = {{ 
                        transform: `translateY(-${maxDimensions*current}px)`,
                        opacity: index == current ? 1 : 0.2,
                        scale: index == current ? 1 : 0.8
                    }}
                >
                    {child}
                </div>
                )
            })}
        </div>
    )
}

function AnimatedPics({ children, ...props}){
    const [ current, setCurrent ] = useState(0)
    const containerRef = useRef()
    const [ maxDimensions, setMaxDimensions ] = useState()
    useEffect(() => {
        let maxw = 0
        const numOfItems = containerRef.current.children.length
        for (var i = 0; i < numOfItems; i++){
            const width = containerRef.current.children[i].children[0].offsetWidth
            if (width > maxw) {maxw = width}
        }
        setMaxDimensions(maxw)
        const interval = setInterval(() => {
            setCurrent(state => {
                if (state + 1 == numOfItems) return 0
                return state + 1 
            })
        }, props.interval | 4000)
        return () => {
            clearInterval(interval)
        }
    }, [])
    return (
        <div {...props} className='overflow-hidden' style={{width: `${props.width}px`}}>
            <div className='flex' style={{width: `${props.width*3}px`}} ref = {containerRef} >
                {children.map((child, index) => {
                    return (
                    <div 
                        className = 'transition-all ease-in-out duration-1000' 
                        style = {{ 
                            transform: `translateX(-${props.width*current}px)`,
                            // opacity: index == current ? 1 : 0.2,
                            width: `${props.width}px`,
                            // scale: index == current ? 1 : 0.8
                        }}
                    >
                        {child}
                    </div>
                    )
                })}
            </div>
            
        </div>
    )
}

export default PrincipleAnimation
