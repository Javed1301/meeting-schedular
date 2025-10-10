"use client"
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import z from 'zod';
import { userSchema } from '@/app/lib/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarLoader } from 'react-spinners';
import useFetch from '@/hooks/use-fetch';
import { updateUsername } from '@/actions/user';
// import { set } from 'zod';
import { getLatestUpdates } from '@/actions/dashboard';
import { format } from 'date-fns';


const Dashboard = () => {
  const {isLoaded, user} = useUser(); // a clerk component to get the user details.

  const {register,handleSubmit,setValue,formState:{errors}} =  useForm({
    resolver:zodResolver(userSchema)
  })

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

 

  useEffect(() => {
    setValue("username", user?.username || ""); // prefill the username if it exists
  },[isLoaded])

  const {loading,error,fn:fnUpdateUserName} = useFetch(updateUsername);

   const onSubmit = (data) => {
    // console.log(data);
    fnUpdateUserName(data.username);
  }


   const {
    loading: loadingUpdates,
    data: upcomingMeetings,
    fn: fnUpdates,
  } = useFetch(getLatestUpdates);

  useEffect(() => {
    (async () => await fnUpdates())();
  }, []);
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            Welcome, {user?.firstName}!
          </CardTitle>
        </CardHeader>
           <CardContent>
          {!loadingUpdates ? (
            <div className="space-y-6 font-light">
              <div>
                {upcomingMeetings && upcomingMeetings?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {upcomingMeetings?.map((meeting) => (
                      <li key={meeting.id}>
                        {meeting.event.title} on{" "}
                        {format(
                          new Date(meeting.startTime),
                          "MMM d, yyyy h:mm a"
                        )}{" "}
                        with {meeting.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming meetings</p>
                )}
              </div>
            </div>
          ) : (
            <p>Loading updates...</p>
          )}
        </CardContent>

      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
              Your Unique Link
          </CardTitle>
        </CardHeader>
          <CardContent>
            <form action="" className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
              <div>
                <div className='flex items-center gap-2'>
                  <span>{origin}</span>
                  <Input {...register("username")} placeholder = "username"/>
                </div>
                {/* This is for our api */}
                {errors.username && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.username.message}
                  </p>
                )}
                {/* //This if for our hook */}
                {error &&
                (<p className='text-red-500 text-sm mt-1'>
                    {error?.message}
                  </p>
                  )
                }
              </div>

              {loading && (
                <BarLoader width={"100%"} color='#36d7b7' className='mb-4'/>
              )}
              <Button type="submit">Update Username</Button>
            </form>
          </CardContent>
        
      </Card>
    </div>
  )
}

export default Dashboard