import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config"
import { WebSocket } from "ws";
const {prismaClient} = require("@repo/db/client")
const wss = new WebSocketServer({ port: 8001 });

interface User{
    ws:WebSocket,
    rooms:string[],
    userId:string
}

const users:User[] = [];

function checkUser(token:string):string | null{
    try{
        const  decoded = jwt.verify(token, JWT_SECRET);
    
        if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
            return  null;
        }
        console.log(decoded);
        return decoded.id ;
    } catch(err){
        return null
    }
    return null;
}

wss.on("connection", (socket, request) => {
    const url = request.url;
    console.log(url);
    if (!url) return;
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token')?.replace('/?token=','')
    console.log(token);
    

    if (!token) {
        socket.close();
        return;
    }
    const userId = checkUser(token);
    if(userId == null){
        socket.close();
        return null;
    }
    users.push({
        ws:socket,
        rooms:[],
        userId
    })
    socket.on("message", async(data) => {
        // console.log(e.toString());
        // const parsedData = JSON.parse(data as unknown as string);
           let parsedData;
            if (typeof data !== "string") {
            parsedData = JSON.parse(data.toString());
            } else {
            parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
            }
        if(parsedData.type === "join_room"){
            const user = users.find(x => x.ws==socket);
            // checkfor room exist it in db or not 
            // check for user have access to room or not
            console.log(parsedData);
            user?.rooms.push(String(parsedData.roomId));
        }
        if(parsedData.type === "leave_room"){
            console.log(parsedData)
            const user = users.find(x => x.ws==socket);
            // user?.rooms.push(parsedData.roomId);
            if(!user){
                return ;
            }
            user.rooms=user?.rooms.filter(x => x !== parsedData.roomId);
        }
        if(parsedData.type === "chat"){
            const r=parsedData.roomId[0];
            const roomId=Number(r);
            console.log(r);
            console.log(roomId);
            const message = parsedData.message;
            console.log(message);

            const chat = await prismaClient.chat.create({
                data:{
                    roomId,
                    message,
                    userId
                }
            })
            console.log(users);

            // const user = users.find(x => x.ws === socket);
            // if(user?.rooms.includes(r)){
                users.forEach( user =>{
                    if(user.rooms.includes(String(r))){
                        user.ws.send(JSON.stringify({
                            type:"chat",
                            message:message,
                            roomId:r
                        }))
                    }
                } )
            }
        // }
        // socket.send("pong");
    });
});
