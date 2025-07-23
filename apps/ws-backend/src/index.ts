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
                    if(user.rooms.includes(String(r)) && user.ws != socket){
                        user.ws.send(JSON.stringify({
                            type:"chat",
                            message:message,
                            roomId:r
                        }))
                    }
                } )
            } else if (parsedData.type === "undo") {
    const r = parsedData.roomId; // Assuming roomId is directly a string/number here
    // No message content needed for undo, just the action type and room
    console.log(`Received undo from room: ${r}, user: ${userId}`);

    // *** IMPORTANT: SERVER-SIDE STATE MANAGEMENT FOR UNDO/REDO ***
    // For robust undo/redo, the server should ideally maintain the canvas state for each room.
    // When an undo message is received, the server would:
    // 1. Pop the last state from its internal undo stack for that room.
    // 2. Push the current state to its internal redo stack for that room.
    // 3. Update its internal current state for that room.
    // 4. Then, send the *new current state* to all clients, or just the 'undo' command.
    // This is more complex than simple broadcasting.

    // For a simpler approach (client-driven undo/redo, server just relays):
    // Broadcast the 'undo' command to all other users in the same room
    const message = parsedData.message;
    await prismaClient.chat.deleteMany({
        where:{
            message:message
        }
    })
    users.forEach(user => {
        if (user.rooms.includes(String(r)) && user.ws !== socket) {
            user.ws.send(JSON.stringify({
                type: "undo",
                roomId: r,
                senderId: userId // Include senderId so client can skip processing its own message
            }));
        }
    });

} else if (parsedData.type === "redo") {
    const r = Number(parsedData.roomId[0]); // Assuming roomId is directly a string/number here
    // No message content needed for redo, just the action type and room
    console.log(`Received redo from room: ${r}, user: ${userId}`);

    // *** IMPORTANT: SERVER-SIDE STATE MANAGEMENT FOR UNDO/REDO ***
    // Similar to undo, the server should manage its internal redo stack here.

    // For a simpler approach (client-driven undo/redo, server just relays):
    // Broadcast the 'redo' command to all other users in the same room
    const message =  parsedData.message;
    await prismaClient.chat.create({
        data:{
            roomId:r,
            message,
            userId
        }
    })
    users.forEach(user => {
        if (user.rooms.includes(String(r)) && user.ws !== socket) {
            user.ws.send(JSON.stringify({
                type: "redo",
                roomId: r,
                senderId: userId // Include senderId so client can skip processing its own message
            }));
        }
    });
    
} else if(parsedData.type === "clear"){
    const r = Number(parsedData.roomId[0]);
    await prismaClient.chat.deleteMany({
        where:{
            roomId:r
        }
    })
    users.forEach(user => {
        if (user.rooms.includes(String(r)) && user.ws !== socket) {
            user.ws.send(JSON.stringify({
                type: "clear",
                roomId: r,
            }));
        }
    });

}
else if (parsedData.type === "sync_state") {
    // This part of the server would handle requests for full state sync
    // For example, if a client just joined and needs the current canvas.
    // This assumes the server stores the canonical state for each room.
    // Example:
    /*
    const r = parsedData.roomId;
    if (serverCanvasStates.has(r)) { // serverCanvasStates would be a Map storing current shapes for each room
        ws.send(JSON.stringify({
            type: "sync_state",
            shapes: serverCanvasStates.get(r), // Send the actual shapes array
            roomId: r
        }));
    }
    */
    // For now, if not managing state on server, you might not implement this.
}
        // }
        // socket.send("pong");
    });
});
