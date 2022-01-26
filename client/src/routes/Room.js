import React, { useEffect, useRef, useState } from "react";
import { useStateWithCallbackLazy } from 'use-state-with-callback';
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
import Dropdown from '../Dropdown';


const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 85%;
    width: 100%;
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
            socketRef.current.emit("join room", roomID, mynickname);


            socketRef.current.on("all users", users => {
                const peers = [];
                const info = { id: socketRef.current.id, nickname: mynickname };
                users.forEach(user => {
                    const peer = createPeer(user, info, stream);
                    myPeer.current = peer;
                    peersRef.current.push({
                        peerID: user.id,
                        peer,
                    })
                    peers.push({
                        peerID: user.id,
                        peerNick: user.nickname,
                        peer
                    });
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", (payload) => {
                const peer = addPeer(payload.signal, payload.callerInfo, stream);
                myPeer.current = peer;
                peersRef.current.push({
                    peerID: payload.callerInfo.id,
                    peerNick: payload.callerInfo.nickname,
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

            socketRef.current.on("file changed", payload => {
                console.log("file_changed");
                setuserurllist(payload.userurlist);
                setuserchatist(payload.userchatist);
                setuserExtList(payload.userExtList);
                setaddLink(!addLink)
            })
        })
    }, []);

    function createPeer(userToSignal, callerInfo, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerInfo, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerInfo, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerInfo })
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

    function leaveRoom() {
        socketRef.current.emit("user left room", roomID);
        props.history.push(`/`);
    }

    const [position, setPosition] = useState({ x: 0, y: 0 }); // box의 포지션 값
    const [leftwidth, setleftwidth] = useState(856); //856 middle
    const [heightValue, setHeightValue] = useState(500)
    const [opacityValue, setOpacityValue] = useState([true, true, true, true])

    const [vlConstraint, setvlConstraint] = useState([1400, [1400, 1400]])
    const [vlConstraint2, setvlConstraint2] = useState(865)

    const [urllist, setUrlList] = useState(["https://youtube.com", "https://www.naver.com/", "https://www.google.com/", "https://www.krafton.com/", "https://portal.kaist.ac.kr/"])

    const [userurlist, setuserurllist] = useState([['문서1', 'https://docs.google.com/document/d/1t3w62lqmb-kh3KZRYRrdc9_mNmeDMWGEI7gr30VYeZ0/edit'], ['문서2', 'https://docs.google.com/document/d/1t3w62lqmb-kh3KZRYRrdc9_mNmeDMWGEI7gr30VYeZ0/edit']]);
    const [userchatist, setuserchatist] = useState([['박정웅', 'https://center-pf.kakao.com/_BxhMfb/chats/4833125796910175'], ['김수민', 'https://center-pf.kakao.com/_BxhMfb/chats/4833347190361203']])
    const [userExtList, setuserExtList] = useState([])
    const [peerCameraList, setpeerCameraList] = useState(['','','','','']);


    const [peoplelist, setpeoplelist] = useState(false);
    const [showNavMobile, setshowNavMobile] = useState(false);
    const [sharedDoc, setsharedDoc] = useState(false);
    const [chatroom, setchatroom] = useState(false);
    const [extra, setextra] = useState(false);
    const [addLink, setaddLink] = useState(false);

    const [show, setShow] = useState([['block','none'], ['block','none'], ['block','none'], ['block','none'], ['block','none']]);

    var title = '';
    var url = '';
    const [camera, setCamera] = useState(false);

    const [addMenuCategory, setaddMenuCategory] = useState(
        {
            fruit: [
                {
                    id: 0,
                    title: "공유 문서함",
                    selected: false,
                    key: "fruit"
                },
                {
                    id: 1,
                    title: "채팅방",
                    selected: false,
                    key: "fruit"
                },
                {
                    id: 2,
                    title: "기타",
                    selected: false,
                    key: "fruit"
                }
            ]
        }
    );

    const [addMenu, setaddMenu] = useState(-1);

    const selfCameraShow = (e, data) =>{
        var templist = [...show]
        templist[1][0] = 'none'
        templist[1][1] = 'block'
        setShow(templist)
    }

    const addItem = () => {
        if (addMenu == 0) {
            var templist = [...userurlist]
            templist.push([title, url]);
            setuserurllist(templist);
        } else if (addMenu == 1) {
            var templist = [...userchatist]
            templist.push([title, url])
            setuserchatist(templist)
        } else if (addMenu == 2) {
            var templist = [...userExtList]
            templist.push([title, url])
            setuserExtList(templist)
        }
        setaddLink(!addLink)
    }

    const handlefilechange = () => {
        console.log(userExtList);
        socketRef.current.emit("file change",{userurlist,userchatist,userExtList});
    }

    const onContentChangeTitle = (e) => {
        title = e.currentTarget.value;
    }

    const onContentChangeUrl = (e) => {
        url = e.currentTarget.value;
    };

    const addbuttonclick = () => {
        console.log(addMenu);
        setaddLink(!addLink);
        setaddMenu(-1)
    }

    const resetThenSet = (id, key) => {
        let temp = JSON.parse(JSON.stringify(addMenuCategory.fruit));
        temp.forEach((item) => (item.selected = false));
        temp[id].selected = true;
        setaddMenuCategory({
            fruit: temp
        });
        setaddMenu(id);
    };


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
        setvlConstraint2(865 + e.x)
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

    const peerCamera = (e,data, peerNick) => {
        var templist = [...show];
        templist[checkarea(e.clientX, e.clientY) - 1][0] = 'none';
        templist[checkarea(e.clientX, e.clientY) - 1][1] = 'block';

        var templist2 = [...peerCameraList];
        templist2[checkarea(e.clientX, e.clientY) - 1] = peerNick;

        console.log('why?')
        console.log(templist);
        console.log(templist2);
        setShow(templist);
        setpeerCameraList(templist2);
    }

    const temp = (e, data, url) => {
        var templist = [...urllist];
        templist[checkarea(e.clientX, e.clientY) - 1] = url;
        
        var templist2 = [...show];
        templist2[checkarea(e.clientX, e.clientY) - 1][0] = 'block';
        templist2[checkarea(e.clientX, e.clientY) - 1][1] = 'none';
        setUrlList(templist);
        setShow(templist2);
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

    const peoplelistelement = peers.map(peer => {
        return (
            <li
                className={cn({
                    ["open-item"]: peoplelist
                })}
            >
                <div class="sidebarData" draggable onDragEnd={(e, data) => peerCamera(e, data, peer.peerNick)}>
                    {peer.peerNick}
                </div>
            </li>
        )
    })

    const urlelement = userurlist.map(url => {
        return (
            <li
                className={cn({
                    ["open-item"]: sharedDoc
                })}
            >
                <div class="sidebarData" draggable onDragEnd={(e, data) => temp(e, data, url[1])}>
                    {url[0]}
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
                    ["open-item"]: chatroom
                })}
            >
                <div class="sidebarData" draggable onDragEnd={(e, data) => temp(e, data, url[1])}>
                    {url[0]}
                </div>
            </li>
        )
    })

    const userExtListelement = userExtList.map(url => {
        return (
            <li
                className={cn({
                    ["open-item"]: extra
                })}
            >
                <div class="sidebarData" draggable onDragEnd={(e, data) => temp(e, data, url[1])}>
                    {url[0]}
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

    const gotoExtraRoom = () => {
        setextra(!extra)
    }

    const threeLineButton = () => {
        if (showNavMobile == false) {
            setshowNavMobile(true);
        } else {
            setpeoplelist(false);
            setshowNavMobile(false);
            setsharedDoc(false);
            setchatroom(false);
            setextra(false);
        }
    }

    const tempclick = () => {
        console.log("click")
    }

    function Section1() {
        return (
            <>
                <iframe width={leftwidth} height="1000px" src={urllist[0]} title='test' name="test" id="test" scrolling="yes" align="left">이 브라우저는 iframe을 지원하지 않습니다</iframe>
            </>
        )
    }

    return (
        <div className="App">
            <nav>
                <div className="wrap">
                    <div className="logo"><a href="http://localhost:3000/">Yoon Suel</a></div>
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


                    {/* 사이드바 시작화면 */}

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
                            <div class="sidebarData" onClick={() => setpeoplelist(!peoplelist)}>
                                참가자
                            </div>
                        </li>
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <div class="sidebarData" onClick={() => gotoSharedDoc()}>
                                공유 문서함
                            </div>

                        </li>
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <div class="sidebarData" onClick={() => gotoChatRoom()}>
                                채팅
                            </div>
                        </li>
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <div class="sidebarData" onClick={() => gotoExtraRoom()}>
                                기타
                            </div>
                        </li>
                        <li
                            className={cn({
                                ["open-item"]: showNavMobile
                            })}
                        >
                            <div class="sidebarData" onClick={() => leaveRoom()}>
                                방 나가기
                            </div>
                        </li>
                    </ul>


                    {/* 참가자 */}

                    <ul
                        className={cn("nav-links2", {
                            ["open"]: peoplelist
                        })}
                    >
                        <li
                            className={cn({
                                ["open-item"]: peoplelist
                            })}
                        >
                            <div class="sidebarData">
                                참가자
                            </div>
                        </li>

                        <li
                            className={cn({
                                ["open-item"]: peoplelist
                            })}
                        >
                            <div class="sidebarData" draggable onDragEnd={(e, data) => selfCameraShow()}>
                                자기자신
                            </div>
                        </li>

                        {peoplelistelement}

                        <li
                            className={cn({
                                ["open-item"]: peoplelist
                            })}
                        >
                            <div class="sidebarData" onClick={() => setpeoplelist(!peoplelist)}>
                                나가기
                            </div>
                        </li>
                    </ul>

                    {/* 공유문서함 */}

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
                            <div class="sidebarData">
                                공유 문서함
                            </div>
                        </li>

                        {urlelement}

                        <li
                            className={cn({
                                ["open-item"]: chatroom
                            })}
                        >
                            <div class="sidebarData" onClick={() => handlefilechange()}>
                                동기화
                            </div>

                        </li>

                        <li
                            className={cn({
                                ["open-item"]: sharedDoc
                            })}
                        >
                            <div class="sidebarData" onClick={() => setsharedDoc(!sharedDoc)}>
                                나가기
                            </div>
                        </li>
                    </ul>



                    {/* 채팅함 */}


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
                            <div class="sidebarData">
                                채팅
                            </div>
                        </li>

                        {chatelement}

                        <li
                            className={cn({
                                ["open-item"]: chatroom
                            })}
                        >
                            <div class="sidebarData" onClick={() => handlefilechange()}>
                                동기화
                            </div>

                        </li>

                        <li
                            className={cn({
                                ["open-item"]: chatroom
                            })}
                        >
                            <div class="sidebarData" onClick={() => setchatroom(!chatroom)}>
                                나가기
                            </div>

                        </li>
                    </ul>

                    {/* 기타 */}


                    <ul
                        className={cn("nav-links2", {
                            ["open"]: extra
                        })}
                    >
                        <li
                            className={cn({
                                ["open-item"]: extra
                            })}
                        >
                            <div class="sidebarData">
                                기타
                            </div>
                        </li>

                        {userExtListelement}

                        <li
                            className={cn({
                                ["open-item"]: chatroom
                            })}
                        >
                            <div class="sidebarData" onClick={() => handlefilechange()}>
                                동기화
                            </div>

                        </li>

                        <li
                            className={cn({
                                ["open-item"]: extra
                            })}
                        >
                            <div class="sidebarData" onClick={() => setextra(!extra)}>
                                나가기
                            </div>
                        </li>
                    </ul>

                    {/* 아이템 추가하기 */}

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

                            <div class="sidebarData" onClick={() => setextra(!extra)}>
                                추가
                            </div>
                        </li>

                        {/* <li
              className={cn({
                ["open-item"]: addLink
              })}
            >


            <Dropdown
            title="카테고리"
            list={addMenuCategory.fruit}
            resetThenSet={resetThenSet}
          />
            </li> */}


                        <li
                            className={cn({
                                ["open-item"]: addLink
                            })}
                        >
                            <Dropdown
                                title="카테고리"
                                list={addMenuCategory.fruit}
                                resetThenSet={resetThenSet}
                            />
                            <div className='dd-header2'>
                                <textarea name="mb_self" rows="5" cols="35" onChange={onContentChangeTitle}></textarea>
                            </div>
                            <div class="sidebarData" onClick={() => setaddLink(!addLink)}>
                                제목
                            </div>
                            <div className='dd-header2'>
                                <textarea name="mb_self" rows="5" cols="35" onChange={onContentChangeUrl}></textarea>
                            </div>
                            <div class="sidebarData" onClick={() => setaddLink(!addLink)}>
                                링크
                            </div>

                        </li>

                        <li
                            className={cn({
                                ["open-item"]: addLink
                            })}
                        >
                            {/* <a href="#" onClick={() => }>저장하기</a> */}
                        </li>



                        <li
                            className={cn({
                                ["open-item"]: addLink
                            })}
                        >
                            <div class="sidebarData" onClick={() => addItem(handlefilechange)}>
                                저장하기
                            </div>
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
                    <iframe width={leftwidth} height="1000px" src={urllist[0]} title='test' name="test" id="test" scrolling="yes" align="left" style={{ display: show[0][0] }}>이 브라우저는 iframe을 지원하지 않습니다</iframe>
                    <Container style={{ width: (leftwidth), height: "1000px", position: 'absolute', display:show[0][1]}}>
                        {peers.map((peer) => {
                            
                            console.log('section 1')
                            console.log(peer.peerNick)
                            console.log(peerCameraList[0])
                            console.log((peer.peerNick == peerCameraList[0]))
                            if((peer.peerNick == peerCameraList[0])) {
                                return (
                                    <div>
                                        <Video key={peer.peerID} peer={peer.peer} />
                                    </div>
                                );
                            }
                        })}
                    </Container>

                    {/* <Section1/> */}
                </div>
                <Draggable bounds={{ right: (vlConstraint[0] - 856) }} axis='x' onStop={(e, data) => trackPos1(e, data)} onDrag={(e, data) => handleGrab1(data)} >
                    <div className="vl" style={{ marginLeft: 856, opacity: opacityValue[0] ? 1 : 0.5, cursor: 'e-resize' }} >
                    </div>
                </Draggable>
                {/* </div> */}
            </div>

            <div>
                <div className="vl4" style={{ marginLeft: vlConstraint2 - 5, height: heightValue, opacity: opacityValue[2] ? 1 : 0.5, cursor: 'e-resize' }} >
                    <iframe width={vlConstraint[1][0] - vlConstraint2 + 5} height={heightValue} src={urllist[1]} title='test' name="test" id="test" scrolling="yes" align="left" style={{ display: show[1][0] }}>이 브라우저는 iframe을 지원하지 않습니다</iframe>
                    {/* <img id='img1' width={ vlConstraint[1][0]-vlConstraint2 +5 } height={ heightValue } src = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ7IB6Ai52BgQezn9Uid6XYFst6BARdp6mev-94mVHucrbD5FfV' alt=''></img> */}
                    <Container style={{ width: (vlConstraint[1][0] - vlConstraint2 + 5), height: heightValue, position: 'absolute', display:  show[1][1] }}>
                        <Col>
                            <StyledVideo muted ref={userVideo} autoPlay playsInline />
                            <Row>
                                <button onClick={shareScreen}>Share screen</button>
                                <button onClick={HideCam}>{camText}</button>
                                <button onClick={MuteAudio}>{muteText}</button>
                            </Row>
                        </Col>
                    </Container>


                </div>
                <div className="vl4" style={{ marginLeft: vlConstraint2 - 5, marginTop: heightValue + 5, height: (1000 - heightValue), opacity: opacityValue[2] ? 1 : 0.5, cursor: 'e-resize' }} >
                <iframe width={vlConstraint[1][1] - vlConstraint2 + 5} height={(1000 - heightValue - 5)} src={urllist[3]} title='test' name="test" id="test" scrolling="yes" align="left" style={{ display: show[3][0] }}>이 브라우저는 iframe을 지원하지 않습니다</iframe>
                <Container style={{ width: (vlConstraint[1][1] - vlConstraint2 + 5), height: (1000 - heightValue - 5), position: 'absolute', display:show[3][1]}}>
                        {peers.map((peer) => {
                            console.log('please')
                            console.log(peer)
                            if(peer.peerNick == peerCameraList[3]){
                                return (
                                    <div>
                                        <Video key={peer.peerID} peer={peer.peer} />
                                    </div>
                                );
                            }
                        })}
                    </Container>
                    {/* <img id='img1' width={ vlConstraint[1][1]-vlConstraint2 +5 } height={ (1000-heightValue) } src = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ7IB6Ai52BgQezn9Uid6XYFst6BARdp6mev-94mVHucrbD5FfV' alt=''></img> */}

                    {/* <Container style={{ width: (vlConstraint[1][1] - vlConstraint2 + 5), height: (1000 - heightValue - 5) }}>
                        <Col>
                    <StyledVideo muted ref={userVideo} autoPlay playsInline />
                    <Row>
                        <button onClick={shareScreen}>Share screen</button>
                        <button onClick={HideCam}>{camText}</button>
                        <button onClick={MuteAudio}>{muteText}</button>
                    </Row>
                </Col>
                        {peers.map((peer) => {
                            return (
                                <Video key={peer.peerID} peer={peer.peer} />
                            );
                        })}

                    </Container> */}
                    <Container style={{ width: (vlConstraint[1][1] - vlConstraint2 + 5), height: (1000 - heightValue - 5), position: 'absolute', display:show[3][1]}}>
                        {peers.map((peer) => {
                            console.log('please')
                            console.log(peer)
                            if(peer.peerNick == peerCameraList[3]){
                                return (
                                    <div>
                                        <Video key={peer.peerID} peer={peer.peer} />
                                    </div>
                                );
                            }
                        })}
                    </Container>                
                </div>
                <Draggable bounds={{ left: -(1400 - vlConstraint2) }} axis='x' onStop={(e, data) => trackPos3(e, data)} onDrag={(e, data) => handleGrab3(data)} >
                    <div className="vl2" style={{ marginLeft: 1400, height: heightValue, opacity: opacityValue[2] ? 1 : 0.5, cursor: 'e-resize' }} >
                    <iframe width={1900 - vlConstraint[1][0]} height={heightValue} src={urllist[2]} title='test' name="test" id="test" scrolling="yes" align="left" style={{ display: show[2][0] }}>이 브라우저는 iframe을 지원하지 않습니다</iframe>
                        
                    <Container style={{ width: (1900 - vlConstraint[1][0]), height: (heightValue), position: 'absolute', display:show[2][1]}}>
                        {peers.map((peer) => {
                            console.log('please')
                            console.log(peer)
                            if(peer.peerNick == peerCameraList[2]){
                                return (
                                    <div>
                                        <Video key={peer.peerID} peer={peer.peer} />
                                    </div>
                                );
                            }
                        })}
                    </Container>
                        {/* <img id='img1'  width={ 1900-vlConstraint[1][0] } height={ heightValue } src = 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQ7IB6Ai52BgQezn9Uid6XYFst6BARdp6mev-94mVHucrbD5FfV' alt=''></img> */}
                    </div>
                </Draggable>
                <Draggable bounds={{ left: -(1405 - vlConstraint2) }} axis='x' onStop={(e, data) => trackPos4(e, data)} onDrag={(e, data) => handleGrab4(e, data)} >
                    <div className="vl3" style={{ marginLeft: 1400, marginTop: (heightValue + 5), height: (1000 - heightValue - 5), opacity: opacityValue[3] ? 1 : 0.5, cursor: 'e-resize' }} >
                    <iframe width={1900 - vlConstraint[1][1]} height={(1000 - heightValue - 5)} src={urllist[4]} title='test' name="test" id="test" scrolling="yes" align="left" style={{ display: show[4][0] }}>이 브라우저는 iframe을 지원하지 않습니다</iframe>
                    <Container style={{ width: (1900 - vlConstraint[1][1]), height: (1000 - heightValue - 5), position: 'absolute', display:show[4][1]}}>
                        {peers.map((peer) => {
                            console.log('please')
                            console.log(peer)
                            if(peer.peerNick == peerCameraList[4]){
                                return (
                                    <div>
                                        <Video key={peer.peerID} peer={peer.peer} />
                                    </div>
                                );
                            }
                        })}
                    </Container>
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
