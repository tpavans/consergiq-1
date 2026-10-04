from agents.input_processing_agent import InputProcessingAgent
from agents.search_agent import SearchAgent
from agents.planner_agent import PlannerAgent
from agents.emergency_agent import EmergencyAgent

class AgentOrchestrator:
    def __init__(self):
        self.input_agent = InputProcessingAgent()
        self.search_agent = SearchAgent()
        self.planner_agent = PlannerAgent()
        self.emergency_agent = EmergencyAgent()

    def run_workflow(self, query: str, current_location: str, user_id: int) -> dict:
        state = {
            "user_query": query,
            "current_location": current_location or "Rajamahendravaram",
            "user_id": user_id,
            "logs": ["[Orchestrator] Initializing multi-agent cooperative pipeline..."]
        }

        # Step 1: Input Processing Agent
        state = self.input_agent.execute(state)

        # Step 2: Search Agent
        state = self.search_agent.execute(state)

        # Step 3: Emergency Agent Check
        state = self.emergency_agent.execute(state)

        # Step 4: Planner Agent (if not emergency)
        if not state.get("is_emergency", False):
            state = self.planner_agent.execute(state)

        # Step 5: Construct AI Assistant Guide Persona Response Message
        loc = state.get("location", "Rajamahendravaram")
        if state.get("is_emergency", False):
            response_msg = (
                f"🚨 I detected a medical emergency request. I activated my emergency protocol, "
                f"located the nearest trauma center in {loc}, and mapped the shortest traffic-free route. "
                f"Please proceed to the emergency ward immediately."
            )
        elif state.get("is_rainy", False):
            response_msg = (
                f"☔ Hello! I checked the live weather for {loc} and detected rain. "
                f"To keep you dry, I modified your To-Do itinerary to prioritize indoor multiplex movies, "
                f"shopping malls, and fine dining!"
            )
        else:
            response_msg = (
                f"☀️ Hello! I am your AI Travel Concierge. The weather in {loc} is clear! "
                f"I built a time-to-time hourly To-Do schedule featuring high-safety hotels, "
                f"top-rated dining spots, and scenic sunset sights."
            )

        state["response_message"] = response_msg
        state["logs"].append("[Orchestrator] Multi-agent cooperative pipeline completed successfully.")
        return state
