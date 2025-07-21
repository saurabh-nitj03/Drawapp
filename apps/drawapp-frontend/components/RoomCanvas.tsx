"use client"

import { WS_URL } from "@/config"
import { useEffect, useState } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({roomId}:{roomId:string}){
    const [socket,setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4OWNmYTMxLWFkNjQtNGVkNy1hMjkwLTA3MmQxYTVmZDRmZCIsImlhdCI6MTc1MzEwODYyN30.6niMFy3n6lImb-M5_GAMUarmD3BGuUXFfVLghD-5JKY`);
        console.log(ws);
        ws.onopen = () => {
            setSocket(ws) ;
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }
    },[])

    if(!socket){
        return <div>
            Connecting to server...
        </div>
    }
    return <div>
        <Canvas roomId={roomId} socket={socket}/>
    </div>
}