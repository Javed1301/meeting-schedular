"use client"
import React from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const Dashboard = () => {
  const {isLoaded, user} = useUser(); // a clerk component to get the user details.
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
            
          </CardContent>
        
      </Card>
    </div>
  )
}

export default Dashboard