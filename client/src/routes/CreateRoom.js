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
      margin: "30px 20px 0px 0px",
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
            console.log("?????? 1?????????, down");
            outerDivRef.current.scrollTo({
              top: pageHeight + DIVIDER_HEIGHT,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(2);
          } else if (scrollTop >= pageHeight && scrollTop < pageHeight * 2) {
            console.log("?????? 2?????????, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 2 + DIVIDER_HEIGHT * 2,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(3);
          } else if (scrollTop >= pageHeight * 2 && scrollTop < pageHeight * 3) {
            console.log("?????? 3?????????, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 3 + DIVIDER_HEIGHT * 3,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(4);
          } else if (scrollTop >= pageHeight * 3 && scrollTop < pageHeight * 4) {
            console.log("?????? 4?????????, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 4 + DIVIDER_HEIGHT * 4,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(5);
          } else if (scrollTop >= pageHeight * 4 && scrollTop < pageHeight * 5) {
            console.log("?????? 5?????????, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 5 + DIVIDER_HEIGHT * 5,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(6);
          } else {
            console.log("?????? 5?????????, down");
            outerDivRef.current.scrollTo({
              top: pageHeight * 5 + DIVIDER_HEIGHT * 5,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(6);
          }
        } else {
          if (scrollTop >= 0 && scrollTop < pageHeight) {
            console.log("?????? 1?????????, up");
            outerDivRef.current.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(1);
          } else if (scrollTop >= pageHeight && scrollTop < pageHeight * 2) {
            console.log("?????? 1?????????, up");
            outerDivRef.current.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(1);
          } else if (scrollTop >= pageHeight * 2 && scrollTop < pageHeight * 3) {
            console.log("?????? 2?????????, up");
            outerDivRef.current.scrollTo({
              top: pageHeight + DIVIDER_HEIGHT,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(2);
          } else if (scrollTop >= pageHeight * 3 && scrollTop < pageHeight * 4) {
            console.log("?????? 3?????????, up");
            outerDivRef.current.scrollTo({
              top: pageHeight * 2 + DIVIDER_HEIGHT * 2,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(3);
          } else if (scrollTop >= pageHeight * 4 && scrollTop < pageHeight * 5) {
            console.log("?????? 4?????????, up");
            outerDivRef.current.scrollTo({
              top: pageHeight * 3 + DIVIDER_HEIGHT * 3,
              left: 0,
              behavior: "smooth",
            });
            setScrollIndex(4);
          } else {
            console.log("?????? 5?????????, up");
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
        props.history.push({pathname: `/room/${id}`, state:{nickname : '?????????'}});
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
              ???????????? ????????? ????????? ???????????? ?????????.
            </div>
          </Zoom>
        </div>
      </Jello>

      {/* Notice No.1 */}
      <div className="getNoteOne">
        <Title></Title>
        <Spin cascade>
          <p className="noteOneOne">??????????????? ?????? ????????? ?????????.</p>
          <p className="noteOneTwo">?????? ????????? ??????????????? ?????????</p>
          <p className="noteOneThree">????????? ?????????.</p>
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
                ????????? ????????? ????????? ?????????. ???????????? ????????? ??? ???????????? ?????????
                ????????? ???????????? ??? ????????????. ????????? ????????? ????????? ??????. ????????????
                ???????????? ???????????? ????????? ?????? ????????? ??? ????????? ????????? ??? ??????
                ?????????. ????????? ?????? ????????? ???????????? ????????? ??????, ??????
                ???????????????.
              </strong>
            </p>
            <a
              className="custom-btn btn-11"
              role="button"
              style={exOneBtn}
              onClick={create}
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
            <p className="twotwoOne">????????? ???????????? ??? ?????????.</p>
            <p className="twotwoTwo">?????? ??? ????????? ?????? ??????.</p>
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
                ?????? ????????? ?????? ?????? ????????? ????????? ?????????. ????????? ????????? ??????
                ???????????? ?????? ??? ????????????. ???????????? ?????? ?????? ???????????? ????????????
                ??????????????? ????????? ???????????? ????????? ??? ????????????. ????????? ?????? ??????
                ?????? ???????????? ?????? ????????? ?????? ??? ????????? ?????? ??? ????????? ??? ???
                ????????????. ?????? ?????? ????????? ?????? ????????? ?????????.
              </strong>
            </p>
            {rooms.map((room) => {
                return (
                  <a
                  className="custom-btn btn-11"
                  role="button"
                  style={exOneBtn}
                  onClick={() => handleClickOpen(room)}
                  >
                     {room}<div className="dot"></div>
                 </a>
                    );
            })}
             
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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                ??? ????????? ???????????? ???????????????.
                </DialogTitle>
                <DialogActions>
                    <TextField id="outlined-basic" label="?????????" variant="outlined" value={nickname} onChange={(e) => handleChange(e.target.value)} />
                    <Button onClick={handleClose} color="primary">
                    ??????
                    </Button>
                    <Button onClick={handleEnter} color="primary" autoFocus>
                    ??? ??????
                    </Button>
                </DialogActions>
            </Dialog>
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