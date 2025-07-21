"use client"

import { useEffect  ,useState} from "react"
import { useRef } from "react";
import { Icon } from "./Icon";

import {Circle , Pencil ,Square,Minus ,Plus} from "lucide-react"
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil"
export default function Canvas( {roomId,socket}:{
    roomId:string,
    socket:WebSocket
} ){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool,setSelectedTool]  = useState<Tool>("rect");
    const [game,setGame] = useState<Game>();

    useEffect(()=>{
        if(game){
            game.setTool(selectedTool);
        }
    },[game,selectedTool]);

    useEffect(()=>{
        if(canvasRef.current){
            const g = new Game(canvasRef.current,roomId,socket);
            setGame(g);

            return ()=>{
                g.destroy();
            }
        }
    },[canvasRef])

    return (
        <div style={{
            height:"100vh",
            overflow:"hidden"
        }}>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
            <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>

        </div>
    )

}

function Topbar({selectedTool,setSelectedTool}:{
    selectedTool:Tool,
    setSelectedTool: (s:Tool) => void
}){
    return <div style={{
        position:"fixed",
        top:10,
        left:10
    }}>
        <div className="flex gap-2 justify-center bg-gray-950 border border-gray-700 rounded-xl px-4 py-2">
            <Icon icon={<Square/>} onClickHandler={() =>{
                setSelectedTool("rect")
            }} activated={selectedTool === 'rect'}/>
            <Icon icon={<Circle/>} onClickHandler={() =>{
                setSelectedTool("circle")
            }} activated={selectedTool === 'circle'}/>
            <Icon icon={<Pencil/>} onClickHandler={() =>{
                setSelectedTool("pencil")
            }} activated={selectedTool === 'pencil'}/>

        </div>
    </div>
}


