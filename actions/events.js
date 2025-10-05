"use server"
import { auth } from "@clerk/nextjs/server";

import { eventSchema } from "@/app/lib/validators";
import { db } from "@/lib/prisma";

//Api route to create a new event

export async function createEvent(data) {
    const {userId} = await auth();
    // console.log("User ID:", userId);
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

export async function getUserEvents() {
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    // console.log("User ID:", userId);
    const user = await db.user.findUnique({
        where:{clerkUserId:userId},
    })
    if(!user){
        throw new Error("User not found");
    }

    const events = await db.event.findMany({
        where:{userId:user.id},
        orderBy:{createdAt:"desc"},
        include:{
            _count:{
                select:{bookings:true},
            }
        }
    });

    return{events,username:user.username};
}


export async function deleteEvent(eventId) {
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }
    // console.log("User ID:", userId);
    const user = await db.user.findUnique({
        where:{clerkUserId:userId},
    })
    if(!user){
        throw new Error("User not found");
    }

    const event = await db.event.findUnique({
        where:{id:eventId},
    });

    if(!event || event.userId !== user.id){
        throw new Error("Event not found or you don't have permission to delete this event");
    }

    await db.event.delete({
        where:{id:eventId},
    });

   return {success:true};
}