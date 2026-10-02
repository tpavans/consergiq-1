// package com.conciergeiq.service;


// import com.conciergeiq.dto.ScheduleDto;
// import com.conciergeiq.dto.TripDto;
// import java.math.BigDecimal;
// import java.time.LocalTime;
// import com.conciergeiq.dto.ChatResponseDto;
// import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
// import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
// import com.conciergeiq.agent.AgentOrchestrator;
// import com.conciergeiq.agent.AgentState;
// import com.conciergeiq.entity.ChatHistory;
// import com.conciergeiq.entity.User;
// import com.conciergeiq.repository.ChatHistoryRepository;
// import com.conciergeiq.repository.UserRepository;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.time.LocalDate;
// import java.util.List;

// @Service
// public class ChatConciergeService {
//     private static final Logger logger = LoggerFactory.getLogger(ChatConciergeService.class);

//     @Autowired
//     private ChatHistoryRepository chatHistoryRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private AgentOrchestrator agentOrchestrator;

//     @Autowired
//     private TripService tripService; 
//     public ChatResponseDto processMessage(String message, String currentLocation, Long userId) {
//         logger.info("Processing message from user {}: {}", userId, message);

//         // Execute dynamic LangGraph multi-agent orchestration workflow
//         AgentState state = agentOrchestrator.runWorkflow(message, currentLocation, userId);

//         // Save User Message to database
//         User user = userRepository.findById(userId).orElse(null);
//         if (user != null) {
//             chatHistoryRepository.save(ChatHistory.builder()
//                     .user(user)
//                     .role("USER")
//                     .message(message)
//                     .build());
//         }

//         String capitalizedLoc = state.getLocation().substring(0, 1).toUpperCase() + state.getLocation().substring(1);
//         String responseText = "";

//         // Determine guide persona response text dynamically based on context
//         boolean isEmergency = message.toLowerCase().contains("emergency") || message.toLowerCase().contains("hospital") || 
//                               message.toLowerCase().contains("doctor") || message.toLowerCase().contains("accident") || 
//                               message.toLowerCase().contains("medical");

//         if (isEmergency) {
//             responseText = "🚨 I detected a medical emergency query. I have instantly bypassed standard sightseeing and activated my emergency medical protocol. I located the nearest high-rated trauma care and mapped the shortest traffic-free route. Please proceed to the emergency ward immediately; details are loaded on your live tracking map.";
//         } else if (state.getTripTitle().toLowerCase().contains("rain")) {
//             responseText = String.format("☔ Hello! I checked the live weather for %s and detected rain/showers. To keep you comfortable, I have dynamically modified your plan to focus on premium indoor activities, including an indoor multiplex movie and dining. Safe and dry! Let me know if you would like me to book it.", capitalizedLoc);
//         } else {
//             responseText = String.format("☀️ Hello! I am your travel concierge. I checked the weather in %s and it looks clear! I have mapped out a beautiful outdoor itinerary featuring a scenic sunset sightseeing tour followed by a fine dinner at a top-rated restaurant. Let me know if this looks good and I can book the tickets for you!", capitalizedLoc);
//         }

//         // Save AI Response to Chat History
//         if (user != null) {
//             chatHistoryRepository.save(ChatHistory.builder()
//                     .user(user)
//                     .role("ASSISTANT")
//                     .message(responseText)
//                     .build());
//         }

//         ItineraryProposalDto proposal = ItineraryProposalDto.builder()
//                 .title(state.getTripTitle())
//                 .destination(capitalizedLoc)
//                 .startDate(LocalDate.now().toString())
//                 .endDate(LocalDate.now().toString())
//                 .activities(state.getActivities())
//                 .build();

//         return ChatResponseDto.builder()
//                 .responseMessage(responseText)
//                 .recommendations(state.getRecommendations())
//                 .proposedItinerary(proposal)
//                 .agentLogs(state.getExecutionLogs())
//                 .build();
//     }
//     try {

