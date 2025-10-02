"use server"
import { auth } from "@clerk/nextjs/server";

import { eventSchema } from "@/app/lib/validators";
import { db } from "@/lib/prisma";

//Api route to create a new event

export async function createEvent(data) {
    const {userId} = await auth();
    console.log("User ID:", userId);
    if(!userId){
        throw new Error("User not authenticated");
    }

    const validatedData = eventSchema.parse(data);

    const user = await db.user.findUnique({
        where:{clerkUserId:userId},
    })
    
    if(!user){
        throw new Error("User not found");
    }

    const event = await db.event.create({
        data:{
            ...validatedData,
            userId:user.id,
        }
    })

    return event;
}