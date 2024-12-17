import React, { useContext, useEffect, useRef, useState } from 'react'
import { CurrentItemContext } from './Carousel'
function CarouselContainer({children, ...props}) {
    const vertical = props.orientation == 'vertical' ? true : false
    const current = useContext(CurrentItemContext)

    const percentShift = current * 100


    const [maxWidth, setMaxWidth] = useState()
   
    const containerRef = useRef()
    useEffect(() => {
        let maxWidth = 0
        const items = containerRef.current.children
        for (var i = 0; i < items.length; i++){
            const itemWidth = items[0].offsetWidth 
            if (itemWidth > maxWidth){
                maxWidth = itemWidth
            }
        }
        setMaxWidth(maxWidth)

    }, [])
    return (
        <div ref = {containerRef} {...props} style={{width:maxWidth}} className={`overflow-hidden flex ${vertical ? 'flex-col' : ''}`}>
                {children.map(element => {
                    return (
                        React.cloneElement(element, {
                            style: {
                                transform: `translateX(-${maxWidth*current}px)`, 
                                width: maxWidth ? maxWidth : 'auto',
                                transition: 'all 200ms'
                            }
                        })
                    )
                })}
        </div>
    )
}

export default CarouselContainer
