"use client"
import { availabilitySchema } from '@/app/lib/validators'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@/components/ui/checkbox'
import { timeSlots } from '../data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import useFetch from '@/hooks/use-fetch'
import { updateUserAvailability } from '@/actions/availability'

const AvailabilityForm = ({initialData}) => {
    // console.log("Initial Data:", initialData);
    const {register,handleSubmit,setValue,control,watch,formState:{errors}} = useForm({
        resolver: zodResolver(availabilitySchema),
        defaultValues:{...initialData},
        mode:"onChange", // or "onBlur"
    });

    const {loading,error,fn:fnUpdateAvailability} = useFetch(updateUserAvailability);

    const onSubmit = async(data) => {
        // console.log("Form Data:", data);
        await fnUpdateAvailability(data);
    }
  return (
    <form action="" className='mt-8' onSubmit={handleSubmit(onSubmit)}>
        {[
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday"
        ].map((day) =>{
            const isAvailable = watch(`${day}.isAvailable`);
            return (
                <div key={day} className='flex items-center space-x-4 mb-4'>
                    <Controller
                    name={`${day}.isAvailable`}
                    control={control}
                    render={({field})=>(
                         <Checkbox  checked ={field.value}
                         className="border-black bg-white text-black focus:ring-2 focus:ring-black"
                         onCheckedChange = {(checked) => {
                            setValue(`${day}.isAvailable`,checked)
                            if(!checked){
                                setValue(`${day}.startTime`,"09:00")
                                setValue(`${day}.endTime`,"17:00")
                            }
                         }}/>
                    )}
                    />
                   
                    <span className='w-24'>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                    </span>

                    {isAvailable && (
                        <>
                           <Controller
                                name={`${day}.startTime`}
                                control={control}
                                render={({field})=>{
                                    return(
                                        <Select onValueChange={field.onChange}
                                        value={field.value}
                                        >
                                            <SelectTrigger className="w-32 border-2 border-blue-600 bg-white text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm">
                                                <SelectValue placeholder="Start Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => {
                                                    return <SelectItem key={time} value={time}>{time}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )
                                }}
                            />

                            <span>to</span>
                            <Controller
                                name={`${day}.endTime`}
                                control={control}
                                render={({field})=>{
                                    return(
                                        <Select onValueChange={field.onChange}
                                        value={field.value}>
                                            <SelectTrigger className="w-32 border-2 border-blue-600 bg-white text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm">
                                                <SelectValue placeholder="End Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((time) => {
                                                    return <SelectItem key={time} value={time}>{time}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )
                                }}
                            />

                            {errors[day]?.endTime && (
                                <p className='text-sm text-red-500'>{errors[day]?.endTime?.message}</p>
                            )}

                        </>
                    )}
                </div>
            )
        })}

        <div className='flex items-center space-x-4 mb-4'>
            <span>Minimum gap before booking (minutes) :</span>
            <Input
            type="number"
            {...register("timeGap", { valueAsNumber: true })}
            className="w-32 mt-2 border-2 border-blue-600 bg-white text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
            />
            {errors.timeGap && (
                <p className='text-sm text-red-500'>{errors.timeGap?.message}</p>
            )}
        </div>
        {error && (
            <p className='text-sm text-red-500'>{error?.message}</p>
        )}

        <Button type="submit" className="mt-5"
        disabled={loading}>
        {loading ? "Updating..." : "Update Availability"}
        </Button>
    </form>
  )
}

export default AvailabilityForm