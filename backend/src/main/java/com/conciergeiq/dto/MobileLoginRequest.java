package com.conciergeiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MobileLoginRequest {
    @NotBlank
    private String phone;
    
    private String otp;
}
