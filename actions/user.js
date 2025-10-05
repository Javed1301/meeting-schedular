"use server"

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server"
// import { success } from "zod";

export async function updateUsername(username){
    const {userId} = await auth();
    console.log("UserID from action", userId);
    if(!userId) throw new Error("User not authenticated");

    const existingUsername = await db.user.findUnique({
        where:{username}
    });

    if(existingUsername && existingUsername.id !== userId){
        throw new Error("Username already taken");
    }

    await db.user.update({
        where:{clerkUserId: userId},
        data:{username}
    })

    const client = await clerkClient(); // ← ADD AWAIT HERE TOO
    await client.users.updateUser(userId,{
        username
    })

    return {success: true};

}

