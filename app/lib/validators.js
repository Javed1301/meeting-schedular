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