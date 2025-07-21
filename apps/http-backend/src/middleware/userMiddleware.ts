// import jwt from "jsonwebtoken"
// import {JWT_SECRET} from "../utils/constants"

// function userMiddleware(req,res,next){
//     const token=req.headers["authorization"];
//     const decoded=jwt.verify(token,JWT_SECRET) as { id: string } ;

//     if(decoded){
//         req.userId = decoded.id;
//         next();
//     }
//     res.status(403).json({
//         message:"Unauthorised user"
//     })
// }
// export default userMiddleware

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

function userMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction) {
    const token = req.headers["authorization"];
    if (!token) {
         res.status(403).json({ message: "Unauthorised user" });
         return 
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        req.userId = decoded.id;
        next();
    } catch (err) {
         res.status(403).json({ message: "Unauthorised user" });

    }
}

export default userMiddleware;