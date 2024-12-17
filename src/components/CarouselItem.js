import React from 'react'

function CarouselItem({ children, ...props }) {
  return (
    <div {...props}>
      {children}
    </div>
  )
}

export default CarouselItem
