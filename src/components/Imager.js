import React, { useCallback, useState, useRef, useEffect } from 'react'
import { useSpring, animated, useTransition } from 'react-spring'


export default props => {

  const { image, preloader, onActionStart, onActionEnd } = props;
  const [ loaded, setLoaded ] = useState(preloader ? false : true)
  console.log('loaded', loaded)
  console.log('preloader', preloader)
  const transitions = useTransition(loaded, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })
  const [ { xys }, setStyle ] = useSpring(() => ({
    xys: [ 0, 0, 1 ],
    config: {
      mass:1,
      tension: 500,
      friction: 24
    }
  }))

  const pos = useRef()
  const scale = useRef()
  const imageDim = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if(preloader) setLoaded(false)

    const img = new Image()
    img.onload = function(){
      imageDim.current = [
        img.width,
        img.height
      ]
      if(preloader) setLoaded(true)
      managePostAction()
    }
    img.src = image
    pos.current = [0,0]
    scale.current = 1

  },[ image ])

  const managePostAction = () => {
    if(!containerRef.current) return;
    if(scale.current < 1) scale.current = 1

    const containerRect = containerRef.current.getBoundingClientRect()
    const imgScale = (
      (containerRect.height / containerRect.width) > (imageDim.current[1] / imageDim.current[0])
    ) ? containerRect.width / imageDim.current[0] : containerRect.height / imageDim.current[1]

    const imageScaled = [
      imageDim.current[0] * imgScale * scale.current,
      imageDim.current[1] * imgScale * scale.current
    ]

    const posLimit = [
      imageScaled[0] > containerRect.width ?
        Math.floor((imageScaled[0] - containerRect.width) / 2 / scale.current) : 0,
      imageScaled[1] > containerRect.height ?
        Math.floor((imageScaled[1] - containerRect.height) / 2 / scale.current) : 0
    ]

    pos.current = [
      Math.abs(pos.current[0]) > posLimit[0] ?
        posLimit[0] * (pos.current[0]/Math.abs(pos.current[0])) : pos.current[0],
      Math.abs(pos.current[1]) > posLimit[1] ?
        posLimit[1] * (pos.current[1]/Math.abs(pos.current[1])) : pos.current[1]
    ]

    // set Style
    setStyle({
      xys: [
        ...pos.current,
        scale.current
      ]
    })
  }

  const handleDragStart = useCallback((e) => {
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', handleDragEnd)
    if(onActionStart) onActionStart({
      type: 'drag',
      touch: false
    })
    return false;
  },[])

  const handleDrag = useCallback((e) => {
    pos.current = [
      pos.current[0] + (e.movementX  / scale.current ),
      pos.current[1] + (e.movementY / scale.current )
    ]
    setStyle({
      xys: [
        ...pos.current,
        scale.current
      ]
    })
    return false;
  },[])

  const handleDragEnd = useCallback((e) => {
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', handleDragEnd)
    managePostAction()
    if(onActionEnd) onActionEnd({
      type: 'drag',
      touch: false
    })
    return false;
  },[])

  const wheelTimeout = useRef();
  const handleWheel = useCallback((e) => {
    const delta = e.deltaY || e.deltaX
    if(!delta) return
    scale.current = Math.min(Math.max(
      scale.current + ((delta/Math.abs(delta)) * 0.1)
    ,1), 10);
    managePostAction()

    if(!wheelTimeout.current){
      if(onActionStart) onActionStart({
        type: 'zoom',
        touch: false
      })
      wheelTimeout.current = setTimeout(() => {
        if(onActionEnd) onActionEnd({
          type: 'zoom',
          touch: false
        })
      },300)
    }else{
      clearTimeout(wheelTimeout.current)
      wheelTimeout.current = setTimeout(() => {
        if(onActionEnd) onActionEnd({
          type: 'zoom',
          touch: false
        })
      },300)
    }
    return false;
  },[])

  const lastPos = useRef()
  const lastRadius = useRef()
  const handleTouchStart = useCallback((e) => {
    lastPos.current = [e.touches[0].screenX, e.touches[0].screenY]
    if(e.touches.length>1) lastRadius.current = {
      touch: Math.sqrt(
        Math.pow(e.touches[0].screenX - e.touches[1].screenX,2) +
        Math.pow(e.touches[0].screenY - e.touches[1].screenY,2)
      ),
      scale: scale.current
    }
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
    if(onActionStart && e.touches.length > 1) onActionStart({
      type: 'zoom',
      touch: true
    })
    if(onActionStart && e.touches.length === 1) onActionStart({
      type: 'drag',
      touch: true
    })
    return false;
  },[])

  const handleTouchMove = useCallback((e) => {
    if(e.touches.length>1){
      const radius = Math.sqrt(
          Math.pow(e.touches[0].screenX - e.touches[1].screenX,2) +
          Math.pow(e.touches[0].screenY - e.touches[1].screenY,2)
        )
      const deltaRad = lastRadius.current.scale * (radius/lastRadius.current.touch);
      scale.current = Math.min(Math.max(deltaRad,0.8),10)
      setStyle({
        xys: [
          ...pos.current,
          scale.current
        ]
      })

    }else{

      pos.current = [
        pos.current[0] + ( (e.touches[0].screenX - lastPos.current[0]) / scale.current ),
        pos.current[1] + ( (e.touches[0].screenY - lastPos.current[1]) / scale.current )
      ]
      lastPos.current = [e.touches[0].screenX, e.touches[0].screenY]
      setStyle({
        xys: [
          ...pos.current,
          scale.current
        ]
      })

    }
    return false;
  },[])

  const handleTouchEnd = useCallback((e) => {
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    managePostAction()
    if(onActionEnd && e.touches.length > 1) onActionEnd({
      type: 'zoom',
      touch: true
    })
    if(onActionEnd && e.touches.length === 1) onActionEnd({
      type: 'drag',
      touch: true
    })
    return false;
  },[])

  return <div
    ref={containerRef}
    onWheel={handleWheel}
    onMouseDown={handleDragStart}
    onTouchStart={handleTouchStart}
    style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      userSelect: 'none',
    }}
  >
      { preloader && !loaded ? preloader : transitions.map(({ item, key, props }) => item && <animated.img
        key={key}
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'contain',
          objectPosition: 'center center',
          userSelect: 'none',
          ...props,
          transform: xys.interpolate((x,y,s) => `scale3d(${s},${s},1) translate3d(${x}px, ${y}px, 0px)`)
        }}
        draggable="false"
        src={image}
      />) }

  </div>


}
