// "use client"

// import { useEffect  ,useState} from "react"
// import { useRef } from "react";
// import { Icon } from "./Icon";

// import {Circle , Pencil ,Square,Minus ,Plus} from "lucide-react"
// import { Game } from "@/draw/Game";

// export type Tool = "circle" | "rect" | "pencil" | "hand"
// export default function Canvas( {roomId,socket}:{
//     roomId:string,
//     socket:WebSocket
// } ){
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const [selectedTool,setSelectedTool]  = useState<Tool>("hand");
//     const [game,setGame] = useState<Game>();

//     useEffect(()=>{
//         if(game){
//             game.setTool(selectedTool);
//         }
//     },[game,selectedTool]);

//     useEffect(()=>{
//         if(canvasRef.current){
//             const g = new Game(canvasRef.current,roomId,socket);
//             setGame(g);

//             return ()=>{
//                 g.destroy();
//             }
//         }
//     },[canvasRef])

//     useEffect(()=>{
//         const canvas = canvasRef.current;
//         if(!canvas) return ;

//         const resize = () => {
//             console.log("resize trigering")
//             canvas.width = window.innerWidth;
//             canvas.height = window.innerHeight;
//             console.log(canvas.width , canvas.height);
//             game?.clearCanvas();
//         }
//         resize();
//         window.addEventListener("resize", resize);
//          return () => window.removeEventListener("resize", resize);
//     })

//     return (
//         // <div style={{
//         //     height:"100vh",
//         //     overflow:"hidden"
//         // }}>
//         //     <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
//         //     <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>

//         // </div>
//         <div className="relative w-screen h-screen overflow-hidden">
//             <canvas className="absolute left-0 top-0 w-full h-full " ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
//             <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>

//         </div>
//     )

// }

// function Topbar({selectedTool,setSelectedTool}:{
//     selectedTool:Tool,
//     setSelectedTool: (s:Tool) => void
// }){
//     return <div style={{
//         position:"fixed",
//         top:10,
//         left:10
//     }}>
//         <div className="flex gap-2 justify-center bg-gray-950 border border-gray-700 rounded-xl px-4 py-2">
//             <Icon icon={<Square/>} onClickHandler={() =>{
//                 setSelectedTool("rect")
//             }} activated={selectedTool === 'rect'}/>
//             <Icon icon={<Circle/>} onClickHandler={() =>{
//                 setSelectedTool("circle")
//             }} activated={selectedTool === 'circle'}/>
//             <Icon icon={<Pencil/>} onClickHandler={() =>{
//                 setSelectedTool("pencil")
//             }} activated={selectedTool === 'pencil'}/>

//         </div>
//     </div>
// }


"use client"

import { useEffect, useState, useRef } from "react"
import { Icon } from "./Icon";

import { Circle, Pencil, Square, Minus, Plus ,Undo,Redo ,Delete,Diamond , ArrowBigDown , Text} from "lucide-react"
import { Game } from "@/draw/Game"; // Make sure this path is correct

export type Tool = "circle" | "rect" | "pencil" | "hand" | "undo" | "redo" | "clear" | "rhombus" | "line" | "text"

export default function Canvas({ roomId, socket }: {
    roomId: string,
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("hand");
    const [game, setGame] = useState<Game>();

    // Effect to set the tool on the Game instance
    useEffect(() => {
        if (game) {
            game.setTool(selectedTool);
        }
    }, [game, selectedTool]); // Dependencies ensure this runs when game or selectedTool changes

    // Effect to initialize the Game instance
    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            // Cleanup function to destroy the Game instance when component unmounts
            return () => {
                g.destroy();
            }
        }
    }, [canvasRef, roomId, socket]); // Dependencies: canvasRef for element, roomId/socket if they can change

    // Removed the separate useEffect for resize, as Game class handles it internally.
    // The Game constructor already sets canvas.width/height and adds a resize listener.

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <canvas
                className="absolute left-0 top-0 w-full h-full"
                ref={canvasRef}
                // Initial width/height are set here, but Game's onResize will ensure it adapts
                width={window.innerWidth}
                height={window.innerHeight}
                tabIndex={1}
            ></canvas>
            <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} game={game} />
        </div>
    )
}

function Topbar({ selectedTool, setSelectedTool ,game }: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
    game:Game | undefined
}) {
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10
    }}>
        <div className="flex gap-2 justify-center bg-gray-950 border border-gray-700 rounded-xl px-4 py-2">
            <Icon icon={<Square />} onClickHandler={() => {
                setSelectedTool("rect")
            }} activated={selectedTool === 'rect'} />
            <Icon icon={<Circle />} onClickHandler={() => {
                setSelectedTool("circle")
            }} activated={selectedTool === 'circle'} />
            <Icon icon={<Pencil />} onClickHandler={() => {
                setSelectedTool("pencil")
            }} activated={selectedTool === 'pencil'} />
            <Icon icon={<Diamond />} onClickHandler={() => {
                setSelectedTool("rhombus")
            }} activated={selectedTool === 'rhombus'} />
            <Icon icon={<ArrowBigDown />} onClickHandler={() => {
                setSelectedTool("line")
            }} activated={selectedTool === 'line'} />
            <Icon icon={<Text />} onClickHandler={() => {
                setSelectedTool("text")
            }} activated={selectedTool === 'text'} />
            <Icon icon={<Undo />} onClickHandler={() => {
                // setSelectedTool("undo")
                game?.undo();
               
            }} activated={selectedTool === 'undo'} />
            <Icon icon={<Redo />} onClickHandler={() => {
                // setSelectedTool("redo")
                game?.redo();
            }} activated={selectedTool === 'redo'} />
            <Icon icon={<Delete />} onClickHandler={() => {
                setSelectedTool("clear")
                game?.redo();
            }} activated={selectedTool === 'clear'} />
            <Icon icon={<span className="font-semibold text-lg cursor-grab">🖐️</span>} onClickHandler={() => {
                setSelectedTool("hand")
            }} activated={selectedTool === 'hand'}/> {/* Added hand tool icon */}
        </div>
    </div>
}