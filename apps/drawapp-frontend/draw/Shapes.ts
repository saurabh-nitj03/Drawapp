import { BACKEND_URL } from "@/config";
import axios from "axios"

export default async function getExistingShapes(roomId:string){
    const res= await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    if(res.data.success){
        const messages = res.data.message;
        const shapes = messages.map((x:{message:string}) => {
             const m =JSON.parse(x.message)
             if(m.shape) return m.shape
        });
        return shapes;
    }
}