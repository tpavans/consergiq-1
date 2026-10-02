package com.conciergeiq.agent;

import com.conciergeiq.entity.PreferenceProfile;
import com.conciergeiq.entity.User;
import com.conciergeiq.repository.PreferenceProfileRepository;
import com.conciergeiq.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MemoryAgent {

    @Autowired
    private PreferenceProfileRepository preferenceProfileRepository;

    @Autowired
    private UserRepository userRepository;

    public void execute(AgentState state) {
        if (state.getUserId() == null) return;

        state.addLog("MemoryAgent", "Loading user memory profile and previous travel preferences...");

        User user = userRepository.findById(state.getUserId()).orElse(null);
        if (user != null) {
            PreferenceProfile profile = preferenceProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile != null) {
                state.addLog("MemoryAgent", String.format(
                    "Memory Retrieved - Travel Style: %s, Budget Tier: %s, Mobility: %s, Food Preferences: %s",
                    profile.getTravelStyle(), profile.getBudgetTier(), profile.getMobilityLevel(), profile.getFoodPreferences()
                ));
            }
        }
    }
}
