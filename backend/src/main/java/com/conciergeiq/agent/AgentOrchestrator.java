package com.conciergeiq.agent;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AgentOrchestrator {

    @Autowired
    private MemoryAgent memoryAgent;

    @Autowired
    private InputAgent inputAgent;

    @Autowired
    private EmergencyAgent emergencyAgent;

    @Autowired
    private SearchAgent searchAgent;

    @Autowired
    private RecommendationAgent recommendationAgent;

    @Autowired
    private PlannerAgent plannerAgent;

    @Autowired
    private ItineraryAgent itineraryAgent;

    @Autowired
    private MapAgent mapAgent;

    @Autowired
    private BookingAgent bookingAgent;

    public AgentState runWorkflow(String query, String currentLocation, Long userId) {
        String defaultLoc = (currentLocation != null && !currentLocation.isEmpty()) ? currentLocation : "Visakhapatnam";
        AgentState state = AgentState.builder()
                .userQuery(query)
                .userId(userId)
                .location(defaultLoc)
                .build();

        state.addLog("Orchestrator", "Initializing multi-agent cooperative pipeline...");

        // Edge 1: Memory Agent Node (Loads user travel memory & preferences)
        memoryAgent.execute(state);

        // Edge 2: Input Agent Node (Extracts location, budget, dates, travel style)
        inputAgent.execute(state);

        boolean isEmergency = query.toLowerCase().contains("emergency") || query.toLowerCase().contains("hospital") ||
                              query.toLowerCase().contains("doctor") || query.toLowerCase().contains("accident") ||
                              query.toLowerCase().contains("medical") || query.toLowerCase().contains("pharmacy") ||
                              query.toLowerCase().contains("police");

        if (isEmergency) {
            // Edge 3a: Emergency Agent Node (Bypasses normal sightseeing)
            emergencyAgent.execute(state);
        } else {
            // Edge 3b: Search Agent Node (RAG retrieval across hotels, dining, attractions, events, ATMs)
            searchAgent.execute(state);

            // Edge 4: Recommendation Agent Node (Computes transparent AI selection reasonings)
            recommendationAgent.execute(state);

            // Edge 5: Planner & Itinerary Agent Nodes (Generates structured 10-slot hourly schedule)
            plannerAgent.execute(state);
            itineraryAgent.execute(state);
        }

        // Edge 6: Map & Optimization Agent Node (Geocodes coordinates, computes leg distance, ETA, polyline)
        mapAgent.execute(state);

        // Edge 7: Booking Agent Node
        bookingAgent.execute(state);

        state.addLog("Orchestrator", "Multi-agent cooperative pipeline completed successfully.");
        return state;
    }
}
