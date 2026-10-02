import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Timeline from '../components/Timeline'
import Map from '../components/Map'
import API from '../services/api'
import { Calendar, Plus, Compass, Navigation, ShoppingBag, Clapperboard, Utensils, AlertCircle } from 'lucide-react'

interface Trip {
  id: number
  title: string
  destination: string
  startDate: string
  endDate: string
  budgetLimit: number
  budgetSpent: number
}

interface ScheduleActivity {
  id: number
  dayNumber: number
  scheduledTime: string
  activityName: string
  activityType: string
  status: string
}

interface MapPinData {
  id: number
  name: string
  lat: number
  lng: number
  type: 'HOTEL' | 'RESTAURANT' | 'EVENT' | 'ATTRACTION' | 'MALL' | 'CINEMA' | 'HOSPITAL'
}

export default function Planner() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [schedules, setSchedules] = useState<ScheduleActivity[]>([])
  const [activeDay, setActiveDay] = useState(1)
  
  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState('')

  // Real geocoded coordinates lookup dictionary for popular travel destinations
  const activityCoordinates: Record<string, { lat: number; lng: number }> = {
    // Goa
    'Breakfast at The Sea View Resort': { lat: 15.5992, lng: 73.7431 },
    'Visit Fort Aguada Lighthouse': { lat: 15.5562, lng: 73.7512 },
    'Lunch at Fisherman\'s Wharf': { lat: 15.4909, lng: 73.8122 },
    'Spice Plantation Tasting Tour': { lat: 15.5540, lng: 73.7562 },
    'Coastal Sunset Cruise': { lat: 15.5560, lng: 73.7510 },
    'Dinner at Seaside Grill': { lat: 15.5562, lng: 73.7512 },

    // Visakhapatnam / Vizag
    'RK Beach & INS Kursura Submarine Museum': { lat: 17.7125, lng: 83.3195 },
    'Kailasagiri Hilltop Park & Ropeway': { lat: 17.7494, lng: 83.3421 },
    'Simhachalam Sri Varaha Lakshmi Narasimha Swamy Temple': { lat: 17.7663, lng: 83.2506 },
    'Rushikonda Beach Water Sports': { lat: 17.7818, lng: 83.3831 },
    'Novotel Varun Beach Hotel': { lat: 17.7110, lng: 83.3175 },

    // Rajahmundry / Rajamahendravaram
    'Godavari Arch Bridge & Pushkar Ghat Walk': { lat: 17.0005, lng: 81.7770 },
    'Rajahmundry Iconic Rose Milk Center': { lat: 16.9980, lng: 81.7820 },
    'Sir Arthur Cotton Museum & Dowleswaram Barrage': { lat: 16.9400, lng: 81.7700 },

    // Ravulapalem / Konaseema
    'Visit Vadapalli Sri Venkateswara Swamy Temple': { lat: 16.7900, lng: 81.8050 },
    'Visit Ryali Jaganmohini Kesava Swamy Temple': { lat: 16.7970, lng: 81.8590 },
    'Dindi & Pasarlapudi Coconut Island Backwaters Boat Cruise': { lat: 16.5400, lng: 81.8900 },
    'Ravulapalem World-Famous Pootharekulu & Rose Milk Tasting': { lat: 16.7460, lng: 81.8410 },
    'Return to Ravulapalem Coconut Grove Resort & Stay': { lat: 16.7510, lng: 81.8470 },
    'Morning Arrival & Godavari Gouthami River Ghat Walk': { lat: 16.7490, lng: 81.8440 },
    'Authentic Konaseema Seafood & Veg Thali Lunch': { lat: 16.7500, lng: 81.8430 },
    'Sunset View at Jonnada Godavari Bridge & Kova Tasting': { lat: 16.7620, lng: 81.8350 }
  }

  const getCityBaseCoords = (destination?: string) => {
    const dest = (destination || selectedTrip?.destination || '').toLowerCase()
    if (dest.includes('rajahmundry') || dest.includes('rajamahendravaram')) return { lat: 17.0005, lng: 81.8040 }
    if (dest.includes('vizag') || dest.includes('visakhapatnam')) return { lat: 17.6868, lng: 83.2185 }
    if (dest.includes('hyderabad')) return { lat: 17.3850, lng: 78.4867 }
    if (dest.includes('bangalore') || dest.includes('bengaluru')) return { lat: 12.9716, lng: 77.5946 }
    if (dest.includes('ravulapalem') || dest.includes('konaseema')) return { lat: 16.7490, lng: 81.8440 }
    if (dest.includes('mumbai')) return { lat: 19.0760, lng: 72.8777 }
    if (dest.includes('chennai')) return { lat: 13.0827, lng: 80.2707 }
    if (dest.includes('delhi')) return { lat: 28.6139, lng: 77.2090 }
    return { lat: 15.5562, lng: 73.7512 }
  }

  // Seeded nearby options to display based on location queries
  const nearbyPlaces: MapPinData[] = [
    { id: 101, name: 'Central Shopping Mall', lat: getCityBaseCoords().lat + 0.005, lng: getCityBaseCoords().lng + 0.006, type: 'MALL' },
    { id: 102, name: 'Multiplex Cinema', lat: getCityBaseCoords().lat - 0.004, lng: getCityBaseCoords().lng - 0.005, type: 'CINEMA' },
    { id: 103, name: 'Gourmet Dine House', lat: getCityBaseCoords().lat + 0.003, lng: getCityBaseCoords().lng - 0.004, type: 'RESTAURANT' },
    { id: 104, name: 'Luxury Stay Hotel', lat: getCityBaseCoords().lat - 0.002, lng: getCityBaseCoords().lng + 0.003, type: 'HOTEL' }
  ]

  // Track browser live location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setGeoError('')
        },
        () => {
          setGeoError('Location permission denied. Using trip destination coordinates.')
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  const fetchTrips = () => {
    API.get('/trips')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTrips(res.data)
          setSelectedTrip(res.data[0])
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchTrips()
    const handlePlanUpdated = () => fetchTrips()
    window.addEventListener('planUpdated', handlePlanUpdated)
    return () => window.removeEventListener('planUpdated', handlePlanUpdated)
  }, [])

  const loadSchedules = () => {
    if (!selectedTrip) return
    API.get(`/trips/${selectedTrip.id}`)
      .then((res) => {
        if (res.data && res.data.schedules) {
          setSchedules(res.data.schedules)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadSchedules()
  }, [selectedTrip])

  // Filter activities by active day selection
  const dayActivities = schedules.filter((s) => s.dayNumber === activeDay)

  // Convert timeline activities to Map pins
  const getMapPins = (): MapPinData[] => {
    const base = getCityBaseCoords()
    return dayActivities.map((act, index) => {
      // Find matching coordinate key
      const foundKey = Object.keys(activityCoordinates).find(k => act.activityName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(act.activityName.toLowerCase()))
      const coords = foundKey ? activityCoordinates[foundKey] : {
        lat: base.lat + (Math.sin(index) * 0.008),
        lng: base.lng + (Math.cos(index) * 0.008)
      }
      return {
        id: act.id || index + 1,
        name: act.activityName,
        lat: coords.lat,
        lng: coords.lng,
        type: (act.activityType || 'ATTRACTION') as any
      }
    })
  }

  // Calculate distances & driving times dynamically between path stops
  const calculateRouteLegs = () => {
    const legs: { from: string; to: string; distance: string; duration: string }[] = []
    const pins = getMapPins()
    if (pins.length === 0) return legs

    let prevPoint: { name: string; lat: number; lng: number } | null = null

    // Only prepend user live location if user is nearby (< 50 km from first pin)
    if (userCoords && pins.length > 0) {
      const dLat = pins[0].lat - userCoords.lat
      const dLng = pins[0].lng - userCoords.lng
      const userDistKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111.0
      if (userDistKm < 50.0) {
        prevPoint = { name: 'Your Live Location', lat: userCoords.lat, lng: userCoords.lng }
      }
    }

    pins.forEach((pin) => {
      if (prevPoint) {
        const dLat = pin.lat - prevPoint.lat
        const dLng = pin.lng - prevPoint.lng
        const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111.0
        const durationMin = Math.max(3, Math.round(distance * 2.2))
        
        legs.push({
          from: prevPoint.name,
          to: pin.name,
          distance: `${distance.toFixed(1)} km`,
          duration: `${durationMin} min drive`
        })
      }
      prevPoint = { name: pin.name, lat: pin.lat, lng: pin.lng }
    })

    return legs
  }

  const handleToggleStatus = (activityId: number, currentStatus: string) => {
    if (!selectedTrip) return
    const nextStatus = currentStatus.toUpperCase() === 'COMPLETED' ? 'PLANNED' : 'COMPLETED'
    
    setSchedules(prev => prev.map(s => s.id === activityId ? { ...s, status: nextStatus } : s))

    API.patch(`/trips/${selectedTrip.id}/schedules/${activityId}/status?status=${nextStatus}`)
      .catch(() => {})
  }

  const addPlaceToItinerary = (place: MapPinData) => {
    if (!selectedTrip) return
    
    // Auto calculate next time slots (e.g. 05:00 PM)
    const nextSlot = schedules.length > 0 ? '05:00 PM' : '10:00 AM'
    
    API.post(`/trips/${selectedTrip.id}/schedules`, {
      dayNumber: activeDay,
      scheduledTime: nextSlot,
      activityName: place.name,
      activityType: place.type,
      activityId: place.id,
      status: 'PLANNED'
    })
      .then(() => {
        // Reload list
        loadSchedules()
      })
      .catch(() => {
        // Fallback local update
        setSchedules((prev) => [...prev, {
          id: place.id,
          dayNumber: activeDay,
          scheduledTime: nextSlot,
          activityName: place.name,
          activityType: place.type,
          status: 'Confirmed'
        }])
      })
  }

  const legs = calculateRouteLegs()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real-Time Travel Planner</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track live position and calculate travel times between itinerary legs</p>
        </div>

        <div className="flex gap-2">
          {trips.length > 0 && (
            <select
              value={selectedTrip?.id}
              onChange={(e) => {
                const trip = trips.find((t) => t.id === Number(e.target.value))
                if (trip) setSelectedTrip(trip)
              }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Geolocation warning display if denied */}
      {geoError && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{geoError}</span>
        </div>
      )}

      {/* Day Selector */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-darkBorder pb-px">
        {[1, 2, 3, 4].map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeDay === day
                ? 'border-indigo-600 text-indigo-600 dark:border-brand-400 dark:text-brand-300'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Column (Timeline + Distances) & Right Column (Map + Nearby suggestion list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Timeline list (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-sm">Hourly Itinerary</h3>
          </div>

          {dayActivities.length > 0 ? (
            <Timeline activities={dayActivities as any} onToggleStatus={handleToggleStatus} />
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-8 text-center text-xs text-gray-400">
              No schedules mapped for Day {activeDay}. Use suggestion buttons to add activities!
            </div>
          )}

          {/* Drive & Distance calculations timeline legs */}
          {legs.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation size={14} className="text-indigo-600 dark:text-brand-400" />
                Travel time & Directions summary
              </h4>
              <div className="space-y-3 pt-1">
                {legs.map((leg, index) => (
                  <div key={index} className="flex justify-between items-start text-xs border-l-2 border-indigo-100 dark:border-brand-950 pl-3 ml-1">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200 text-[11px]">{leg.from}</p>
                      <p className="text-[10px] text-gray-400">to {leg.to}</p>
                    </div>
                    <div className="text-right text-[11px] font-bold text-indigo-600 dark:text-brand-400">
                      <span>{leg.distance}</span>
                      <span className="block text-[9px] text-gray-400 font-normal">{leg.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Map + Nearby suggestion controls (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-sm">Interactive Live Map</h3>
          </div>
          
          <Map 
            drawRoute={dayActivities.length > 0} 
            userCoords={userCoords}
            pins={getMapPins()}
            nearbyPlaces={nearbyPlaces}
          />

          {/* Nearby Suggestions Selector List */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-sm">Nearby Discovery</h4>
              <p className="text-xs text-gray-400 mt-0.5">Discovered matching spots near your active coordinates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyPlaces.map((place) => (
                <div 
                  key={place.id} 
                  className="border border-gray-150 dark:border-zinc-800 rounded-xl p-3 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50 hover:border-indigo-400 transition-colors"
                >
                  <div className="flex gap-2.5 items-center">
                    <div className={`p-2 rounded-lg ${
                      place.type === 'MALL' ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-500' :
                      place.type === 'CINEMA' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' :
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
                    }`}>
                      {place.type === 'MALL' ? <ShoppingBag size={16} /> :
                       place.type === 'CINEMA' ? <Clapperboard size={16} /> :
                       <Utensils size={16} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs max-w-[150px] truncate">{place.name}</h5>
                      <span className="text-[9px] uppercase font-bold text-gray-400">{place.type.toLowerCase()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => addPlaceToItinerary(place)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
        




// import React, { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import Timeline from '../components/Timeline'
// import Map from '../components/Map'
// import API from '../services/api'
// import {
//   AlertCircle,
//   Navigation,
//   ShoppingBag,
//   Clapperboard,
//   Utensils
// } from 'lucide-react'

// interface Trip {
//   id: number
//   title: string
//   destination: string
//   startDate: string
//   endDate: string
//   budgetLimit: number
//   budgetSpent: number
//   schedules: ScheduleActivity[]
// }

// interface ScheduleActivity {
//   id: number
//   dayNumber: number
//   scheduledTime: string
//   activityName: string
//   activityType: string
//   activityId?: number
//   status: string
// }

// interface MapPinData {
//   id: number
//   name: string
//   lat: number
//   lng: number
//   type:
//     | 'HOTEL'
//     | 'RESTAURANT'
//     | 'EVENT'
//     | 'ATTRACTION'
//     | 'MALL'
//     | 'CINEMA'
//     | 'HOSPITAL'
// }

// export default function Planner() {

//   const [trips, setTrips] = useState<Trip[]>([])
//   const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
//   const [schedules, setSchedules] = useState<ScheduleActivity[]>([])
//   const [activeDay, setActiveDay] = useState(1)

//   const [userCoords, setUserCoords] =
//     useState<{ lat:number,lng:number } | null>(null)

//   const [geoError,setGeoError]=useState('')

//   // ----------------------------------------------------
//   // Browser Location
//   // ----------------------------------------------------

//   useEffect(()=>{

//     if(!navigator.geolocation){

//       setGeoError("Browser doesn't support GPS")

//       setUserCoords({
//         lat:17.0005,
//         lng:81.8040
//       })

//       return
//     }

//     const watchId=navigator.geolocation.watchPosition(

//       (position)=>{

//         setUserCoords({

//           lat:position.coords.latitude,

//           lng:position.coords.longitude

//         })

//         setGeoError('')

//       },

//       ()=>{

//         setGeoError("Location permission denied.")

//         setUserCoords({

//           lat:17.0005,

//           lng:81.8040

//         })

//       },

//       {

//         enableHighAccuracy:true,

//         timeout:15000,

//         maximumAge:0

//       }

//     )

//     return ()=>navigator.geolocation.clearWatch(watchId)

//   },[])

//   // ----------------------------------------------------
//   // Load Trips
//   // ----------------------------------------------------

//   useEffect(()=>{

//     loadTrips()

//   },[])

//   async function loadTrips(){

//     try{

//       const res=await API.get("/trips")

//       setTrips(res.data)

//       if(res.data.length>0){

//         setSelectedTrip(res.data[0])

//       }

//     }

//     catch(err){

//       console.log(err)

//     }

//   }

//   // ----------------------------------------------------
//   // Load Selected Trip
//   // ----------------------------------------------------

//   useEffect(()=>{

//     if(selectedTrip){

//       loadSchedules(selectedTrip.id)

//     }

//   },[selectedTrip])

//   async function loadSchedules(id:number){

//     try{

//       const res=await API.get(`/trips/${id}`)

//       setSchedules(res.data.schedules || [])

//     }

//     catch(err){

//       console.log(err)

//       setSchedules([])

//     }

//   }

//   // ----------------------------------------------------
//   // Filter Day Activities
//   // ----------------------------------------------------

//   const dayActivities=schedules.filter(

//     s=>s.dayNumber===activeDay

//   )const dayActivities = schedules.filter(...)
//   // ----------------------------------------------------
// // Activity Coordinates
// // ----------------------------------------------------

// const activityCoordinates: Record<string, { lat: number; lng: number }> = {

//   "Breakfast at The Sea View Resort": {
//     lat: 15.5992,
//     lng: 73.7431
//   },

//   "Visit Fort Aguada Lighthouse": {
//     lat: 15.5562,
//     lng: 73.7512
//   },

//   "Lunch at Fisherman's Wharf": {
//     lat: 15.4909,
//     lng: 73.8122
//   },

//   "Spice Plantation Tasting Tour": {
//     lat: 15.5540,
//     lng: 73.7562
//   },

//   "Coastal Sunset Cruise": {
//     lat: 15.5560,
//     lng: 73.7510
//   },

//   "Dinner at Seaside Grill": {
//     lat: 15.5562,
//     lng: 73.7512
//   }

// }

// // ----------------------------------------------------
// // Nearby Places
// // ----------------------------------------------------

// const nearbyPlaces: MapPinData[] = [

//   {
//     id:101,
//     name:"Mall de Goa",
//     lat:15.5255,
//     lng:73.8210,
//     type:"MALL"
//   },

//   {
//     id:102,
//     name:"INOX Cinemas",
//     lat:15.495,
//     lng:73.8115,
//     type:"CINEMA"
//   },

//   {
//     id:103,
//     name:"Seaside Grill",
//     lat:15.5562,
//     lng:73.7512,
//     type:"RESTAURANT"
//   }

// ]

// // ----------------------------------------------------
// // Map Pins
// // ----------------------------------------------------

// const getMapPins = (): MapPinData[] => {

//   return dayActivities.map((activity)=>{

//     const coords =
//       activityCoordinates[activity.activityName]
//       ||
//       {
//         lat:15.55,
//         lng:73.75
//       }

//     return{

//       id:activity.id,

//       name:activity.activityName,

//       lat:coords.lat,

//       lng:coords.lng,

//       type:activity.activityType as any

//     }

//   })

// }

// // ----------------------------------------------------
// // Route Summary
// // ----------------------------------------------------

// const calculateRouteLegs=()=>{

//   const pins=getMapPins()

//   const legs:any[]=[]

//   let previous:

//   {

//     name:string

//     lat:number

//     lng:number

//   }

//   | null = null

//   if(userCoords){

//     previous={

//       name:"Your Location",

//       lat:userCoords.lat,

//       lng:userCoords.lng

//     }

//   }

//   pins.forEach(pin=>{

//     if(previous){

//       const dLat=pin.lat-previous.lat

//       const dLng=pin.lng-previous.lng

//       const distance=Math.sqrt(
//         dLat*dLat+dLng*dLng
//       )*111

//       const duration=Math.round(distance*2.5)

//       legs.push({

//         from:previous.name,

//         to:pin.name,

//         distance:`${distance.toFixed(1)} km`,

//         duration:`${duration} min`

//       })

//     }

//     previous={

//       name:pin.name,

//       lat:pin.lat,

//       lng:pin.lng

//     }

//   })

//   return legs

// }

// const legs=calculateRouteLegs()

// // ----------------------------------------------------
// // Add Nearby Place
// // ----------------------------------------------------

// async function addPlace(place:MapPinData){

//   if(!selectedTrip) return

//   try{

//     await API.post(

//       `/trips/${selectedTrip.id}/schedules`,

//       {

//         dayNumber:activeDay,

//         scheduledTime:"17:00",

//         activityName:place.name,

//         activityType:place.type,

//         activityId:place.id,

//         status:"PLANNED"

//       }

//     )

//     loadSchedules(selectedTrip.id)

//   }

//   catch(error){

//     console.log(error)

//   }

// }