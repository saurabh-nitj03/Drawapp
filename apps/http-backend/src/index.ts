import express from "express"
import userRoutes from "./routes/user.route"
import userMiddleware from "./middleware/userMiddleware";
import cors from "cors"

import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

import {createRoomSchema} from "@repo/common/config"
const {prismaClient} = require("@repo/db/client")
// console.log(prismaClient)

// console.log(userSchema);
// console.log(signinSchema);
// console.log(createRoomSchema)


const app=express();

app.use(express.json())
app.use(cors
    ({
        origin:'*'
    })
)

app.use("/user",userRoutes);

app.post("/room",userMiddleware,async (req,res)=>{
    try {
        const data=createRoomSchema.safeParse(req.body);
        // console.log(data);
        if(!data.success){
            res.json({
                status:false,
                message:data.error.errors[0]?.message
            });
            return ;
        }
        // db call
        const room = await prismaClient.room.findUnique({
            where:{
                slug:data.data.name
            }
        })
        // console.log(room)
        if(room){
            res.status(500).json({
                success:false,
                message:"Room already existed with this slug , try with a different slug"
            })
            return ;  
        }
        const userId=req.userId;
        // console.log(userId);
        const newRoom = await prismaClient.room.create({
            data:{
                slug:data.data.name,
                adminId:userId
            }
        })
        // console.log(newRoom)
        if(!newRoom){
            res.status(500).json({
                success:false,
                message:"Some error ocurred while creating room"
            })
            return ;
        }
        res.status(200).json({
            success:true,
            message:newRoom.id
        })
    } catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message:err
        })
    }
})

app.get("/chats/:roomId",async(req,res)=>{
     const roomId = Number(req.params.roomId);
     if(!roomId){
        res.status(500).json({
            success:false,
            message:"Integer room numbe rmust be required"
        })
     }
     const messages=await prismaClient.chat.findMany({
        where:{
            roomId:roomId
        },
        orderBy:{
            id:"asc"
        },
        take:1000
     })
     if(!messages){
        res.status(500).json({
            succcess:false,
            message:"Message not found"
        })
     }

     res.status(200).json({
        success:true,
        message:messages
     })
})

app.get('/room/:slug',async(req,res)=>{
    try{
        const slug= req.params.slug;
        const room = await prismaClient.room.findFirst({
            where:{
                slug:slug
            }
        })
        console.log(room)
        if(!room){
            res.status(500).json({
                success:false,
                message:"Room not existed"
            })
            return ;
        }
        res.status(200).json({
            success:true,
            message:room.id
        })
    } catch(err){
        res.status(500).json({
            success:false,
            message:err
        })
    }

})

app.listen(8000); 

app.get("/",(req,res)=>{
    res.send("Hii..")
})

export default prismaClient