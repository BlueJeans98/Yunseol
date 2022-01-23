import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState();
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const myPeer = useRef();

    useEffect(() => {
        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            setStream(stream);
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    myPeer.current = peer;
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push({
                        peerID : userID,
                        peer
                    });
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", (payload) => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                myPeer.current = peer;
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                // const peerObj = {
                //     peer,
                //     peerID : payload.callerID
                // }
                
                // setPeers(users => [...users, peerObj]);
                setPeers([...peersRef.current]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("user left", id => {
                const peerObj = peersRef.current.find(p=>p.peerID === id);
                if(peerObj) {
                    peerObj.peer.destroy();
                }
                const peers = peersRef.current.filter(p => p.peerID  !== id);
                peersRef.current = peers;
                console.log(peers);
                setPeers(peers);
            } )
        })
    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    function shareScreen(){
        navigator.mediaDevices.getDisplayMedia({cursor:true})
        .then(screenStream=>{
            peers.map(peer => {
                myPeer.current = peer;
                myPeer.current.peer.replaceTrack(stream.getVideoTracks()[0],screenStream.getVideoTracks()[0],stream);
            })
            userVideo.current.srcObject=screenStream;
          screenStream.getTracks()[0].onended = () =>{
            peers.map(peer => {
                myPeer.current = peer;
                myPeer.current.peer.replaceTrack(screenStream.getVideoTracks()[0],stream.getVideoTracks()[0],stream);
            })
            userVideo.current.srcObject=stream;
          }
        })
      }

    return (
        <Container>
            <div>
                <StyledVideo muted ref={userVideo} autoPlay playsInline />
                <button onClick={shareScreen}>Share screen</button>
            </div>
            {
                peers.map((peer) => {
                return (
                    <Video key={peer.peerID} peer={peer.peer} />
                );
            })}
        </Container>
    );
};

export default Room;