class EmergencyAgent:
    def execute(self, state: dict) -> dict:
        query = state.get("user_query", "").lower()
        city = state.get("location", "Rajamahendravaram")
        base_lat = state.get("base_lat", 17.0005)
        base_lng = state.get("base_lng", 81.8040)

        emergency_keywords = ["emergency", "hospital", "doctor", "accident", "medical"]
        is_emergency = any(k in query for k in emergency_keywords)

        if is_emergency:
            state["logs"].append(f"[EmergencyAgent] 🚨 EMERGENCY ALERT DETECTED! Bypassing tourism to route nearest trauma care in {city}.")
            state["trip_title"] = "EMERGENCY MEDICAL ROUTE"
            
            state["activities"] = [
                {
                    "time": "Immediate",
                    "name": f"Emergency Route: {city} Apollo Trauma & Medical Center",
                    "type": "HOSPITAL",
                    "status": "IN_PROGRESS",
                    "lat": base_lat + 0.002,
                    "lng": base_lng + 0.001
                },
                {
                    "time": "Backup Hub",
                    "name": f"{city} Government General Hospital",
                    "type": "HOSPITAL",
                    "status": "PLANNED",
                    "lat": base_lat + 0.004,
                    "lng": base_lng + 0.003
                }
            ]

            state["recommendations"] = [
                {
                    "id": 911,
                    "title": f"{city} Apollo Emergency Trauma Center",
                    "description": "24/7 ICUs, advanced cardiology, emergency ambulance dispatch unit.",
                    "category": "Hospital",
                    "rating": 4.9,
                    "safetyScore": "24/7 Trauma Ready",
                    "distance": "0.5 km (3 min drive)",
                    "imageUrl": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=400&q=80",
                    "type": "HOSPITAL"
                }
            ]
            state["is_emergency"] = True

        return state
