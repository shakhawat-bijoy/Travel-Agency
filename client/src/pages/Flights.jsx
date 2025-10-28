import FlightSearch from '../components/home/FlightSearch'
import FlightResults from '../components/flights/FlightResults'
import Banner from '../components/home/Banner'


const Flights = () => {
  return (
    <div>
        <Banner/>
        <FlightSearch />
        <FlightResults/>
    </div>
  )
}

export default Flights