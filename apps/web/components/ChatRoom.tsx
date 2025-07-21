import axios from "axios"
import { BACKEND_URL } from "../app/config";
import ChatRoomClient from "./ChatRoomClient";
async function getMessages(id:string){
    const res = await axios.get(`${BACKEND_URL}/chats/${id}`);
    if(res.data.success){
        return res.data.message
    }
}

export default async function ChatRoom ({id}:{id :string}){
    const messages=await getMessages(id);
    console.log(messages);
    // return <ChatRoomClient  messages={messages} id={id}/>
    return <ChatRoomClient id={id} messages={messages} />
}