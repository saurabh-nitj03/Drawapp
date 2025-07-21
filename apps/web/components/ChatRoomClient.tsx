"use client"
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useScoket";

export default function ChatRoomClient({
     messages,id
   }:{
    messages:{message:string
        id:number
        roomId:number
        userId:string
    }[];
    id:string
}){
    const [chats,setChats] = useState<{message:string
        id:number
        roomId:number
        userId:string
    }[]>(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    const {socket,loading}=useSocket();


    useEffect(()=>{
        if(socket && !loading){
            socket.send(JSON.stringify({
                type:"join_room",
                roomId:id
            }));

            socket.onmessage=(event)=>{
                const parsedData= JSON.parse(event.data);
                if(parsedData.type==="chat"){
                    // setChats(c => [...c , {messsage:parsedData.message}])
                     setChats(c => [
                        ...c,
                        {
                            message: parsedData.message,
                            id: parsedData.id,
                            roomId: parsedData.roomId,
                            userId: parsedData.userId
                        }
                    ])
                    
                }
            }
        }
    },[socket, loading, id])
    
    return <div>
        
        {chats.map(m => <div key={m.id}>{m.message}</div>)}

        <input type="text" value={currentMessage} onChange={e => {
            setCurrentMessage(e.target.value);
        }}></input>
        <button onClick={() => {
            socket?.send(JSON.stringify({
                type: "chat",
                roomId: id,
                message: currentMessage
            }))

            setCurrentMessage("");
        }}>Send message</button>
    </div>
}