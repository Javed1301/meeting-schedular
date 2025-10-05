"use server"
import { auth } from "@clerk/nextjs/server";

import { eventSchema } from "@/app/lib/validators";
import { db } from "@/lib/prisma";
import { addDays, addMinutes, parseISO, startOfDay } from "date-fns";
import { format } from "date-fns";

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

export async function getEventDetails(username, eventId) {
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      user: {
        username: username,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return event;
}


export async function getEventAvailability(eventId) {
    console.log("Fetching availability for event ID:", eventId);
    const event = await db.event.findUnique({
        where: {id: eventId},
        include:{
            user:{
                include:{
                    availability:{
                        select:{
                            days:true,
                            timeGap:true,
                        }
                    },
                    bookings:{
                        select:{
                            startTime:true,
                            endTime:true,
                        }
                    }
                }
            }
        }
    })

    if(!event || !event.user.availability){
        return [];
    }

    const {availability,bookings} = event.user;

    //complex logic ...
    const startDtae = startOfDay(new Date());
    const endDate = addDays(startDtae,30);

    const availableDates = [];

    for(let date = startDtae; date <= endDate; date = addDays(date,1)){
        const dayOfWeek = format(date,"EEEE").toUpperCase();
        const dayAvailability = availability.days.find((d) => d.day === dayOfWeek);

        if(dayAvailability){
            const dateStr = format(date,"yyyy-MM-dd");
            const slots = genrateAvailableTimeSlots(
                dayAvailability.startTime,
                dayAvailability.endTime,
                
                event.duration,
                dateStr,
                bookings,
                availability.timeGap,
            )

            availableDates.push({
                date:dateStr,
                slots,
            })

        }
    }

    return availableDates;
}



function genrateAvailableTimeSlots(startTime,endTime,eventDuration,dateStr,bookings,timeGap = 0){
    const slots = [];

    let currentTime = parseISO(`${dateStr}T${startTime.toISOString().slice(11,16)}`); 
    const slotEndTime = parseISO(`${dateStr}T${endTime.toISOString().slice(11,16)}`); 

    const now = new Date();
    if(format(now,"yyyy-MM-dd") === dateStr){
        currentTime = isBefore(currentTime,now) ? addMinutes(now,timeGap) : currentTime;

    }

    while(currentTime < slotEndTime){
        const slotEnd = new Date(currentTime.getTime() + eventDuration * 60000);

        const isSlotAvailable = !bookings.some(booking =>{
            const bookingStartTime = booking.startTime;
            const bookingEndTime = booking.endTime;
            //Explain this logic.
            return(
                (currentTime >= bookingStartTime
                    && currentTime < bookingEndTime
                )||
                (slotEnd > bookingStartTime && slotEnd <= bookingEndTime)||
                (currentTime <= bookingStartTime && slotEnd >= bookingEndTime)
            )
        })

        if(isSlotAvailable){
            slots.push(format(currentTime,"HH:mm"));
        }

        currentTime = slotEnd;
    }

    return slots;

}