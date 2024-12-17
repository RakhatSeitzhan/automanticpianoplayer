import React, { useEffect, useRef, useState } from 'react'

function AnimatedCarousel({ children, ...props}) {
    const [ current, setCurrent ] = useState(0)
    const containerRef = useRef()
    const [ maxDimensions, setMaxDimensions ] = useState({ width: 0, height: 0})
    useEffect(() => {
        let maxw = 0
        let maxh = 0
        const numOfItems = containerRef.current.children.length
        for (var i = 0; i < numOfItems; i++){
            const height = containerRef.current.children[i].getBoundingClientRect().height 
            const width = containerRef.current.children[i].getBoundingClientRect().width
            if (height > maxh) {maxh = height}
            if (width > maxw) {maxw = width}
        }
        setMaxDimensions({width: maxw, height: maxh})
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
        <div className='overflow-hidden flex flex-col' style={{height:maxDimensions.height}} {...props} ref ={containerRef}>
            {children.map((child, index) => {
                return (
                <div 
                    className = 'transition-all ease-in-out duration-300' 
                    style = {{ 
                        transform: `translateY(-${maxDimensions.height*current}px)`,
                        // height: maxDimensions.height, 
                        opacity: index == current ? 1 : 0
                    }}
                >
                    {child}
                </div>
                )
            }
            
            )}
        </div>
    )
}

export default AnimatedCarousel
