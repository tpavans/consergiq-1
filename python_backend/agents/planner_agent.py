from datetime import datetime

class PlannerAgent:
    def execute(self, state: dict) -> dict:
        city = state.get("location", "Rajamahendravaram")
        city_lower = city.lower()
        is_rainy = state.get("is_rainy", False)
        time_horizon = state.get("time_horizon", "FULL_DAY")
        
        state["logs"].append(f"[PlannerAgent] Assembling time-aware To-Do schedule ({time_horizon}) for: {city}")

        # Get authentic real places pool for city
        pool = self._get_authentic_places_pool(city_lower)

        # Determine time slots based on TODAY vs TOMORROW / FULL_DAY
        if time_horizon == "TODAY":
            current_hour = datetime.now().hour
            if current_hour >= 16: # Evening query (after 4 PM)
                title = f"{city} Today Evening Plan"
                activities = [
                    {
                        "time": "05:30 PM",
                        "name": pool["sunset"]["title"],
                        "type": "ATTRACTION",
                        "status": "PLANNED",
                        "lat": pool["sunset"]["lat"],
                        "lng": pool["sunset"]["lng"]
                    },
                    {
                        "time": "07:30 PM",
                        "name": f"Dinner at {pool['dinner']['title']}",
                        "type": "RESTAURANT",
                        "status": "PLANNED",
                        "lat": pool["dinner"]["lat"],
                        "lng": pool["dinner"]["lng"]
                    },
                    {
                        "time": "09:30 PM",
                        "name": f"Night Relaxation at {pool['hotel']['title']}",
                        "type": "HOTEL",
                        "status": "PLANNED",
                        "lat": pool["hotel"]["lat"],
                        "lng": pool["hotel"]["lng"]
                    }
                ]
            elif current_hour >= 12: # Afternoon query (12 PM - 4 PM)
                title = f"{city} Today Afternoon & Evening Plan"
                activities = [
                    {
                        "time": "01:30 PM",
                        "name": f"Lunch at {pool['lunch']['title']}",
                        "type": "RESTAURANT",
                        "status": "COMPLETED",
                        "lat": pool["lunch"]["lat"],
                        "lng": pool["lunch"]["lng"]
                    },
                    {
                        "time": "04:00 PM",
                        "name": pool["sight2"]["title"],
                        "type": "ATTRACTION",
                        "status": "PLANNED",
                        "lat": pool["sight2"]["lat"],
                        "lng": pool["sight2"]["lng"]
                    },
                    {
                        "time": "06:00 PM",
                        "name": pool["sunset"]["title"],
                        "type": "EVENT",
                        "status": "PLANNED",
                        "lat": pool["sunset"]["lat"],
                        "lng": pool["sunset"]["lng"]
                    },
                    {
                        "time": "08:30 PM",
                        "name": f"Dinner at {pool['dinner']['title']}",
                        "type": "RESTAURANT",
                        "status": "PLANNED",
                        "lat": pool["dinner"]["lat"],
                        "lng": pool["dinner"]["lng"]
                    }
                ]
            else:
                title = f"{city} Today Full Day Plan"
                activities = self._build_full_day_schedule(pool, is_rainy, city)
        else:
            # TOMORROW / FULL_DAY -> Full morning to night schedule starting at 08:30 AM
            title = f"{city} Complete Day Tour Plan"
            activities = self._build_full_day_schedule(pool, is_rainy, city)

        state["trip_title"] = title
        state["activities"] = activities
        return state

    def _build_full_day_schedule(self, pool: dict, is_rainy: bool, city: str):
        if is_rainy:
            return [
                {
                    "time": "08:30 AM",
                    "name": f"Breakfast at {pool['hotel']['title']}",
                    "type": "HOTEL",
                    "status": "COMPLETED",
                    "lat": pool["hotel"]["lat"],
                    "lng": pool["hotel"]["lng"]
                },
                {
                    "time": "11:00 AM",
                    "name": pool["indoor"]["title"],
                    "type": "ATTRACTION",
                    "status": "PLANNED",
                    "lat": pool["indoor"]["lat"],
                    "lng": pool["indoor"]["lng"]
                },
                {
                    "time": "01:30 PM",
                    "name": f"Traditional Lunch at {pool['lunch']['title']}",
                    "type": "RESTAURANT",
                    "status": "PLANNED",
                    "lat": pool["lunch"]["lat"],
                    "lng": pool["lunch"]["lng"]
                },
                {
                    "time": "05:30 PM",
                    "name": f"Movie Show / Evening Lounge at {city} Multiplex",
                    "type": "EVENT",
                    "status": "PLANNED",
                    "lat": pool["dinner"]["lat"] + 0.002,
                    "lng": pool["dinner"]["lng"] + 0.001
                },
                {
                    "time": "08:30 PM",
                    "name": f"Indoor Dinner at {pool['dinner']['title']}",
                    "type": "RESTAURANT",
                    "status": "PLANNED",
                    "lat": pool["dinner"]["lat"],
                    "lng": pool["dinner"]["lng"]
                }
            ]

        return [
            {
                "time": "08:30 AM",
                "name": f"Morning Tiffins at {pool['hotel']['title']}",
                "type": "HOTEL",
                "status": "COMPLETED",
                "lat": pool["hotel"]["lat"],
                "lng": pool["hotel"]["lng"]
            },
            {
                "time": "10:30 AM",
                "name": pool["sight1"]["title"],
                "type": "ATTRACTION",
                "status": "COMPLETED",
                "lat": pool["sight1"]["lat"],
                "lng": pool["sight1"]["lng"]
            },
            {
                "time": "01:30 PM",
                "name": f"Traditional Andhra Lunch at {pool['lunch']['title']}",
                "type": "RESTAURANT",
                "status": "PLANNED",
                "lat": pool["lunch"]["lat"],
                "lng": pool["lunch"]["lng"]
            },
            {
                "time": "04:00 PM",
                "name": pool["sight2"]["title"],
                "type": "ATTRACTION",
                "status": "PLANNED",
                "lat": pool["sight2"]["lat"],
                "lng": pool["sight2"]["lng"]
            },
            {
                "time": "06:30 PM",
                "name": pool["sunset"]["title"],
                "type": "EVENT",
                "status": "PLANNED",
                "lat": pool["sunset"]["lat"],
                "lng": pool["sunset"]["lng"]
            },
            {
                "time": "08:30 PM",
                "name": f"Evening Dinner at {pool['dinner']['title']}",
                "type": "RESTAURANT",
                "status": "PLANNED",
                "lat": pool["dinner"]["lat"],
                "lng": pool["dinner"]["lng"]
            }
        ]

    def _get_authentic_places_pool(self, c: str):
        if "ravulapalem" in c:
            return {
                "hotel": {"title": "Surya Grand Residency Ravulapalem", "lat": 16.7485, "lng": 81.8432},
                "lunch": {"title": "Subbayya Gari Hotel Ravulapalem", "lat": 16.7492, "lng": 81.8445},
                "dinner": {"title": "Gauthami Family Restaurant Ravulapalem", "lat": 16.7470, "lng": 81.8420},
                "indoor": {"title": "Ravulapalem Indoor Handicrafts & Silk Shopping", "lat": 16.7490, "lng": 81.8440},
                "sight1": {"title": "Ryali Jaganmohini Kesava Swamy Temple Tour", "lat": 16.7905, "lng": 81.8625},
                "sight2": {"title": "Kadiyapulanka Flora Nursery Botanical Gardens", "lat": 16.9200, "lng": 81.8500},
                "sunset": {"title": "Gowthami Godavari River Bridge Viewpoint", "lat": 16.7440, "lng": 81.8400}
            }
        elif "kakinada" in c:
            return {
                "hotel": {"title": "Hotel Grand Kakinada by GRT", "lat": 16.9850, "lng": 82.2350},
                "lunch": {"title": "Subbayya Gari Hotel Kakinada", "lat": 16.9820, "lng": 82.2380},
                "dinner": {"title": "Kotaiah Sweets & Food Court", "lat": 16.9810, "lng": 82.2360},
                "indoor": {"title": "SRMT Mall & Multiplex Kakinada", "lat": 16.9890, "lng": 82.2410},
                "sight1": {"title": "Coringa Wildlife Sanctuary Mangrove Walk", "lat": 16.8500, "lng": 82.3000},
                "sight2": {"title": "Kakinada Port Beach Walkway", "lat": 16.9600, "lng": 82.2600},
                "sunset": {"title": "Uppada Beach Promenade Sunset Drive", "lat": 17.0700, "lng": 82.3300}
            }
        elif "vizag" in c or "visakhapatnam" in c:
            return {
                "hotel": {"title": "Novotel Visakhapatnam Varun Beach", "lat": 17.7100, "lng": 83.3150},
                "lunch": {"title": "Sri Kanya Comfort Restaurant Dwaraka Nagar", "lat": 17.7250, "lng": 83.3080},
                "dinner": {"title": "Sea Pearl RK Beach Seafood Restaurant", "lat": 17.7120, "lng": 83.3180},
                "indoor": {"title": "Visakhapatnam Central Mall Dwaraka Nagar", "lat": 17.7200, "lng": 83.3050},
                "sight1": {"title": "INS Kursura Submarine Museum RK Beach", "lat": 17.7140, "lng": 83.3230},
                "sight2": {"title": "Kailasagiri Hilltop Park Scenic Ropeway", "lat": 17.7480, "lng": 83.3420},
                "sunset": {"title": "Rushikonda Sunset Beach Promenade", "lat": 17.7820, "lng": 83.3850}
            }
        elif "hyderabad" in c:
            return {
                "hotel": {"title": "Taj Krishna Banjara Hills", "lat": 17.4150, "lng": 78.4480},
                "lunch": {"title": "Paradise Biryani Secunderabad", "lat": 17.4425, "lng": 78.4984},
                "dinner": {"title": "Bawarchi Biryani RTC X Roads", "lat": 17.4300, "lng": 78.4700},
                "indoor": {"title": "Inorbit Mall & Prasads Multiplex", "lat": 17.4260, "lng": 78.4520},
                "sight1": {"title": "Charminar & Laad Bazaar Heritage Walk", "lat": 17.3616, "lng": 78.4747},
                "sight2": {"title": "Golconda Fort Historical Sound & Light Tour", "lat": 17.3833, "lng": 78.4011},
                "sunset": {"title": "Hussain Sagar Lake & Tank Bund Sunset Walk", "lat": 17.4239, "lng": 78.4738}
            }
        else: # Rajahmundry / Default
            return {
                "hotel": {"title": "Hotel Shelton Rajamahendri", "lat": 17.0055, "lng": 81.8030},
                "lunch": {"title": "Sri Kanya Comfort Rajahmundry", "lat": 17.0080, "lng": 81.8010},
                "dinner": {"title": "Rajahmundry Rose Milk & Captain's Deck", "lat": 16.9980, "lng": 81.7820},
                "indoor": {"title": "Sree Satyadeva Multiplex & Central Mall", "lat": 17.0110, "lng": 81.8020},
                "sight1": {"title": "Godavari Arch Bridge & Pushkar Ghat", "lat": 17.0020, "lng": 81.7780},
                "sight2": {"title": "Sir Arthur Cotton Museum Dowleswaram", "lat": 16.9400, "lng": 81.7700},
                "sunset": {"title": "Godavari River Sunset Boat Cruise", "lat": 17.0150, "lng": 81.7920}
            }
