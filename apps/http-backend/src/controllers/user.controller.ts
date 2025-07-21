import { Request,Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { signinSchema, userSchema } from "@repo/common/config"
import bcrypt from "bcrypt"
// import {prismaClient} from "@repo/db/client"
// import prismaClient from "../index"
const {prismaClient} = require("@repo/db/client");
// const prismaClient= new PrismaClient();
export const signup=async(req:Request,res:Response)=>{
    try {

        const data=userSchema.safeParse(req.body);
        if(!data.success){
            res.json({
                status:false,
                message:data.error.errors[0]?.message
            });
            return ;
        }
        const user = await prismaClient.user.findFirst({
            where:{
                email:data.data?.email
            }
        })
        if(user){
            res.status(500).json({
                success:false,
                message:"User already existed with this email"
            })
        }
        
       const password = await bcrypt.hash(data.data.password,10);
    //    console.log(password)
       const newUser =  await prismaClient.user.create({
            data:{
                email:data.data.email,
                password:password,
                name:data.data.name
            }
       })
    //    console.log(user)
       if(!newUser){
           res.status(500).json({
            success:false,
            message:"User not created"
          })
          return 
       }
        res.status(200).json({
        success:true,
        message:newUser.id
       })
    
    } catch(e){
        console.log("Inside catch ")
        console.log(e);
        res.status(500).json({
            success:false,
            message:e
        })
    }

} 

export const signin= async(req:Request,res:Response)=>{

    try {
        const data=signinSchema.safeParse(req.body);
        // console.log(data.error);
        if(!data.success){
            res.status(500).json({
                status:false,
                message:data.error.errors[0]?.message
            });
            return ;
        }

        const user = await prismaClient.user.findFirst({
            where:{
                email:data.data.email
            }
        })
        if(!user) {
            res.status(500).json({
                success:false,
                message:"No user existed"
            })
        }
        // console.log(data);
        // console.log(user);
        const match = await bcrypt.compare(data.data.password,user.password);
        if(!match) {
            res.status(500).json({
                success:false,
                message:"Incorrect Password"
            })
        }
        const userId=user.id;
        const token=jwt.sign({
            id:userId
        },JWT_SECRET)

        res.status(200).json({
            success:true,
            message:token
        })
   } catch(error){
        res.status(500).json({
            success:false,
            message:error
        })
   }
}