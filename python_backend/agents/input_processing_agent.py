import os
import requests
import re

class InputProcessingAgent:
    def __init__(self):
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY", "")

    def execute(self, state: dict) -> dict:
        query = state.get("user_query", "").lower()
        client_loc = state.get("current_location", "Rajahmundry")
        
        state["logs"].append(f"[InputProcessingAgent] Analyzing prompt: '{query}'")

        # 1. Parse target city from query
        extracted_city = self._parse_city(query, fallback=client_loc)
        state["location"] = extracted_city

        # 2. Parse budget
        extracted_budget = self._parse_budget(query, fallback=1000)
        state["budget"] = extracted_budget

        # 3. Check live weather for destination
        is_rainy = self._check_live_weather(extracted_city)
        state["is_rainy"] = is_rainy

        # 4. Parse time horizon ("today" vs "tomorrow")
        time_horizon = self._parse_time_horizon(query)
        state["time_horizon"] = time_horizon

        state["logs"].append(
            f"[InputProcessingAgent] Result -> City: '{extracted_city}', Budget: ₹{extracted_budget}, Rain Alert: {is_rainy}, Time Horizon: {time_horizon}"
        )
        return state

    def _parse_city(self, query: str, fallback: str) -> str:
        known_cities = ["rajahmundry", "rajamahendravaram", "vizag", "visakhapatnam", "hyderabad", "vijayawada", "ravulapalem", "bangalore", "bengaluru", "goa"]
        for city in known_cities:
            if city in query:
                if city in ["rajahmundry", "rajamahendravaram"]:
                    return "Rajamahendravaram"
                return city.capitalize()

        # Check preposition patterns "in <city>", "at <city>", "<city> lo"
        match = re.search(r'\b(in|at|to)\s+([a-zA-Z]{3,})\b', query)
        if match:
            return match.group(2).capitalize()
        
        match_lo = re.search(r'\b([a-zA-Z]{3,})\s+lo\b', query)
        if match_lo:
            return match_lo.group(1).capitalize()

        return fallback.capitalize()

    def _parse_budget(self, query: str, fallback: int) -> int:
        if "budget" in query:
            match = re.search(r'budget\s*[:=]?\s*(\d+)', query)
            if match:
                return int(match.group(1))
        numbers = re.findall(r'\b\d{3,6}\b', query)
        if numbers:
            return int(numbers[0])
        return fallback

    def _check_live_weather(self, city: str) -> bool:
        try:
            clean_city = city.replace(", India", "").strip()
            url = f"https://api.openweathermap.org/data/2.5/weather?q={clean_city}&units=metric&appid={self.weather_api_key}"
            res = requests.get(url, timeout=4)
            if res.status_code == 200:
                data = res.json()
                weather_main = data.get("weather", [{}])[0].get("main", "").lower()
                if any(w in weather_main for w in ["rain", "drizzle", "thunderstorm"]):
                    return True
        except Exception:
            pass
        return False

    def _parse_time_horizon(self, query: str) -> str:
        if any(w in query for w in ["today", "now", "tonight", "this evening", "this afternoon"]):
            return "TODAY"
        elif any(w in query for w in ["tomorrow", "next day"]):
            return "TOMORROW"
        return "FULL_DAY"
