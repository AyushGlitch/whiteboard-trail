"use client"

import { useDraw } from "@/hooks/useDraw"
import { drawLine } from "@/utils/drawLine"
import { useEffect } from "react"
import { io } from "socket.io-client"


type DrawLineProps= {
    prevPoint: Point | null
    currentPoint: Point
    color: string
}

const socket= io('http://localhost:3001')


export default function Home () {
    const { canvasRef, onMouseDown, clear } = useDraw( createLine )

    useEffect( () => {
        const ctx= canvasRef.current?.getContext('2d')

        socket.emit('client-ready')

        socket.on('get-canvas-state', () => {
            if (!canvasRef.current?.toDataURL()) return
            socket.emit('canvas-state', canvasRef.current.toDataURL())
        })

        socket.on('canvas-state-from-server', (state) => {
            const img= new Image()
            img.src= state
            img.onload= () => {
                ctx?.drawImage(img, 0, 0)
            }
        })
        
        socket.on('draw-line', ( {prevPoint, currentPoint, color}: DrawLineProps ) => {
            if (!ctx) return
            drawLine( {prevPoint, currentPoint, ctx, color: '#000'} )
        })

        socket.on('clear', clear)


        return () => {
            socket.off('get-canvas-state')
            socket.off('canvas-state-from-server')
            socket.off('draw-line')
            socket.off('clear')
        }

    }, [canvasRef] )

    function createLine ( { prevPoint, currentPoint, ctx }: Draw ) {
        socket.emit('draw-line', { prevPoint, currentPoint, color: '#000' })
        drawLine( {prevPoint, currentPoint, ctx, color:'#000'} )
    }


    return (
        <div className="w-screen flex flex-col items-center justify-normal gap-8 mt-10">
            <h1>Home</h1>
            <button type="button" className="py-2 px-5 bg-blue-400" onClick={() => socket.emit('clear')}>Clear Canvas</button>
            <canvas ref={canvasRef} width={750} height={600} className="border-2 border-emerald-300 rounded-md bg-slate-300" onMouseDown={onMouseDown} />
        </div>
    )
}