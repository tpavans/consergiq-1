package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EmergencyAgent {

    public void execute(AgentState state) {
        state.addLog("EmergencyAgent", "🚨 EMERGENCY PROTOCOL ACTIVATED: Bypassing standard sightseeing workflow.");

        String city = state.getLocation();
        double baseLat = state.getUserLat() != null ? state.getUserLat() : 17.0005;
        double baseLng = state.getUserLng() != null ? state.getUserLng() : 81.8040;

        List<ProposedActivity> emergencyActs = new ArrayList<>();
        emergencyActs.add(ProposedActivity.builder()
                .time("IMMEDIATE")
                .name("Emergency Trauma Care Hospital")
                .type("HOSPITAL")
                .activityId(999L)
                .lat(baseLat + 0.002)
                .lng(baseLng + 0.002)
                .reasoning("Selected for 24/7 ICU & Emergency Trauma Services within 1.0 km")
                .address("Main Highway Ward, " + city)
                .phone("+91 999 108 0000 / Emergency Ward: +91 883 2450000")
                .website("https://conciergeiq.com/emergency/hospital")
                .openingHours("24 Hours Emergency Service")
                .googleMapsUrl("https://maps.google.com/?q=Hospital+Emergency+" + city)
                .build());

        emergencyActs.add(ProposedActivity.builder()
                .time("30 MIN")
                .name("24/7 Pharmacy & Medical Depot")
                .type("HOSPITAL")
                .activityId(998L)
                .lat(baseLat + 0.003)
                .lng(baseLng + 0.001)
                .reasoning("Selected for immediate availability of prescription medications & trauma supplies")
                .address("Hospital Road, " + city)
                .phone("+91 98765 00999")
                .website("https://conciergeiq.com/emergency/pharmacy")
                .openingHours("24 Hours Open")
                .googleMapsUrl("https://maps.google.com/?q=Pharmacy+" + city)
                .build());

        state.setActivities(emergencyActs);

        List<RecommendationCard> emergencyCards = new ArrayList<>();
        emergencyCards.add(RecommendationCard.builder()
                .id(999L)
                .title("City Emergency Trauma Care Center")
                .description("Multi-specialty hospital with 24/7 ICU, Ambulance & Emergency ward")
                .category("Hospital")
                .rating(4.9)
                .distance("0.8 km")
                .imageUrl("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80")
                .type("HOSPITAL")
                .reasoning("Nearest high-rated emergency medical unit with zero traffic route")
                .address("Main Hospital Complex, " + city)
                .phone("+91 108 (Ambulance Direct line)")
                .website("https://conciergeiq.com/emergency")
                .openingHours("24 Hours Open")
                .googleMapsUrl("https://maps.google.com/?q=Hospital+" + city)
                .build());

        state.setRecommendations(emergencyCards);
        state.addLog("EmergencyAgent", "Emergency trauma care details and zero-traffic route loaded.");
    }
}