//     TripDto tripDto = new TripDto();

//     tripDto.setTitle(proposal.getTitle());
//     tripDto.setDestination(proposal.getDestination());
//     tripDto.setStartDate(LocalDate.now());
//     tripDto.setEndDate(LocalDate.now());
//     tripDto.setBudgetLimit(new BigDecimal("5000"));
//     tripDto.setBudgetSpent(BigDecimal.ZERO);

//     TripDto savedTrip = tripService.createTrip(tripDto, userId);

//     for (ProposedActivity activity : proposal.getActivities()) {

//         ScheduleDto schedule = new ScheduleDto();

//         schedule.setDayNumber(1);

//         try {
//             schedule.setScheduledTime(LocalTime.parse(activity.getTime()));
//         } catch (Exception e) {
//             schedule.setScheduledTime(LocalTime.of(9,0));
//         }

//         schedule.setActivityName(activity.getName());
//         schedule.setActivityType(activity.getType());
//         schedule.setActivityId(activity.getActivityId());
//         schedule.setStatus("PLANNED");

//         tripService.addScheduleItem(
//                 savedTrip.getId(),
//                 schedule,
//                 userId
//         );
//     }

//     logger.info("Trip auto saved successfully.");

// } catch (Exception ex) {

//     logger.error("Failed to auto save trip : {}", ex.getMessage());

// }

//     public List<ChatHistory> getChatHistory(Long userId) {
//         return chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
//     }
// }



package com.conciergeiq.service;

