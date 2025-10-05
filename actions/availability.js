"use server"
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";


export async function getUserAvailability() {
    const {userId} = await auth();
    // console.log("User ID:", userId);
    if(!userId){
        throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
            where:{clerkUserId:userId},
            include:{
                availability:{
                    include:{
                        days:true,
                    }
                },
            }
            
    });
        
    if(!user || !user.availability){
            return null;
    }

    const availabilityData = {
        timeGap:user.availability.timeGap,
    };

    [
        "sunday",
        "monday",
        "tuesday",  
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ].forEach((day)=>{
        const dayAvailability = user.availability.days.find((d) => d.days === day.toUpperCase());
        
        availabilityData[day] = {
            isAvailable:!!dayAvailability,
            startTime:dayAvailability?
            dayAvailability.startTime.toISOString().slice(11,16):"09:00",
            endTime:dayAvailability?
            dayAvailability.endTime.toISOString().slice(11,16):"17:00",
        }
    })

    return availabilityData;


}

export async function updateUserAvailability(data){
    const {userId} = await auth();
    if(!userId){
        throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
        where:{clerkUserId:userId},
        include:{
            availability:true,
        }
    })

    if(!user){
        throw new Error("User not found");
    }

    const availabilityData = Object.entries(data).flatMap(([day,
        {isAvailable,startTime,endTime}])=>{
         if(isAvailable){
            const baseData = new Date().toISOString().split("T")[0];
            return{
                day:day.toUpperCase(),
                startTime:new Date(`${baseData}T${startTime}`),
                endTime:new Date(`${baseData}T${endTime}`),
                
            }
         }

         return [];
    })
    // console.log("Data Entries:", data);
    // console.log("Availability Data:", availabilityData);

    if(user.availability){
        await db.availability.update({
            where:{id:user.availability.id},
            data:{
                timeGap:data.timeGap,
                days:{
                    deleteMany:{},
                    create:availabilityData,
                }
            }
        })
    }else{
        await db.availability.create({
         
            data:{
                userId:user.id,
                timeGap:data.timeGap,
                days:{
                   create:availabilityData,
                }
            }
        })
    }

    return {success:true};
}