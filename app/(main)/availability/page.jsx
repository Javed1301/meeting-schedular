
import AvailabilityForm from './_components/availability-Form'
import { getUserAvailability } from '@/actions/availability';
import { defaultAvailability } from './data';

const AvailabilityPage = async() =>{

  const availability = await getUserAvailability();
  
  return (
    <AvailabilityForm initialData = {availability ||defaultAvailability} /> 
  )
}

export default AvailabilityPage