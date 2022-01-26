import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";

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
import Dots from "../Dots";
import { Nav } from "react-bootstrap";

import IMGitemOne from "../img/itemOne.png";
import IMGoneFirst from "../img/exFirst.png";
import IMGoneSecond from "../img/exSecond.png";
import IMGoneThird from "../img/exThird.png";
import IMGoneFour from "../img/exFour.png";

import Zoom from "react-reveal/Zoom";
import Bounce from "react-reveal/Bounce";
import Spin from "react-reveal/Spin";
import Jello from "react-reveal/Jello";
import Wobble from "react-reveal/Wobble";

const DIVIDER_HEIGHT = 5;

const CreateRoom = (props) => {
    const [exOneShow, exOneShowC] = useState(true);
    const [oneSpinClickS, oneSpinClickC] = useState(1);
  
    const outerDivRef = useRef();
    const [scrollIndex, setScrollIndex] = useState(1);
  
    let [itemOneS, itemOneSC] = useState({ padding: "0px 0px 200px 0px" });
  
    let [imgOneS, imgOneSC] = useState({ margin: "160px 0px 0px 240px" });
    let [getExOneS, getExOneSC] = useState({ padding: "200px 0px 0px 310px" });
  
    // let [imgOneMoreS, imgOneMoreSC] = useState({
    //   margin: "-306px 0px 0px -230px",
    // });
    // let [getExOneMoreS, getExOneMoreSC] = useState({
    //   margin: "-276px 0px 0px -160px",
    // });
  
    let [exOneBtn, exOneBtnC] = useState({
      margin: "30px 0px 0px 0px",
    });
    let [exOneMoreBtn, exOneMoreBtnC] = useState({
      margin: "200px 0px 0px 20px",
    });
    let [oneSpinClickBtn, oneSpinClickBtnC] = useState({
      margin: "10px 0px 0px 200px",
    });
  
    function exOneClick() {
      exOneShowC(!exOneShow);
    }
    function oneSpinClick() {
      oneSpinClickC(oneSpinClickS + 1);
    }
  
    useEffect(() => {
      const wheelHandler = (e) => {
        e.preventDefault();
        const { deltaY } = e;
        const { scrollTop } = outerDivRef.current;
        const pageHeight = window.innerHeight;
  
        if (deltaY > 0) {
          if (scrollTop >= 0 && scrollTop < pageHeight) {
            console.log("현재 1페이지, down");
            outerDivRef.current.scrollTo({
              top: pageHeight + DIVIDER_HEIGHT,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(2);
          } else if (scrollTop >= pageHeight && scrollTop < pageHeight * 2) {
            console.log("현재 2페이지, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 2 + DIVIDER_HEIGHT * 2,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(3);
          } else if (scrollTop >= pageHeight * 2 && scrollTop < pageHeight * 3) {
            console.log("현재 3페이지, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 3 + DIVIDER_HEIGHT * 3,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(4);
          } else if (scrollTop >= pageHeight * 3 && scrollTop < pageHeight * 4) {
            console.log("현재 4페이지, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 4 + DIVIDER_HEIGHT * 4,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(5);
          } else if (scrollTop >= pageHeight * 4 && scrollTop < pageHeight * 5) {
            console.log("현재 5페이지, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 5 + DIVIDER_HEIGHT * 5,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(6);
          } else {
            console.log("현재 5페이지, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 5 + DIVIDER_HEIGHT * 5,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(6);
          }
        } else {
          if (scrollTop >= 0 && scrollTop < pageHeight) {
            console.log("현재 1페이지, up");
            outerDivRef.current.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(1);
          } else if (scrollTop >= pageHeight && scrollTop < pageHeight * 2) {
            console.log("현재 1페이지, up");
            outerDivRef.current.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(1);
          } else if (scrollTop >= pageHeight * 2 && scrollTop < pageHeight * 3) {
            console.log("현재 2페이지, up");
            outerDivRef.current.scrollTo({
              top: pageHeight + DIVIDER_HEIGHT,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(2);
          } else if (scrollTop >= pageHeight * 3 && scrollTop < pageHeight * 4) {
            console.log("현재 3페이지, up");
            outerDivRef.current.scrollTo({
              top: pageHeight * 2 + DIVIDER_HEIGHT * 2,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(3);
          } else if (scrollTop >= pageHeight * 4 && scrollTop < pageHeight * 5) {
            console.log("현재 4페이지, up");
            outerDivRef.current.scrollTo({
              top: pageHeight * 3 + DIVIDER_HEIGHT * 3,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(4);
          } else {
            console.log("현재 5페이지, up");
            outerDivRef.current.scrollTo({
              top: pageHeight * 4 + DIVIDER_HEIGHT * 4,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(5);
          }
        }
      };
  
      const outerDivRefCurrent = outerDivRef.current;
      outerDivRefCurrent.addEventListener("wheel", wheelHandler);
      return () => {
        outerDivRefCurrent.removeEventListener("wheel", wheelHandler);
      };
    }, []);



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
                <div ref={outerDivRef} className="Apps">
      <Dots scrollIndex={scrollIndex} />
      <Jello>
        <div className="mainBack">
          <Zoom bottom cascade>
            <div className="titleMain">YoonSuel</div>
            <div className="exMain">
              햇빛이나 달빛에 비치어 반짝이는 잔물결.
            </div>
          </Zoom>
        </div>
      </Jello>

      {/* Notice No.1 */}
      <div className="getNoteOne">
        <Title></Title>
        <Spin cascade>
          <p className="noteOneOne">지금까지의 작업 방식은 잊어라.</p>
          <p className="noteOneTwo">일의 효율을 폭발적으로 높여줄</p>
          <p className="noteOneThree">새로운 발걸음.</p>
        </Spin>
        {/* <button
          className="btn btn-secondary"
          type="button"
          style={oneSpinClickBtn}
          onClick={oneSpinClick}
        >
          <strong>Spin {oneSpinClickS}</strong>
        </button> */}
      </div>

      <div className="divider"></div>

      {/* Item No.5 */}
      <div className="itemOne" style={itemOneS}>
        <Title></Title>
        <Bounce left opposite cascade when={exOneShow}>
          <div className="getImageOne">
            <img src={IMGitemOne} className="imageOne" style={imgOneS} />
          </div>
        </Bounce>
        <button
          className="btn btn-secondary"
          type="button"
          style={exOneMoreBtn}
          onClick={exOneClick}
        >
          <strong>{exOneShow ? "+" : "="}</strong>
        </button>
        <Bounce left opposite cascade when={exOneShow}>
          <div className="getExplainOne" style={getExOneS}>
            <h3 className="explainOneTitle">
              <strong>Create Room</strong>
            </h3>
            <p className="explainOne">
              <strong>
                작업할 공간을 만들어 보세요. 지금까지 경험한 그 무엇보다 새로운
                공간을 맞이하게 될 것입니다. 변화의 중심에 서있는 당신. 화상회의
                구글독스 카카오톡 유튜브 등의 기능을 한 화면에 작업할 수 있게
                됩니다. 당신의 작업 생활을 바꿔놓을 새로운 윤슬, 지금
                만나보세요.
              </strong>
            </p>
            <a
              className="custom-btn btn-11"
              href="."
              role="button"
              style={exOneBtn}
            >
              Create<div className="dot"></div>
            </a>
          </div>
        </Bounce>
        <Bounce left opposite cascade when={!exOneShow}>
          <div className="EXImageOne">
            <img src={IMGoneSecond} className="exShowOne" />
            <img src={IMGoneFirst} className="exShowSecond" />
            <img src={IMGoneThird} className="exShowThird" />
            <img src={IMGoneFour} className="exShowFour" />
          </div>
        </Bounce>
      </div>

      <div className="divider"></div>

      <Wobble>
        <div className="twoMain">
          <Zoom left cascade>
            <p className="twotwoOne">무엇을 상상하던 그 이상을.</p>
            <p className="twotwoTwo">최고 그 자체가 되기 위해.</p>
          </Zoom>
        </div>
      </Wobble>

      <div className="divider"></div>

      {/* Item No.1 */}
      <div className="itemOne" style={itemOneS}>
        <Title></Title>
        <Bounce left opposite cascade when={exOneShow}>
          <div className="getImageOne">
            <img src={IMGitemOne} className="imageOne" style={imgOneS} />
          </div>
        </Bounce>
        <button
          className="btn btn-secondary"
          type="button"
          style={exOneMoreBtn}
          onClick={exOneClick}
        >
          <strong>{exOneShow ? "+" : "="}</strong>
        </button>
        <Bounce left opposite cascade when={exOneShow}>
          <div className="getExplainOne" style={getExOneS}>
            <h3 className="explainOneTitle">
              <strong>Join Room</strong>
            </h3>
            <p className="explainOne">
              <strong>
                다른 사람이 만든 작업 공간에 참여해 보세요. 상상이 현실이 되는
                짜릿함을 느낄 수 있습니다. 상대방이 만든 작업 공간에서 상대방과
                실시간으로 얼굴을 마주보며 소통할 수 있습니다. 동시에 여러 업무
                창을 활용하여 일의 효율을 높일 수 있기에 최고 그 자체가 될 수
                있습니다. 지금 바로 여기서 함께 나아가 봅시다.
              </strong>
            </p>
            <a
              className="custom-btn btn-11"
              href="."
              role="button"
              style={exOneBtn}
            >
              Go Join<div className="dot"></div>
            </a>
          </div>
        </Bounce>
        <Bounce left opposite cascade when={!exOneShow}>
          <div className="EXImageOne">
            <img src={IMGoneSecond} className="exShowOne" />
            <img src={IMGoneFirst} className="exShowSecond" />
            <img src={IMGoneThird} className="exShowThird" />
            <img src={IMGoneFour} className="exShowFour" />
          </div>
        </Bounce>
      </div>
      <div className="rooms">
            <Button variant="outlined" 
            color= "default" onClick={create}>
                Create room
            </Button>
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
            </div>
        </div>
    );
};

export default CreateRoom;

/*NAVBAR--------------------------------------------------*/
function Title() {
    return (
      <Nav className="navBar">
        <a href="." className="navTitle">
          YoonSuel
        </a>
        <ul className="getNavService">
          <li>
            <a href="." className="navService">
              Create-Room
            </a>
          </li>
          <li>
            <a href="." className="navService">
              Join-Room
            </a>
          </li>
        </ul>
      </Nav>
    );
  }