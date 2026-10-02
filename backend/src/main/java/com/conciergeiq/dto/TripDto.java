package com.conciergeiq.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripDto {
    private Long id;
    private String title;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budgetLimit;
    private BigDecimal budgetSpent;
    private String status;
    private String travelDistance;
    private String travelTime;
    private String googleMapsRoute;
    private String polylineCoordinates;
    private List<ScheduleDto> schedules;
}
