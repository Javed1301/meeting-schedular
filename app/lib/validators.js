import z from 'zod';


export const userSchema = z.object({
    username : z
    .string()
    .min(3, {message: "Username must be at least 3 characters long"})
    .max(20, {message: "Username must be at most 20 characters long"})
    .regex(/^[a-zA-Z0-9_]+$/, {message: "Username can only contain letters, numbers, and underscores"}),
})

export const eventSchema = z.object({
    title:z
    .string()
    .min(5, {message: "Title must be at least 5 characters long"})
    .max(100, {message: "Title must be at most 100 characters long"}),

    description: z
    .string()
    .min(10, {message: "Description must be at least 10 characters long"})
    .max(500, {message: "Description must be at most 500 characters long"}),

    duration: z
    .number()
    .int({message: "Duration must be an integer"})
    .positive({message: "Duration must be a positive number"}),

    isPrivate:z.boolean(),
})

export const daySchema = z.object({
    isAvailable:z.boolean(),
    startTime:z.string().optional(),
    endTime:z.string().optional(),
}).refine((data)=>{
    if(data.isAvailable){
        return data.startTime < data.endTime;
    }
    return true;
},{
    message:"Start time must be before end time",
    path:["endTime"],
}
)

export const availabilitySchema = z.object({
    monday:daySchema,
    tuesday:daySchema,
    wednesday:daySchema,
    thursday:daySchema,
    friday:daySchema,
    saturday:daySchema,
    sunday:daySchema,
    timeGap:z.number().int().min(0,"Time gap must be greater than zero"),
});

export const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"), // ← Changed: pass message directly as string
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  additionalInfo: z.string().optional(),
});