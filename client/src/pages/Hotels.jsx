import Banner from "../components/home/Banner"
import FlightHotelSearch from "../components/home/FlightHotelSearch"

const Hotels = () => {
  return (
    <div>
      <Banner className={`mb-10`}/>
      <FlightHotelSearch initialTab="stays" />
    </div>
  )
}

export default Hotels