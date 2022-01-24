import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import io from "socket.io-client";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    const socketRef = useRef();
    const [rooms, setRooms] = useState([]);

    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
        socketRef.current.emit("new Room",id);
    }

    useEffect(() => {
        socketRef.current = io.connect("/");
        socketRef.current.emit("join server");
        socketRef.current.on("list Rooms", (cur_rooms) => {
            setRooms(cur_rooms);
            console.log("list room");
        })
    }, []);

    return (
        <Container>
            <button onClick={create}>Create room</button>
            {rooms.map((room) => {
                return (
                    <button onClick={() => props.history.push(`/room/${room}`)}>{room}</button>
                    );
            })}
        </Container>
    );
};

export default CreateRoom;
