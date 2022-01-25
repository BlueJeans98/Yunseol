import React, { useEffect, useRef, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import { TextField } from "@material-ui/core";
import { Container } from "react-bootstrap";
import io from "socket.io-client";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
    const [rooms, setRooms] = useState([]);
    const socketRef = useRef();
    const [open, setOpen] = useState(false);
    const [enterRoom, setEnterRoom] = useState();
    const [nickname, setNickname] = useState('');



    const handleClickOpen = (room) => {
        setOpen(true);
        setEnterRoom(room);
      };
      
    const handleClose = () => {
        setOpen(false);
      };

    const handleEnter = () => {
        setOpen(false);
        console.log(nickname);
        props.history.push({pathname: `/room/${enterRoom}`, state:{nickname: nickname}});
    }

    function create() {
        const id = uuid();
        props.history.push({pathname: `/room/${id}`, state:{nickname : '방장이'}});
        socketRef.current.emit("new Room",id);
    }

    function handleChange(nickname){
        setNickname(nickname);
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
        <div stlye={{}}>
            <button onClick={create}>Create room</button>
            {rooms.map((room) => {
                return (
                    <Button variant="outlined" 
                        color="primary" onClick={() => handleClickOpen(room)}>
                        {room}
                    </Button>
                    );
            })}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                방 참가시 닉네임을 정해주세요.
                </DialogTitle>
                <DialogActions>
                    <TextField id="outlined-basic" label="닉네임" variant="outlined" value={nickname} onChange={(e) => handleChange(e.target.value)} />
                    <Button onClick={handleClose} color="primary">
                    닫기
                    </Button>
                    <Button onClick={handleEnter} color="primary" autoFocus>
                    방 참가
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CreateRoom;
