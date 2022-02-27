require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const rooms = {};

const socketToRoom = {};
let users = [];
let cur_rooms = [];

io.on('connection', socket => {

    socket.on("join server", (username) => {
        const user = {
            username,
            id : socket.id,
        };
        users.push(user);
        io.sockets.emit("list Rooms", cur_rooms);
        console.log(cur_rooms);
        console.log(users);
    });

    socket.on("new Room", (roomid) => {
        cur_rooms.push(roomid);
        io.sockets.emit("list Rooms", cur_rooms);
    });
    
    socket.on("join room", (roomID, nickname) => {
        const info = {id: socket.id, nickname: nickname};
        if (rooms[roomID]) {
            const length = rooms[roomID].length;
            if (length === 3) {
                socket.emit("room full");
                return;
            }
            rooms[roomID].push(info);
        } else {
            rooms[roomID] = [info];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = rooms[roomID].filter(info => info.id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal.id).emit('user joined', { signal: payload.signal, callerInfo: payload.callerInfo });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerInfo.id).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on("user left room", roomID => {
        let room = rooms[roomID];
        if (room) {
            room = room.filter(info => info.id !== socket.id);
            rooms[roomID] = room;
        }
        socket.broadcast.emit("user left", socket.id);
    })

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = rooms[roomID];
        if (room) {
            room = room.filter(info => info.id !== socket.id);
            rooms[roomID] = room;
        }
        socket.broadcast.emit("user left", socket.id);
        users = users.filter(user => user.id !== socket.id);
        
    });

    socket.on('file change', payload => {
        socket.broadcast.emit("file changed",payload);
        console.log(payload);
    })

});

server.listen(process.env.PORT || 443, () => console.log('server is running on port 443'));


