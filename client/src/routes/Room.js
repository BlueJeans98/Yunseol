import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../Screen5.css';
import Draggable from 'react-draggable';
// import Modal from './modal';
import cn from "classnames";
import "../navbar.css";


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
    const [camText, setcamText] = useState();
    const [muteText, setmuteText] = useState();
    const [stream, setStream] = useState();
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const myPeer = useRef();

    const mynickname = props.location.state.nickname;

    useEffect(() => {
        setcamText("카메라 끄기");
        setmuteText("음소거")
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
                        peerID: userID,
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

                setPeers([...peersRef.current]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("user left", id => {
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const peers = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peers;
                setPeers(peers);
            })
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

    function shareScreen() {
        navigator.mediaDevices.getDisplayMedia({ cursor: true })
            .then(screenStream => {
                peers.map(peer => {
                    myPeer.current = peer;
                    myPeer.current.peer.replaceTrack(stream.getVideoTracks()[0], screenStream.getVideoTracks()[0], stream);
                })
                userVideo.current.srcObject = screenStream;
                screenStream.getTracks()[0].onended = () => {
                    peers.map(peer => {
                        myPeer.current = peer;
                        myPeer.current.peer.replaceTrack(screenStream.getVideoTracks()[0], stream.getVideoTracks()[0], stream);
                    })
                    userVideo.current.srcObject = stream;
                }
            })
    }

    function HideCam() {
        const videoTrack = stream.getTracks().find(track => track.kind === 'video');
        if (videoTrack.enabled) {
            videoTrack.enabled = false;
            setcamText("카메라 끄기");
        }
        else {
            videoTrack.enabled = true;
            setcamText("카메라 켜기");
        }
    }

    function MuteAudio() {
        const audioTrack = stream.getTracks().find(track => track.kind === 'audio');
        if (audioTrack.enabled) {
            audioTrack.enabled = false;
            setmuteText("음소거");
        }
        else {
            audioTrack.enabled = true;
            setmuteText("음소거 해제");
        }
    }

    function leaveRoom(){
        socketRef.current.emit("user left room", roomID);
        props.history.push(`/`);
    }

    const [position, setPosition] = useState({ x: 0, y: 0 }); // box의 포지션 값
    const [leftwidth, setleftwidth] = useState(856); //856 middle
    const [heightValue, setHeightValue] = useState(500)
    const [opacityValue, setOpacityValue] = useState([true, true, true, true])

    const [vlConstraint, setvlConstraint] = useState([1400, [1400, 1400]])
    const [vlConstraint2, setvlConstraint2] = useState(865)

    const [urllist, setUrlList] = useState(["https://youtube.com", "https://youtube.com", "https://youtube.com", "https://youtube.com", "https://youtube.com"])

    const userurlist = [[1, '박정웅', '문서1', 'https://docs.google.com/document/d/1t3w62lqmb-kh3KZRYRrdc9_mNmeDMWGEI7gr30VYeZ0/edit'], [2, '김수민', '문서2', 'https://docs.google.com/document/d/1t3w62lqmb-kh3KZRYRrdc9_mNmeDMWGEI7gr30VYeZ0/edit']]
    const userchatist = [[1, '박정웅', 'https://center-pf.kakao.com/_BxhMfb/chats/4833125796910175'], [2, '김수민', 'https://center-pf.kakao.com/_BxhMfb/chats/4833347190361203']]

    const [showNavMobile, setshowNavMobile] = useState(false);
    const [sharedDoc, setsharedDoc] = useState(false);
    const [chatroom, setchatroom] = useState(false);
    const [addLink, setaddLink] = useState(false);


    // 업데이트 되는 값을 set 해줌
    const trackPos1 = (e, data) => {
        // setPosition({ x: data.x, y: data.y }); 
        // console.log(data.x)
        // setleftwidth(856+data.x)
        // setvlConstraint2(e.x)
        // console.log(e.x)
        setOpacityValue([true, true, true, true])
        // console.log(leftwidth)
    };

    const handleGrab1 = (e, data) => {
        setleftwidth(856 + e.x)
        setvlConstraint2(856 + e.x)
        setOpacityValue([false, true, true, true])
    }

    const trackPos2 = (e, data) => {
        // console.log(data.y)
        setOpacityValue([true, true, true, true])
        // setHeightValue(500+e.y)
        // console.log(leftwidth)
    };

    const handleGrab2 = (e, data) => {
        setHeightValue(500 + data.y)
        setOpacityValue([true, false, true, true])
    }

    const trackPos3 = (e, data) => {
        setPosition({ x: data.x, y: data.y });
        // var templist = [...vlConstraint]
        // templist[1][0] = e.x
        // templist = (templist[1][0] > templist[1][1]) ? ([templist[1][1], [templist[1][0], templist[1][1]]]) : ([templist[1][0], [templist[1][0], templist[1][1]]])
        // console.log(templist)
        // setvlConstraint(templist)
        setOpacityValue([true, true, true, true])
    };

    const handleGrab3 = (e, data) => {
        // console.log(e.x)
        var templist = [...vlConstraint]
        templist[1][0] = 1400 + e.x
        templist = (templist[1][0] > templist[1][1]) ? ([templist[1][1], [templist[1][0], templist[1][1]]]) : ([templist[1][0], [templist[1][0], templist[1][1]]])
        // console.log(templist)
        setvlConstraint(templist)
        setOpacityValue([true, true, false, true])
    }

    const trackPos4 = (e, data) => {
        setPosition({ x: data.x, y: data.y });
        // var templist = [...vlConstraint]
        // templist[1][1] = e.x
        // templist = (templist[1][0] > templist[1][1]) ? ([templist[1][1], [templist[1][0], templist[1][1]]]) : ([templist[1][0], [templist[1][0], templist[1][1]]])
        // console.log(templist)
        // setvlConstraint(templist)
        setOpacityValue([true, true, true, true])
    };

    const handleGrab4 = (e, data) => {
        var templist = [...vlConstraint]
        templist[1][1] = e.x
        templist = (templist[1][0] > templist[1][1]) ? ([templist[1][1], [templist[1][0], templist[1][1]]]) : ([templist[1][0], [templist[1][0], templist[1][1]]])
        // console.log(templist)
        setvlConstraint(templist)
        setOpacityValue([true, true, true, false])
    }

    const temp = (e, data, url) => {
        var templist = [...urllist];
        templist[checkarea(e.clientX, e.clientY) - 1] = url;
        setUrlList(templist);
    }

    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpen2, setModalOpen2] = useState(false);


    const openModal = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };

    const openModal2 = () => {
        setModalOpen2(true);
    };
    const closeModal2 = () => {
        setModalOpen2(false);
    };

    const dragStart = (e, data) => {
        console.log(e.x, e.y);
        console.log(checkarea(e.x, e.y));
        var templist = [...urllist];
        templist[checkarea(e.x, e.y) - 1] = 'https://www.naver.com/';
        setUrlList(templist);
    }

    const checkarea = (x, y) => {
        if (x < leftwidth) {
            return 1;
        }
        else if (y < heightValue) {
            if (x < vlConstraint[1][0]) {
                return 2;
            } else {
                return 3;
            }
        } else {
            if (x < vlConstraint[1][1]) {
                return 4;
            } else {
                return 5;
            }
        }
        return 0;
    }

    // const urlelement = userurlist.map(url => {
    //   return (
    //     <tr draggable onDragEnd={(e, data) => temp(e, data, url[3])}>
    //       <th scope="row">{url[0]}</th>
    //       <td>{url[1]}</td>
    //       <td>{url[2]}</td>
    //     </tr>
    //   )
    // })

    const urlelement = userurlist.map(url => {
        return (
            <li
                className={cn({
                    ["open-item"]: sharedDoc
                })}
            >
                <div class="sidebarData" draggable onDragEnd={(e, data) => temp(e, data, url[3])}>
                    {url[2]}
                </div>
            </li>
        )
    })


    // const chatelement = userchatist.map(url => {
    //   return (
    //     <tr draggable onDragEnd={(e, data) => temp(e, data, url[2])}>
    //       <th scope="row">{url[0]}</th>
    //       <td>{url[1]}</td>
    //     </tr>
    //   )
    // })

    const chatelement = userchatist.map(url => {
        return (
            <li
                className={cn({
                    ["open-item"]: sharedDoc
                })}
            >
                <div class="sidebarData" draggable onDragEnd={(e, data) => temp(e, data, url[2])}>
                    {url[1]}
                </div>
            </li>
        )
    })

    const gotoSharedDoc = () => {
        setsharedDoc(!sharedDoc)
    }

    const gotoChatRoom = () => {
        setchatroom(!chatroom)
    }

    const threeLineButton = () => {
        if (showNavMobile == false) {
            setshowNavMobile(true);
        } else {
            setshowNavMobile(false);
            setsharedDoc(false);
            setchatroom(false);
        }
    }

    const tempclick = () => {
        console.log("click")
    }

    return (
        <div className="App">
            <nav>
            <button onClick={leaveRoom}>방 나가기</button>
                <div className="wrap">
                    <div className="logo"><a href="http://localhost:3000/">The Nav</a></div>
                    {/* <div className="plus" onClick={ click() }>+</div> */}

                    <div
                        className={cn("burger2", {
                            ["toggle"]: addLink
                        })}
                        onClick={() =>
                            setaddLink(!addLink)
                        }
                    >
                        <div className="line4" />
                        <div className="line5" />
                    </div>


                    <ul
                        className={cn("nav-links", {
                            ["open"]: showNavMobile
                        })}
                    >
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <a href="#">Home</a>
                        </li>
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <a class="nav-link" href="#" onClick={() => gotoSharedDoc()}>공유 문서함</a>
                        </li>
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <a class="nav-link" href="#" onClick={() => gotoChatRoom()}>채팅</a>
                        </li>
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <a href="#">About</a>
                        </li>
                    </ul>


                    <ul
                        className={cn("nav-links2", {
                            ["open"]: sharedDoc
                        })}
                    >
                        <li
                            className={cn({
                                ["open-item"]: sharedDoc
                            })}
                        >
                            <a href="#">공유 문서함</a>
                        </li>

                        {urlelement}

                        <li
                            className={cn({
                                ["open-item"]: sharedDoc
                            })}
                        >
                            <a href="#" onClick={() => setsharedDoc(!sharedDoc)}>나가기</a>
                        </li>
                    </ul>


                    <ul
                        className={cn("nav-links2", {
                            ["open"]: chatroom
                        })}
                    >
                        <li
                            className={cn({
                                ["open-item"]: chatroom
                            })}
                        >
                            <a href="#">채팅</a>
                        </li>

                        {chatelement}

                        <li
                            className={cn({
                                ["open-item"]: chatroom
                            })}
                        >
                            <a href="#" onClick={() => setchatroom(!chatroom)}>나가기</a>
                        </li>
                    </ul>

                    <ul
                        className={cn("nav-links3", {
                            ["open"]: addLink
                        })}
                    >
                        <li
                            className={cn({
                                ["open-item"]: addLink
                            })}
                        >
                            <a href="#">추가</a>
                        </li>



                        <li
                            className={cn({
                                ["open-item"]: addLink
                            })}
                        >
                            <a href="#" onClick={() => setaddLink(!addLink)}>나가기</a>
                        </li>
                    </ul>




                    <div
                        className={cn("burger", {
                            ["toggle"]: showNavMobile
                        })}
                        onClick={() =>
                            threeLineButton()
                        }
                    >
                        <div className="line1" />
                        <div className="line2" />
                        <div className="line3" />
                    </div>
                </div>
            </nav>

            <div>
                <div className='area1'>
                    {/* <iframe width={leftwidth} height="1000px" src={urllist[0]} title='test' name="test" id="test" scrolling="yes" align="left">이 브라우저는 iframe을 지원하지 않습니다</iframe> */}
                </div>
                <Draggable bounds={{ right: (vlConstraint[0] - 856) }} axis='x' onStop={(e, data) => trackPos1(e, data)} onDrag={(e, data) => handleGrab1(data)} >
                    <div className="vl" style={{ marginLeft: 856, opacity: opacityValue[0] ? 1 : 0.5, cursor: 'e-resize' }} >
                    </div>
                </Draggable>
                {/* </div> */}
            </div>

            <div>
                <div className="vl4" style={{ marginLeft: vlConstraint2 - 5, height: heightValue, opacity: opacityValue[2] ? 1 : 0.5, cursor: 'e-resize' }} >
                    {/* <iframe width={vlConstraint[1][0] - vlConstraint2} height={heightValue} src={urllist[1]} title='test' name="test" id="test" scrolling="yes" align="left">이 브라우저는 iframe을 지원하지 않습니다</iframe> */}
                    {/* <img id='img1' width={ vlConstraint[1][0]-vlConstraint2 +5 } height={ heightValue } src = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ7IB6Ai52BgQezn9Uid6XYFst6BARdp6mev-94mVHucrbD5FfV' alt=''></img> */}



                </div>
                <div className="vl4" style={{ marginLeft: vlConstraint2 - 5, marginTop: heightValue + 5, height: (1000 - heightValue), opacity: opacityValue[2] ? 1 : 0.5, cursor: 'e-resize' }} >
                    {/* <iframe width={vlConstraint[1][1] - vlConstraint2} height={(1000 - heightValue - 5)} src={urllist[3]} title='test' name="test" id="test" scrolling="yes" align="left">이 브라우저는 iframe을 지원하지 않습니다</iframe> */}
                    {/* <img id='img1' width={ vlConstraint[1][1]-vlConstraint2 +5 } height={ (1000-heightValue) } src = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ7IB6Ai52BgQezn9Uid6XYFst6BARdp6mev-94mVHucrbD5FfV' alt=''></img> */}
                    <div width={vlConstraint[1][1] - vlConstraint2} height={(1000 - heightValue - 5)}>
                    <Container>
                        <Col>
                            <StyledVideo muted ref={userVideo} autoPlay playsInline />
                            <Row>
                                <button onClick={shareScreen}>화면 공유</button>
                                <button onClick={HideCam}>{camText}</button>
                                <button onClick={MuteAudio}>{muteText}</button>
                            </Row>
                        </Col>
                        {/* {peers.map((peer) => {
                            return (
                                <Video key={peer.peerID} peer={peer.peer} />
                            );
                        })} */}
                    </Container>
                    </div>
                </div>
                <Draggable bounds={{ left: -(1400 - vlConstraint2) }} axis='x' onStop={(e, data) => trackPos3(e, data)} onDrag={(e, data) => handleGrab3(data)} >
                    <div className="vl2" style={{ marginLeft: 1400, height: heightValue, opacity: opacityValue[2] ? 1 : 0.5, cursor: 'e-resize' }} >
                        {/* <iframe width={1900 - vlConstraint[1][0]} height={heightValue} src={urllist[2]} title='test' name="test" id="test" scrolling="yes" align="left">이 브라우저는 iframe을 지원하지 않습니다</iframe> */}
                        {/* <img id='img1'  width={ 1900-vlConstraint[1][0] } height={ heightValue } src = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ7IB6Ai52BgQezn9Uid6XYFst6BARdp6mev-94mVHucrbD5FfV' alt=''></img> */}
                        <Container>
                        {/* <Col>
                            <StyledVideo muted ref={userVideo} autoPlay playsInline />
                            <Row>
                                <button onClick={shareScreen}>Share screen</button>
                                <button onClick={HideCam}>{camText}</button>
                                <button onClick={MuteAudio}>{muteText}</button>
                            </Row>
                        </Col> */}
                        {peers.map((peer) => {
                            return (
                                <Video key={peer.peerID} peer={peer.peer} />
                            );
                        })}
                    </Container>
                    
                    
                    </div>
                </Draggable>
                <Draggable bounds={{ left: -(1405 - vlConstraint2) }} axis='x' onStop={(e, data) => trackPos4(e, data)} onDrag={(e, data) => handleGrab4(e, data)} >
                    <div className="vl3" style={{ marginLeft: 1400, marginTop: (heightValue + 5), height: (1000 - heightValue - 5), opacity: opacityValue[3] ? 1 : 0.5, cursor: 'e-resize' }} >
                        {/* <iframe width={1900 - vlConstraint[1][1]} height={(1000 - heightValue - 5)} src={urllist[4]} title='test' name="test" id="test" scrolling="yes" align="left">이 브라우저는 iframe을 지원하지 않습니다</iframe> */}
                        {/* <img id='img1' width={ 1900-vlConstraint[1][1] } height={ (1000-heightValue) } src = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ7IB6Ai52BgQezn9Uid6XYFst6BARdp6mev-94mVHucrbD5FfV' alt=''></img> */}
                    </div>
                </Draggable>
            </div>

            <div>
                <Draggable axis='y' onStop={(e, data) => trackPos2(data)} onDrag={(e, data) => handleGrab2(e, data)} >
                    <hr style={{ marginLeft: leftwidth, opacity: opacityValue[1] ? 0.5 : 0.25, cursor: 'n-resize' }}></hr>
                </Draggable>
            </div>
        </div>
        // <Container>
        //         <Col>
        //             <StyledVideo muted ref={userVideo} autoPlay playsInline />
        //             <Row>
        //                 <button onClick={shareScreen}>Share screen</button>
        //                 <button onClick={HideCam}>{camText}</button>
        //                 <button onClick={MuteAudio}>{muteText}</button>
        //             </Row>
        //         </Col>
        //     {peers.map((peer) => {
        //         return (
        //             <Video key={peer.peerID} peer={peer.peer} />
        //         );
        //     })}
        // </Container>
    );
};




// export default Screen5;



export default Room;
