class PlannerAgent:
    def execute(self, state: dict) -> dict:
        city = state.get("location", "Rajamahendravaram")
        city_lower = city.lower()
        is_rainy = state.get("is_rainy", False)
        
        state["logs"].append(f"[PlannerAgent] Assembling time-to-time hourly To-Do list schedule for: {city}")

        # Get exact city land coordinates
        coords = self._get_city_activity_coords(city_lower)

        if is_rainy:
            state["logs"].append("[PlannerAgent] Live Rain Alert: Substituting outdoor sights with indoor multiplex cinema & dining.")
            title = f"{city} Rainy Day Indoor Plan"
            activities = [
                {
                    "time": "09:00 AM",
                    "name": f"Breakfast at Hotel Shelton {city}",
                    "type": "HOTEL",
                    "status": "COMPLETED",
                    "lat": coords["hotel"]["lat"],
                    "lng": coords["hotel"]["lng"]
                },
                {
                    "time": "11:30 AM",
                    "name": f"Indoor Shopping at {city} Central Mall",
                    "type": "ATTRACTION",
                    "status": "PLANNED",
                    "lat": coords["mall"]["lat"],
                    "lng": coords["mall"]["lng"]
                },
                {
                    "time": "01:30 PM",
                    "name": f"Traditional Andhra Lunch at Sri Kanya Comfort",
                    "type": "RESTAURANT",
                    "status": "PLANNED",
                    "lat": coords["lunch"]["lat"],
                    "lng": coords["lunch"]["lng"]
                },
                {
                    "time": "05:30 PM",
                    "name": f"Movie Show at Sree Satyadeva Multiplex (Indoor)",
                    "type": "EVENT",
                    "status": "PLANNED",
                    "lat": coords["cinema"]["lat"],
                    "lng": coords["cinema"]["lng"]
                },
                {
                    "time": "08:30 PM",
                    "name": f"Indoor Dinner at Captain's Deck Restaurant",
                    "type": "RESTAURANT",
                    "status": "PLANNED",
                    "lat": coords["dinner"]["lat"],
                    "lng": coords["dinner"]["lng"]
                }
            ]
        else:
            title = f"{city} Scenic Heritage & Day Tour"
            activities = [
                {
                    "time": "09:00 AM",
                    "name": f"Breakfast at Hotel Shelton {city}",
                    "type": "HOTEL",
                    "status": "COMPLETED",
                    "lat": coords["hotel"]["lat"],
                    "lng": coords["hotel"]["lng"]
                },
                {
                    "time": "11:00 AM",
                    "name": coords["sight1"]["name"],
                    "type": "ATTRACTION",
                    "status": "COMPLETED",
                    "lat": coords["sight1"]["lat"],
                    "lng": coords["sight1"]["lng"]
                },
                {
                    "time": "01:30 PM",
                    "name": f"Traditional Andhra Lunch at Sri Kanya Comfort",
                    "type": "RESTAURANT",
                    "status": "PLANNED",
                    "lat": coords["lunch"]["lat"],
                    "lng": coords["lunch"]["lng"]
                },
                {
                    "time": "03:30 PM",
                    "name": coords["sight2"]["name"],
                    "type": "ATTRACTION",
                    "status": "PLANNED",
                    "lat": coords["sight2"]["lat"],
                    "lng": coords["sight2"]["lng"]
                },
                {
                    "time": "06:00 PM",
                    "name": coords["sunset"]["name"],
                    "type": "EVENT",
                    "status": "PLANNED",
                    "lat": coords["sunset"]["lat"],
                    "lng": coords["sunset"]["lng"]
                },
                {
                    "time": "08:30 PM",
                    "name": f"Movie Show at Sree Satyadeva Multiplex",
                    "type": "EVENT",
                    "status": "PLANNED",
                    "lat": coords["cinema"]["lat"],
                    "lng": coords["cinema"]["lng"]
                }
            ]

        state["trip_title"] = title
        state["activities"] = activities
        return state

    def _get_city_activity_coords(self, city_lower: str):
        if "vizag" in city_lower or "visakhapatnam" in city_lower:
            return {
                "hotel": {"lat": 17.7100, "lng": 83.3150},
                "mall": {"lat": 17.7200, "lng": 83.3050},
                "lunch": {"lat": 17.7250, "lng": 83.3080},
                "cinema": {"lat": 17.7130, "lng": 83.3160},
                "dinner": {"lat": 17.7120, "lng": 83.3180},
                "sight1": {"name": "Visakhapatnam Submarine Museum & RK Beach Walk", "lat": 17.7140, "lng": 83.3230},
                "sight2": {"name": "Kailasagiri Hilltop Park Scenic Viewpoint", "lat": 17.7480, "lng": 83.3420},
                "sunset": {"name": "Rushikonda Beach Sunset Walk", "lat": 17.7820, "lng": 83.3850}
            }
        elif "hyderabad" in city_lower:
            return {
                "hotel": {"lat": 17.4150, "lng": 78.4480},
                "mall": {"lat": 17.4260, "lng": 78.4520},
                "lunch": {"lat": 17.4425, "lng": 78.4984},
                "cinema": {"lat": 17.4116, "lng": 78.4677},
                "dinner": {"lat": 17.4300, "lng": 78.4700},
                "sight1": {"name": "Charminar & Laad Bazaar Heritage Walk", "lat": 17.3616, "lng": 78.4747},
                "sight2": {"name": "Golconda Fort Historical Tour", "lat": 17.3833, "lng": 78.4011},
                "sunset": {"name": "Hussain Sagar Lake & Tank Bund Sunset Walk", "lat": 17.4239, "lng": 78.4738}
            }
        elif "vijayawada" in city_lower:
            return {
                "hotel": {"lat": 16.5062, "lng": 80.6480},
                "mall": {"lat": 16.5120, "lng": 80.6550},
                "lunch": {"lat": 16.5150, "lng": 80.6420},
                "cinema": {"lat": 16.5100, "lng": 80.6380},
                "dinner": {"lat": 16.5080, "lng": 80.6450},
                "sight1": {"name": "Kanaka Durga Temple & Krishna River Ghat", "lat": 16.5160, "lng": 80.6080},
                "sight2": {"name": "Prakasam Barrage Waterfront Walk", "lat": 16.5085, "lng": 80.6120},
                "sunset": {"name": "Bhavani Island Sunset Boat Cruise", "lat": 16.5350, "lng": 80.5750}
            }
        else: # Rajahmundry / Rajamahendravaram
            return {
                "hotel": {"lat": 17.0055, "lng": 81.8030},
                "mall": {"lat": 17.0080, "lng": 81.8050},
                "lunch": {"lat": 17.0080, "lng": 81.8010},
                "cinema": {"lat": 17.0110, "lng": 81.8020},
                "dinner": {"lat": 17.0150, "lng": 81.7920},
                "sight1": {"name": "Godavari Arch Bridge & Pushkar Ghat Walk", "lat": 17.0020, "lng": 81.7780},
                "sight2": {"name": "Kadiyapulanka Nursery Gardens Tour", "lat": 16.9200, "lng": 81.8500},
                "sunset": {"name": "Godavari River Sunset Boat Cruise", "lat": 17.0150, "lng": 81.7920}
            }
