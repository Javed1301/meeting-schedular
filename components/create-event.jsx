"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import EventForm from "./event-form"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  // DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,

} from "@/components/ui/drawer"


export function CreateEventDrawer() {
    const[isOpen,setIsOpen]=useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Open the drawer if the URL contains ?create=true
    React.useEffect(() => {
        const create = searchParams.get("create");
        if (create === "true") {
          setIsOpen(true);
        } 
    },[searchParams])

    // Function to handle closing the drawer
    const handleClose = () => {
        setIsOpen(false);
        if(searchParams.get("create") === "true"){
            router.replace(window?.location?.pathname)
        }
    };

  return (
    <Drawer open={isOpen}>
     
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Create New Event</DrawerTitle>
            
          </DrawerHeader>

          {/* Call The EventForm with a parameter onSubmit Form */}
          <EventForm 
            onSubmitForm = {() => {
                handleClose();
            }}
          />
          <DrawerFooter>
            
            <DrawerClose asChild>
              <Button variant="outline" onClick = {handleClose}>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
