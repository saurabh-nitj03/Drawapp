import axios from "axios"
import { BACKEND_URL } from "../../config/index";
import ChatRoom from "../../../components/ChatRoom";

async function getroomId(slug:string){
    const res=await axios.get(`${BACKEND_URL}/room/${slug}`);
    if(res.data.success){
        return res.data.message
    }
}

export default async function (
    // {
//     params
// }:{
//     params:{
//         slug:string
//     }
// }
{params}: {params: Promise<{ slug: string }>}
){
    const {slug}= await  params;
    const roomId =await getroomId(slug);
    return <ChatRoom id={roomId}/>
}