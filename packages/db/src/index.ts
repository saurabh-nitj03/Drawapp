// import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from './generated/prisma'
// import { PrismaClient } from "@prisma/client";
//  const  prismaClient= new PrismaClient();
//  export default prismaClient;

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const { PrismaClient } = require("@prisma/client");

// const prismaClient = new PrismaClient();
// module.exports =  {prismaClient};
// // export prismaClient;

// import { PrismaClient } from "@prisma/client";

// export const prismaClient = new PrismaClient();

const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();
// export default prismaClient
module.exports={
    prismaClient
}