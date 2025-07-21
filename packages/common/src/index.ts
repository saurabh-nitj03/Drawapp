import {z} from "zod";

export const userSchema=z.object({
    email:z.string().min(3,{message:"Email cannot be less than 3"}).max(20,{message:"Email cannot be greater than 20"}),
    password:z.string(),
    name:z.string()
})

export const signinSchema=z.object({
    email:z.string().min(1,{message:"Email is required"}).max(20),
    password:z.string().min(1,{message:"Password is required"})
})

export const createRoomSchema=z.object({
    name:z.string().min(3).max(20)
})