package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.ProposedActivity;
import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RegionalKnowledgeEngine {

    public List<RecommendationCard> getRegionalRecommendations(String locationQuery) {
        String queryLower = locationQuery.toLowerCase();
        List<RecommendationCard> cards = new ArrayList<>();

        if (queryLower.contains("ravulapalem") || queryLower.contains("konaseema") || queryLower.contains("vadapalli") || queryLower.contains("ryali")) {
            // Ravulapalem & Konaseema Region Specials
            cards.add(RecommendationCard.builder()
                    .id(501L)
                    .title("Vadapalli Sri Venkateswara Swamy Temple")
                    .description("Famous 7-Saturday Vratam temple on Godavari banks (Deena Bandhavudu). 10 km from Ravulapalem.")
                    .category("Temple & Spiritual")
                    .rating(4.9)
                    .distance("9.5 km")
                    .imageUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: #1 Spiritual attraction in Konaseema, 4.9 ★ Rating, 10 min drive from Ravulapalem")
                    .address("Vadapalli Village, Atreyapuram Mandal, Konaseema District")
                    .phone("+91 883 244 5566")
                    .website("https://konaseematourism.com/vadapalli-temple")
                    .openingHours("06:00 AM - 01:00 PM, 04:00 PM - 08:30 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Vadapalli+Venkateswara+Swamy+Temple+Ravulapalem")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(502L)
                    .title("Ravulapalem World-Famous Pootharekulu & Rose Milk Center")
                    .description("World famous traditional Andhra Ghee Paper Sweets (Pootharekulu) and fresh Rose Milk.")
                    .category("Food Speciality")
                    .rating(4.9)
                    .distance("0.5 km")
                    .imageUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80")
                    .type("RESTAURANT")
                    .reasoning("Selected because: Iconic Ravulapalem Sweet delicacy, 4.9 ★ Rating, Must-try regional food special")
                    .address("Main Road Market, Ravulapalem")
                    .phone("+91 98480 12345")
                    .website("https://ravulapalempootharekulu.com")
                    .openingHours("08:00 AM - 10:30 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Ravulapalem+Pootharekulu+Center")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(503L)
                    .title("Ryali Sri Jaganmohini Kesava Swamy Temple")
                    .description("Unique 11th-century temple featuring Lord Vishnu in front and Jaganmohini form on the back.")
                    .category("Temple & Heritage")
                    .rating(4.8)
                    .distance("14.0 km")
                    .imageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Architecturally rare Chola-era temple near Ravulapalem, 4.8 ★ Rating")
                    .address("Ryali Village, Ravulapalem Road")
                    .phone("+91 8855 273111")
                    .website("https://konaseematourism.com/ryali")
                    .openingHours("06:00 AM - 12:00 PM, 04:00 PM - 08:00 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Ryali+Jaganmohini+Kesava+Swamy+Temple")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(504L)
                    .title("Dindi & Pasarlapudi Coconut Island Backwaters Cruise")
                    .description("Scenic houseboat rides through serene coconut groves and Godavari river backwaters.")
                    .category("Backwaters & Cruise")
                    .rating(4.8)
                    .distance("18.0 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Premium Konaseema Backwater experience, 4.8 ★ Rating, serene nature landscape")
                    .address("Dindi Resorts Jetty, Konaseema")
                    .phone("+91 99890 55443")
                    .website("https://dindibackwaters.com")
                    .openingHours("09:00 AM - 06:00 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Dindi+Resorts+Konaseema")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(505L)
                    .title("Godavari Seafood & Royyala Biryani Fine Dining")
                    .description("Authentic Andhra Godavari Fish Curry (Pulasa / Korrameenu), Prawns Fry (Royyala Iguru), & Veg Meals.")
                    .category("Regional Restaurant")
                    .rating(4.7)
                    .distance("1.2 km")
                    .imageUrl("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80")
                    .type("RESTAURANT")
                    .reasoning("Selected because: Famous Godavari authentic seafood & veg platter, 4.7 ★ Rating, 1.2 km away")
                    .address("NH-16 Bypass Junction, Ravulapalem")
                    .phone("+91 8855 242424")
                    .website("https://godavaridining.com")
                    .openingHours("11:30 AM - 10:30 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Godavari+Restaurants+Ravulapalem")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(506L)
                    .title("Ravulapalem Coconut Grove Riverside Resort & Stay")
                    .description("Luxury riverside stay surrounded by lush green palm trees and Godavari views.")
                    .category("Resort & Hotel")
                    .rating(4.8)
                    .distance("2.0 km")
                    .imageUrl("https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80")
                    .type("HOTEL")
                    .reasoning("Selected because: Top rated resort stay in Ravulapalem, 4.8 ★ Rating, eco-friendly river view")
                    .address("Gouthami River Bank Road, Ravulapalem")
                    .phone("+91 8855 299999")
                    .website("https://ravulapalemresorts.com")
                    .openingHours("24 Hours Open")
                    .googleMapsUrl("https://maps.google.com/?q=Ravulapalem+Resorts")
                    .build());

        } else if (queryLower.contains("visakhapatnam") || queryLower.contains("vizag")) {
            // Vizag Region Specials
            cards.add(RecommendationCard.builder()
                    .id(601L)
                    .title("RK Beach & INS Kursura Submarine Museum")
                    .description("Asia's first submarine museum preserved on Ramakrishna Beach shoreline.")
                    .category("Museum & Beach")
                    .rating(4.9)
                    .distance("1.0 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Iconic Vizag landmark, 4.9 ★ Rating, beachfront museum experience")
                    .address("RK Beach Road, Visakhapatnam")
                    .phone("+91 891 275 4111")
                    .website("https://vizagtourism.gov.in/kursura")
                    .googleMapsUrl("https://maps.google.com/?q=INS+Kursura+Submarine+Museum+Vizag")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(602L)
                    .title("Kailasagiri Hilltop Park & Ropeway")
                    .description("Hilltop park offering panoramic Bay of Bengal ocean views and giant Shiva Parvathi statue.")
                    .category("Hill View & Park")
                    .rating(4.8)
                    .distance("4.5 km")
                    .imageUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Top scenic hilltop view in Vizag, 4.8 ★ Rating, ropeway fun")
                    .address("Kailasagiri Hill, Visakhapatnam")
                    .phone("+91 891 255 3322")
                    .googleMapsUrl("https://maps.google.com/?q=Kailasagiri+Vizag")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(603L)
                    .title("Simhachalam Sri Varaha Lakshmi Narasimha Swamy Temple")
                    .description("Ancient 11th-century hilltop temple coated in sandalwood paste (Chandanotsavam).")
                    .category("Temple & Spiritual")
                    .rating(4.9)
                    .distance("12.0 km")
                    .imageUrl("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Major pilgrimage center in AP, 4.9 ★ Rating, hilltop spiritual vibe")
                    .address("Simhachalam Hill, Visakhapatnam")
                    .phone("+91 891 271 5233")
                    .googleMapsUrl("https://maps.google.com/?q=Simhachalam+Temple+Vizag")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(604L)
                    .title("Rushikonda Beach Water Sports")
                    .description("Blue Flag certified clean beach offering jet-ski, speed boat, and kayaking.")
                    .category("Water Sports")
                    .rating(4.7)
                    .distance("8.0 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Blue Flag certified beach with active water sports, 4.7 ★ Rating")
                    .address("Rushikonda Beach, Visakhapatnam")
                    .phone("+91 891 288 8999")
                    .googleMapsUrl("https://maps.google.com/?q=Rushikonda+Beach+Vizag")
                    .build());

        } else if (queryLower.contains("rajahmundry") || queryLower.contains("rajamahendravaram")) {
            // Rajahmundry Specials
            cards.add(RecommendationCard.builder()
                    .id(701L)
                    .title("Godavari Arch Bridge & Pushkar Ghat Walk")
                    .description("Asia's third longest bowstring girder arch bridge and holy river bathing ghats.")
                    .category("Bridge & River Ghat")
                    .rating(4.8)
                    .distance("1.5 km")
                    .imageUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Iconic Rajahmundry riverfront landmark, 4.8 ★ Rating")
                    .address("Pushkar Ghat, Rajamahendravaram")
                    .googleMapsUrl("https://maps.google.com/?q=Pushkar+Ghat+Rajahmundry")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(702L)
                    .title("Rajahmundry Iconic Rose Milk Center")
                    .description("Famous 70-year-old traditional Rose Milk parlor serving creamy chilled rose milk with almond gum.")
                    .category("Food Speciality")
                    .rating(4.9)
                    .distance("0.8 km")
                    .imageUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80")
                    .type("RESTAURANT")
                    .reasoning("Selected because: #1 Legendary Rose Milk in Andhra Pradesh, 4.9 ★ Rating")
                    .address("Main Road, Rajamahendravaram")
                    .googleMapsUrl("https://maps.google.com/?q=Rose+Milk+Center+Rajahmundry")
                    .build());

            cards.add(RecommendationCard.builder()
                    .id(703L)
                    .title("Sir Arthur Cotton Museum & Dowleswaram Barrage")
                    .description("Museum dedicated to irrigation pioneer Sir Arthur Cotton overlooking the massive barrage.")
                    .category("Museum & Heritage")
                    .rating(4.7)
                    .distance("6.0 km")
                    .imageUrl("https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80")
                    .type("ATTRACTION")
                    .reasoning("Selected because: Historical engineering marvel of Godavari, 4.7 ★ Rating")
                    .address("Dowleswaram, Rajamahendravaram")
                    .googleMapsUrl("https://maps.google.com/?q=Dowleswaram+Barrage+Rajahmundry")
                    .build());
        }

        return cards;
    }

    public List<ProposedActivity> getRegional10SlotItinerary(String locationQuery, boolean isRainy) {
        String queryLower = locationQuery.toLowerCase();
        List<ProposedActivity> activities = new ArrayList<>();

        if (queryLower.contains("ravulapalem") || queryLower.contains("konaseema") || queryLower.contains("vadapalli") || queryLower.contains("ryali")) {
            // Ravulapalem & Konaseema Customized 10-Slot Plan
            activities.add(ProposedActivity.builder()
                    .time("08:00 AM")
                    .name("Morning Arrival & Godavari Gouthami River Ghat Walk")
                    .type("ATTRACTION")
                    .activityId(501L)
                    .reasoning("Selected for refreshing morning breeze along Gautami Godavari river banks in Ravulapalem")
                    .address("Godavari Bund Road, Ravulapalem")
                    .phone("+91 8855 240001")
                    .openingHours("06:00 AM - 08:30 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Godavari+Ghat+Ravulapalem")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("08:45 AM")
                    .name("Ravulapalem Special Morning Tiffins (Pesara Dosa & Idli)")
                    .type("RESTAURANT")
                    .activityId(502L)
                    .reasoning("Selected for authentic Godavari tiffins, fresh chutney, and filter coffee")
                    .address("Main Market Junction, Ravulapalem")
                    .phone("+91 8855 240002")
                    .openingHours("07:00 AM - 11:00 AM")
                    .googleMapsUrl("https://maps.google.com/?q=Ravulapalem+Tiffins")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("09:30 AM")
                    .name("Visit Vadapalli Sri Venkateswara Swamy Temple")
                    .type("ATTRACTION")
                    .activityId(503L)
                    .reasoning("Selected because Vadapalli is the most sacred 7-Saturday Vratam temple near Ravulapalem (10 km)")
                    .address("Vadapalli Temple Street, Konaseema")
                    .phone("+91 883 2445566")
                    .openingHours("06:00 AM - 01:00 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Vadapalli+Venkateswara+Swamy+Temple")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("11:30 AM")
                    .name("Visit Ryali Jaganmohini Kesava Swamy Temple")
                    .type("ATTRACTION")
                    .activityId(504L)
                    .reasoning("Selected for unique Chola-era architecture where Lord Vishnu and Jaganmohini exist in one single idol")
                    .address("Ryali Village, Ravulapalem Zone")
                    .phone("+91 8855 273111")
                    .openingHours("06:00 AM - 12:00 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Ryali+Jaganmohini+Kesava+Swamy+Temple")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("01:30 PM")
                    .name("Authentic Konaseema Seafood & Veg Thali Lunch")
                    .type("RESTAURANT")
                    .activityId(505L)
                    .reasoning("Selected for authentic Godavari Fish Curry (Pulasa / Korrameenu), Prawns Iguru, & pure Veg Thali")
                    .address("Bypass Road, Ravulapalem")
                    .phone("+91 8855 242424")
                    .openingHours("12:00 PM - 03:30 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Konaseema+Dining+Ravulapalem")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("03:30 PM")
                    .name("Ravulapalem World-Famous Pootharekulu & Rose Milk Tasting")
                    .type("RESTAURANT")
                    .activityId(506L)
                    .reasoning("Selected to taste world-famous Ravulapalem Ghee Pootharekulu & chilled Rose Milk sweets")
                    .address("Main Bazaar, Ravulapalem")
                    .phone("+91 98480 12345")
                    .openingHours("08:00 AM - 10:30 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Ravulapalem+Pootharekulu")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("04:30 PM")
                    .name("Dindi & Pasarlapudi Coconut Island Backwaters Boat Cruise")
                    .type("EVENT")
                    .activityId(507L)
                    .reasoning("Selected for breathtaking Konaseema backwaters, green palm groves, and sunset boat ride")
                    .address("Dindi Jetty, Konaseema")
                    .phone("+91 99890 55443")
                    .openingHours("09:00 AM - 06:30 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Dindi+Resorts+Konaseema")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("06:30 PM")
            .name("Sunset View at Jonnada Godavari Bridge & Kova Tasting")
            .type("ATTRACTION")
            .activityId(508L)
            .reasoning("Selected for scenic sunset over Gautami Godavari river and famous Jonnada Milk Kova")
            .address("Jonnada Bridge, Ravulapalem")
            .phone("+91 8855 299100")
            .openingHours("05:00 PM - 08:30 PM")
            .googleMapsUrl("https://maps.google.com/?q=Jonnada+Bridge+Ravulapalem")
            .build());

            activities.add(ProposedActivity.builder()
                    .time("08:00 PM")
                    .name("Godavari Fine Dining Evening Dinner")
                    .type("RESTAURANT")
                    .activityId(509L)
                    .reasoning("Selected for relaxed evening ambiance, fresh regional dishes, and high hygiene standard")
                    .address("Gouthami Boulevard, Ravulapalem")
                    .phone("+91 8855 249999")
                    .openingHours("07:00 PM - 11:00 PM")
                    .googleMapsUrl("https://maps.google.com/?q=Ravulapalem+Fine+Dining")
                    .build());

            activities.add(ProposedActivity.builder()
                    .time("10:00 PM")
                    .name("Return to Ravulapalem Coconut Grove Resort & Stay")
                    .type("HOTEL")
                    .activityId(510L)
                    .reasoning("Selected for comfortable overnight rest by the peaceful riverbank")
                    .address("Gouthami River Bank, Ravulapalem")
                    .phone("+91 8855 299999")
                    .openingHours("24 Hours Open")
                    .googleMapsUrl("https://maps.google.com/?q=Ravulapalem+Resort")
                    .build());
        }

        return activities;
    }
}
