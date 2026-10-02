package com.conciergeiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank
    private String email;

    private String name;

    private String googleToken;
}
