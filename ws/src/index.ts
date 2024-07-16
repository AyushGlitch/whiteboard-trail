import express from "express"
import http from "http"
import { Server } from "socket.io"


const app= express()
const server= http.createServer(app)

const io= new Server(server, {
    cors: {
        origin: "*",
    },
})


type Point= {
    x: number
    y: number
}

type DrawLineProps= {
    prevPoint: Point | null
    currentPoint: Point
    color: string
}

io.on('connection', (socket => {
    console.log('A user connected')

    socket.on('client-ready', () => {
        socket.broadcast.emit('get-canvas-state')
    })

    socket.on('canvas-state', (state) => {
        socket.broadcast.emit('canvas-state-from-server', state)
    })

    socket.on('draw-line', ({prevPoint, currentPoint, color}: DrawLineProps) => {
        socket.broadcast.emit('draw-line', {prevPoint, currentPoint, color})
    })

    socket.on('clear', () => {
        io.emit('clear')
    })
}))


server.listen(3001, () => {
    console.log('Server is running on port 3001')
})