"use client"
import React, { use, useEffect, useState } from 'react'
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
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            Welcome, {user?.firstName}!
          </CardTitle>
        </CardHeader>
        {/* Latest updates */}

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