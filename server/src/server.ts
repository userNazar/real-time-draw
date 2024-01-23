import express from 'express';
import http from 'http';
import { Server } from 'socket.io';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});


type Point = {
    x: number;
    y: number;
}

type DrawLine = {
    prevPoint: Point | null;
    currentPoint: Point;
    color: string;
}

io.on('connection', (socket) => {

    socket.on('client-ready', () => {
        socket.broadcast.emit('get-canvas-state');
    });

    socket.on('canvas-state', (state) => {
        socket.broadcast.emit('canvas-state-from-server', state);
    });

    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLine) => {
        socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color });
    });

    socket.on('clear', () => {
        io.emit('clear');
    });
});

server.listen(5000, () => {
    console.log('Works port', 5000);
});