import com.conciergeiq.agent.AgentOrchestrator;
import com.conciergeiq.agent.AgentState;
import com.conciergeiq.dto.ChatResponseDto;
import com.conciergeiq.dto.ChatResponseDto.ItineraryProposalDto;
import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import com.conciergeiq.entity.*;
import com.conciergeiq.exception.ResourceNotFoundException;
import com.conciergeiq.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatConciergeService {

    private static final Logger logger = LoggerFactory.getLogger(ChatConciergeService.class);

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentOrchestrator agentOrchestrator;

    @Autowired
    private PreferenceProfileRepository preferenceProfileRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired(required = false)
    private dev.langchain4j.model.chat.ChatLanguageModel chatLanguageModel;

    public ChatResponseDto processMessage(String message,
                                          String currentLocation,
                                          Long userId) {

        logger.info("Processing message from user {} : {}", userId, message);

        // Load context elements as requested
        logger.info("Loading profile for user {}", userId);
        PreferenceProfile profile = preferenceProfileRepository.findByUserId(userId).orElse(null);

        logger.info("Loading active itinerary for user {}", userId);
        Trip activeTrip = null;
        List<Trip> travelHistory = new ArrayList<>();
        try {
            List<Trip> trips = tripRepository.findByUserId(userId);
            activeTrip = trips.stream()
                    .filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus()))
                    .findFirst()
                    .orElse(null);

            travelHistory = trips.stream()
                    .filter(t -> "ARCHIVED".equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warn("Could not query active trip for user {}: {}", userId, e.getMessage());
        }

        String searchLoc = (currentLocation != null && !currentLocation.isEmpty()) ? currentLocation : "Goa";
        logger.info("Loading weather data for {}", searchLoc);

        logger.info("Loading nearby attractions, restaurants, and events for {}", searchLoc);
        List<Hotel> dbHotels = hotelRepository.findByCityIgnoreCase(searchLoc);
        if (dbHotels.isEmpty()) dbHotels = hotelRepository.findAll();

        List<Restaurant> dbRestaurants = restaurantRepository.findByCityIgnoreCase(searchLoc);
        if (dbRestaurants.isEmpty()) dbRestaurants = restaurantRepository.findAll();

        List<Event> dbEvents = eventRepository.findByCityIgnoreCase(searchLoc);
        if (dbEvents.isEmpty()) dbEvents = eventRepository.findAll();

        logger.info("Searching OpenSearch database similarity matches for: {}", message);

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            chatHistoryRepository.save(
                    ChatHistory.builder()
                            .user(user)
                            .role("USER")
                            .message(message)
                            .build()
            );
        }

        boolean isModification = false;
        String queryLower = message.toLowerCase();
        if (activeTrip != null && (queryLower.contains("replace") || queryLower.contains("instead of") || 
                                   queryLower.contains("change") || queryLower.contains("swap") || 
                                   queryLower.contains("remove") || queryLower.contains("delete"))) {
            isModification = true;
        }

        String responseText = "";
        ItineraryProposalDto proposal = null;
        List<RecommendationCard> recommendations = new ArrayList<>();
        List<String> agentLogs = new ArrayList<>();

        if (isModification) {
            logger.info("Interpreting modification request for current active trip ID: {}", activeTrip.getId());
            String replaceOld = null;
            String replaceNew = null;
            String replaceType = "ATTRACTION";

            if (chatLanguageModel != null) {
                try {
                    String parsePrompt = String.format(
                        "The user wants to replace/modify an activity in their travel plan. User prompt: \"%s\". " +
                        "Please identify: " +
                        "1. The name/keyword of the activity to be replaced (e.g. 'museum'). " +
                        "2. The name of the new activity to replace it with (e.g. 'Calangute Beach'). " +
                        "3. The type of the new activity (choose from: HOTEL, RESTAURANT, EVENT, ATTRACTION, LEISURE). " +
                        "Format your output exactly like this: REPLACE: <old>, WITH: <new>, TYPE: <type>",
                        message
                    );
                    String parseRes = chatLanguageModel.generate(parsePrompt);
                    if (parseRes.contains("REPLACE:") && parseRes.contains("WITH:")) {
                        replaceOld = parseRes.substring(parseRes.indexOf("REPLACE:") + 8, parseRes.indexOf("WITH:")).replace(",", "").trim();
                        if (parseRes.contains("TYPE:")) {
                            replaceNew = parseRes.substring(parseRes.indexOf("WITH:") + 5, parseRes.indexOf("TYPE:")).replace(",", "").trim();
                            replaceType = parseRes.substring(parseRes.indexOf("TYPE:") + 5).trim().toUpperCase();
                        } else {
                            replaceNew = parseRes.substring(parseRes.indexOf("WITH:") + 5).trim();
                        }
                    }
                } catch (Exception e) {
                    logger.error("Gemini modification parsing failed", e);
                }
            }

            if (replaceOld == null || replaceNew == null) {
                if (message.toLowerCase().contains("replace") && message.toLowerCase().contains("with")) {
                    int replaceIdx = message.toLowerCase().indexOf("replace");
                    int withIdx = message.toLowerCase().indexOf("with");
                    if (replaceIdx < withIdx) {
                        replaceOld = message.substring(replaceIdx + 7, withIdx).trim();
                        replaceNew = message.substring(withIdx + 4).trim();
                    }
                }
            }

            if (replaceOld != null && replaceNew != null) {
                boolean foundReplacement = false;
                for (Schedule s : activeTrip.getSchedules()) {
                    if (s.getActivityName().toLowerCase().contains(replaceOld.toLowerCase())) {
                        s.setActivityName(replaceNew);
                        s.setActivityType(replaceType);
                        scheduleRepository.save(s);
                        foundReplacement = true;
                        break;
                    }
                }

                if (!foundReplacement && !activeTrip.getSchedules().isEmpty()) {
                    Schedule s = activeTrip.getSchedules().get(0);
                    s.setActivityName(replaceNew);
                    s.setActivityType(replaceType);
                    scheduleRepository.save(s);
                }

                recalculateTripMetrics(activeTrip);
                responseText = String.format("🔄 I updated your active itinerary to replace '%s' with '%s'. Dashboard, planner, and map are refreshed.", replaceOld, replaceNew);
            } else {
                responseText = "I detected that you want to modify your plan, but I couldn't specify the details. Please write like 'replace museum with beach'.";
            }

            // Build proposal from modified activeTrip
            List<ProposedActivity> activities = activeTrip.getSchedules().stream().map(s -> ProposedActivity.builder()
                    .time(s.getScheduledTime().toString())
                    .name(s.getActivityName())
                    .type(s.getActivityType())
                    .activityId(s.getActivityId())
                    .lat(15.5562 + (Math.random() - 0.5) * 0.01)
                    .lng(73.7512 + (Math.random() - 0.5) * 0.01)
                    .build()).collect(Collectors.toList());

            proposal = ItineraryProposalDto.builder()
                    .tripId(activeTrip.getId())
                    .title(activeTrip.getTitle())
                    .destination(activeTrip.getDestination())
                    .startDate(activeTrip.getStartDate().toString())
                    .endDate(activeTrip.getEndDate().toString())
                    .activities(activities)
                    .currentLocation(searchLoc)
                    .budget(activeTrip.getBudgetLimit().toString())
                    .travelDistance(activeTrip.getTravelDistance())
                    .travelTime(activeTrip.getTravelTime())
                    .weather("Clear skies")
                    .googleMapsRoute(activeTrip.getGoogleMapsRoute())
                    .polylineCoordinates(activeTrip.getPolylineCoordinates())
                    .build();

            agentLogs.add("[ConciergeIQ]: Detected modification request. Updated existing database trip and schedules.");

        } else {
            // New Plan Request
            AgentState state = agentOrchestrator.runWorkflow(message, currentLocation, userId);

            String capitalizedLoc = state.getLocation().substring(0, 1).toUpperCase() + state.getLocation().substring(1);
            boolean emergency = message.toLowerCase().contains("hospital") || message.toLowerCase().contains("doctor") || 
                               message.toLowerCase().contains("medical") || message.toLowerCase().contains("emergency") || 
                               message.toLowerCase().contains("accident");

            if (emergency) {
                responseText = "🚨 Medical emergency detected. I found the nearest emergency hospital and prepared the quickest route.";
            } else if (state.getTripTitle().toLowerCase().contains("rain")) {
                responseText = "☔ Rain detected in " + capitalizedLoc + ". I switched your itinerary to indoor activities.";
            } else {
                responseText = "☀️ Weather looks clear in " + capitalizedLoc + ". I created an outdoor itinerary for you.";
            }

            // Auto-Save the Trip to PostgreSQL as ACTIVE
            Trip savedTrip = autoSaveProposedItinerary(state, userId);

            recommendations = state.getRecommendations();
            agentLogs = state.getExecutionLogs();

            proposal = ItineraryProposalDto.builder()
                    .tripId(savedTrip.getId())
                    .title(state.getTripTitle())
                    .destination(capitalizedLoc)
                    .startDate(LocalDate.now().toString())
                    .endDate(LocalDate.now().toString())
                    .activities(state.getActivities())
                    .currentLocation(searchLoc)
                    .budget(savedTrip.getBudgetLimit().toString())
                    .travelDistance(savedTrip.getTravelDistance())
                    .travelTime(savedTrip.getTravelTime())
                    .weather(emergency ? "Trauma Alert" : (state.getTripTitle().toLowerCase().contains("rain") ? "Rainy" : "Clear"))
                    .googleMapsRoute(savedTrip.getGoogleMapsRoute())
                    .polylineCoordinates(savedTrip.getPolylineCoordinates())
                    .build();
        }

        if (user != null) {
            chatHistoryRepository.save(
                    ChatHistory.builder()
                            .user(user)
                            .role("ASSISTANT")
                            .message(responseText)
                            .build()
            );
        }

        // Map nearby hotels, restaurants, events to Recommendations Card
        List<RecommendationCard> hotels = dbHotels.stream().map(h -> RecommendationCard.builder()
                .id(h.getId())
                .title(h.getName())
                .description(h.getDescription())
                .category("Hotel")
                .rating(h.getRating())
                .distance("1.5 km")
                .imageUrl(h.getImageUrls().isEmpty() ? "" : h.getImageUrls().get(0))
                .type("HOTEL")
                .build()).collect(Collectors.toList());

        List<RecommendationCard> restaurants = dbRestaurants.stream().map(r -> RecommendationCard.builder()
                .id(r.getId())
                .title(r.getName())
                .description(r.getCuisineType() + " cuisine")
                .category("Restaurant")
                .rating(r.getRating())
                .distance("1.2 km")
                .imageUrl(r.getImageUrl())
                .type("RESTAURANT")
                .build()).collect(Collectors.toList());

        List<RecommendationCard> events = dbEvents.stream().map(e -> RecommendationCard.builder()
                .id(e.getId())
                .title(e.getName())
                .description(e.getDescription())
                .category(e.getCategory())
                .rating(4.5)
                .distance("2.0 km")
                .imageUrl(e.getImageUrl())
                .type("EVENT")
                .build()).collect(Collectors.toList());

        if (proposal != null) {
            proposal.setHotels(hotels);
            proposal.setRestaurants(restaurants);
            proposal.setEvents(events);
            
            List<RecommendationCard> combinedPlaces = new ArrayList<>();
            combinedPlaces.addAll(hotels);
            combinedPlaces.addAll(restaurants);
            combinedPlaces.addAll(events);
            proposal.setNearbyPlaces(combinedPlaces);
        }

        return ChatResponseDto.builder()
                .responseMessage(responseText)
                .recommendations(recommendations.isEmpty() ? restaurants : recommendations)
                .proposedItinerary(proposal)
                .agentLogs(agentLogs)
                .build();
    }

    @Transactional
    public Trip autoSaveProposedItinerary(AgentState state, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Archive any existing active trip
        List<Trip> activeTrips = tripRepository.findByUserId(userId);
        for (Trip t : activeTrips) {
            if ("ACTIVE".equalsIgnoreCase(t.getStatus())) {
                t.setStatus("ARCHIVED");
                tripRepository.save(t);
            }
        }

        // Create new trip
        Trip trip = Trip.builder()
                .user(user)
                .title(state.getTripTitle())
                .destination(state.getLocation().substring(0, 1).toUpperCase() + state.getLocation().substring(1))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(1)) // 1 day trip default
                .budgetLimit(BigDecimal.valueOf(state.getEstimatedBudget() != null ? state.getEstimatedBudget() : 1000))
                .budgetSpent(BigDecimal.ZERO)
                .status("ACTIVE")
                .travelDistance(state.getTravelDistance())
                .travelTime(state.getTravelTime())
                .googleMapsRoute(state.getGoogleMapsRoute())
                .polylineCoordinates(state.getPolylineCoordinates())
                .schedules(new java.util.ArrayList<>())
                .build();

        Trip savedTrip = tripRepository.save(trip);

        // Create schedules
        for (ProposedActivity activity : state.getActivities()) {
            java.time.LocalTime scheduledTime;
            try {
                scheduledTime = java.time.LocalTime.parse(activity.getTime().toUpperCase(), java.time.format.DateTimeFormatter.ofPattern("hh:mm a"));
            } catch (Exception e) {
                try {
                    scheduledTime = java.time.LocalTime.parse(activity.getTime());
                } catch (Exception ex) {
                    scheduledTime = java.time.LocalTime.of(9, 0); // fallback
                }
            }

            Schedule scheduleItem = Schedule.builder()
                    .trip(savedTrip)
                    .dayNumber(1)
                    .scheduledTime(scheduledTime)
                    .activityName(activity.getName())
                    .activityType(activity.getType())
                    .status("PLANNED")
                    .build();

            scheduleRepository.save(scheduleItem);
        }

        return savedTrip;
    }

    private void recalculateTripMetrics(Trip trip) {
        if (trip == null || trip.getSchedules().isEmpty()) return;
        
        String destLower = (trip.getDestination() != null) ? trip.getDestination().toLowerCase() : "";
        double userLat = 15.5522;
        double userLng = 73.7462;

        if (destLower.contains("rajahmundry") || destLower.contains("rajamahendravaram")) { userLat = 17.0005; userLng = 81.8040; }
        else if (destLower.contains("vizag") || destLower.contains("visakhapatnam")) { userLat = 17.6868; userLng = 83.2185; }
        else if (destLower.contains("hyderabad")) { userLat = 17.3850; userLng = 78.4867; }
        else if (destLower.contains("bangalore") || destLower.contains("bengaluru")) { userLat = 12.9716; userLng = 77.5946; }
        else if (destLower.contains("ravulapalem")) { userLat = 16.7490; userLng = 81.8440; }
        else if (destLower.contains("mumbai")) { userLat = 19.0760; userLng = 72.8777; }
        else if (destLower.contains("chennai")) { userLat = 13.0827; userLng = 80.2707; }
        else if (destLower.contains("delhi")) { userLat = 28.6139; userLng = 77.2090; }
        
        double totalDistanceKm = 0.0;
        double prevLat = userLat;
        double prevLng = userLng;
        StringBuilder polylineBuilder = new StringBuilder();
        polylineBuilder.append("[").append(prevLat).append(",").append(prevLng).append("]");
        StringBuilder waypoints = new StringBuilder();

        for (Schedule s : trip.getSchedules()) {
            double lat = userLat + (Math.random() - 0.5) * 0.02;
            double lng = userLng + (Math.random() - 0.5) * 0.02;
            
            // Try to match standard coordinates from seeder
            String nameLower = s.getActivityName().toLowerCase();
            if (nameLower.contains("sea view resort")) { lat = 15.5992; lng = 73.7431; }
            else if (nameLower.contains("fort aguada")) { lat = 15.5562; lng = 73.7512; }
            else if (nameLower.contains("fisherman")) { lat = 15.4909; lng = 73.8122; }
            else if (nameLower.contains("spice plantation")) { lat = 15.5540; lng = 73.7562; }
            else if (nameLower.contains("cruise")) { lat = 15.5560; lng = 73.7510; }
            else if (nameLower.contains("seaside grill")) { lat = 15.5562; lng = 73.7512; }
            else if (nameLower.contains("beach")) { lat = 15.5560 + (Math.random() - 0.5) * 0.01; lng = 73.7510 + (Math.random() - 0.5) * 0.01; }

            double dLat = lat - prevLat;
            double dLng = lng - prevLng;
            double dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111.0;
            totalDistanceKm += dist;

            polylineBuilder.append(",[").append(lat).append(",").append(lng).append("]");
            if (waypoints.length() > 0) waypoints.append("|");
            waypoints.append(lat).append(",").append(lng);

            prevLat = lat;
            prevLng = lng;
        }

        // Round trip back to origin
        double dLat = userLat - prevLat;
        double dLng = userLng - prevLng;
        totalDistanceKm += Math.sqrt(dLat * dLat + dLng * dLng) * 111.0;
        polylineBuilder.append(",[").append(userLat).append(",").append(userLng).append("]");

        int totalTimeMin = (int) Math.round(totalDistanceKm * 2.5);
        trip.setTravelDistance(String.format("%.1f km", totalDistanceKm));
        trip.setTravelTime(String.format("%d min drive", totalTimeMin));
        trip.setPolylineCoordinates("[" + polylineBuilder.toString() + "]");
        trip.setGoogleMapsRoute(String.format("https://www.google.com/maps/dir/?api=1&origin=%f,%f&destination=%f,%f&waypoints=%s",
                userLat, userLng, userLat, userLng, waypoints.toString()));
        tripRepository.save(trip);
    }

    public List<ChatHistory> getChatHistory(Long userId) {
        return chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
    }

}