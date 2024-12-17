import React from "react"
import "../styles/AutoCarousel.css"
import { useRef, useEffect, useState} from "react"

export default function AutoCarousel({index, children, type, transitionDuration}){
    const containerRef = useRef()
    const[ maxHeight, setMaxHeight ] = useState()
    const padding = 5 //pixels
    const resize = () =>{
        var arr = containerRef.current && Array.prototype.slice.call( containerRef.current.children )
        const max = arr.reduce((counter, current) => {
            return  current.offsetHeight > counter ? current.offsetHeight : counter
        }, 0)
        setMaxHeight(max+(2*padding))
    }
    useEffect(()=>{
        const resizeListener = window.addEventListener("resize", resize)
        resize()
        return () => {
            window.removeEventListener("resize",resizeListener)
        }
    },[])
    return (
    <div className="AutoCarousel" style={{height:`${maxHeight}px`, padding: `${padding}px 0`}}>
        <div className="AutoCarousel__container" style={{gap:`${2*padding}px`}} ref = {containerRef} >
            {children.map((child, i) => {
                const marginBottom = maxHeight - containerRef.current?.children[i].offsetHeight - 2*padding
                return React.cloneElement(child, { 
                    className: `${child.props.className} AutoCarousel__item ${i == index ? 'current' : ''}`,
                    style: {marginBottom: maxHeight ? `${marginBottom}px` : '0px', translate: `0 ${-index*maxHeight+padding}px`, transition:`all ${transitionDuration}s`}
                })
            })}
        </div>
    </div>)
}
