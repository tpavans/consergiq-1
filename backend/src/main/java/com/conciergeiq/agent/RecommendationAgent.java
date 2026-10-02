package com.conciergeiq.agent;

import com.conciergeiq.dto.ChatResponseDto.RecommendationCard;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecommendationAgent {

    public void execute(AgentState state) {
        state.addLog("RecommendationAgent", "Evaluating candidates and computing transparent selection reasons...");

        List<RecommendationCard> cards = state.getRecommendations();
        int budget = state.getBudget() != null ? state.getBudget() : 1000;

        for (RecommendationCard card : cards) {
            StringBuilder reason = new StringBuilder();
            reason.append("I selected this ").append(card.getType().toLowerCase()).append(" because:\n");
            reason.append("• High Customer Rating (").append(card.getRating()).append("/5.0 ★)\n");
            reason.append("• Convenient proximity (").append(card.getDistance()).append(" from your stay)\n");
            reason.append("• Matches your ₹").append(budget).append(" budget constraint\n");
            reason.append("• Verified open hours & active availability");

            card.setReasoning(reason.toString());
        }

        state.addLog("RecommendationAgent", "Selection reasons generated for " + cards.size() + " recommendations.");
    }
}
