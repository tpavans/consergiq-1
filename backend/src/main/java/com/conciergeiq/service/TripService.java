package com.conciergeiq.service;

import com.conciergeiq.dto.ScheduleDto;
import com.conciergeiq.dto.TripDto;
import com.conciergeiq.entity.Schedule;
import com.conciergeiq.entity.Trip;
import com.conciergeiq.entity.User;
import com.conciergeiq.exception.ResourceNotFoundException;
import com.conciergeiq.repository.ScheduleRepository;
import com.conciergeiq.repository.TripRepository;
import com.conciergeiq.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TripDto> getTripsByUser(Long userId) {
        return tripRepository.findByUserId(userId).stream()
                .map(this::mapToTripDto)
                .sorted((t1, t2) -> t2.getId().compareTo(t1.getId()))
                .collect(Collectors.toList());
    }

    public TripDto getTripById(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        if (!trip.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to access this trip.");
        }
        return mapToTripDto(trip);
    }

    @Transactional
    public TripDto createTrip(TripDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String status = dto.getStatus() != null ? dto.getStatus() : "ACTIVE";

        if ("ACTIVE".equalsIgnoreCase(status)) {
            List<Trip> activeTrips = tripRepository.findByUserId(userId);
            for (Trip t : activeTrips) {
                if ("ACTIVE".equalsIgnoreCase(t.getStatus())) {
                    t.setStatus("ARCHIVED");
                    tripRepository.save(t);
                }
            }
        }

        Trip trip = Trip.builder()
                .user(user)
                .title(dto.getTitle())
                .destination(dto.getDestination())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .budgetLimit(dto.getBudgetLimit() != null ? dto.getBudgetLimit() : BigDecimal.ZERO)
                .budgetSpent(BigDecimal.ZERO)
                .status(status)
                .travelDistance(dto.getTravelDistance())
                .travelTime(dto.getTravelTime())
                .googleMapsRoute(dto.getGoogleMapsRoute())
                .polylineCoordinates(dto.getPolylineCoordinates())
                .build();

        Trip saved = tripRepository.save(trip);
        return mapToTripDto(saved);
    }

    @Transactional
    public TripDto updateTrip(Long tripId, TripDto dto, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
        if (!trip.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        trip.setTitle(dto.getTitle());
        trip.setDestination(dto.getDestination());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
        if (dto.getBudgetLimit() != null) {
            trip.setBudgetLimit(dto.getBudgetLimit());
        }

        if (dto.getStatus() != null) {
            if ("ACTIVE".equalsIgnoreCase(dto.getStatus()) && !"ACTIVE".equalsIgnoreCase(trip.getStatus())) {
                List<Trip> activeTrips = tripRepository.findByUserId(userId);
                for (Trip t : activeTrips) {
                    if ("ACTIVE".equalsIgnoreCase(t.getStatus()) && !t.getId().equals(tripId)) {
                        t.setStatus("ARCHIVED");
                        tripRepository.save(t);
                    }
                }
            }
            trip.setStatus(dto.getStatus());
        }

        if (dto.getTravelDistance() != null) {
            trip.setTravelDistance(dto.getTravelDistance());
        }
        if (dto.getTravelTime() != null) {
            trip.setTravelTime(dto.getTravelTime());
        }
        if (dto.getGoogleMapsRoute() != null) {
            trip.setGoogleMapsRoute(dto.getGoogleMapsRoute());
        }
        if (dto.getPolylineCoordinates() != null) {
            trip.setPolylineCoordinates(dto.getPolylineCoordinates());
        }

        Trip saved = tripRepository.save(trip);
        return mapToTripDto(saved);
    }

    @Transactional
    public void deleteTrip(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
        if (!trip.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        tripRepository.delete(trip);
    }

    @Transactional
    public ScheduleDto addScheduleItem(Long tripId, ScheduleDto dto, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
        if (!trip.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        Schedule schedule = Schedule.builder()
                .trip(trip)
                .dayNumber(dto.getDayNumber())
                .scheduledTime(dto.getScheduledTime())
                .activityName(dto.getActivityName())
                .activityType(dto.getActivityType())
                .activityId(dto.getActivityId())
                .status("PLANNED")
                .build();

        Schedule saved = scheduleRepository.save(schedule);
        return mapToScheduleDto(saved);
    }

    @Transactional
    public void removeScheduleItem(Long tripId, Long scheduleId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
        if (!trip.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + scheduleId));
        
        if (!schedule.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Schedule item does not belong to this trip");
        }

        scheduleRepository.delete(schedule);
    }

    @Transactional
    public ScheduleDto updateScheduleStatus(Long tripId, Long scheduleId, String status, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
        if (!trip.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + scheduleId));

        if (!schedule.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Schedule item does not belong to this trip");
        }

        schedule.setStatus(status);
        Schedule saved = scheduleRepository.save(schedule);
        return mapToScheduleDto(saved);
    }

    private TripDto mapToTripDto(Trip trip) {
        List<ScheduleDto> schedules = scheduleRepository.findByTripIdOrderByDayNumberAscScheduledTimeAsc(trip.getId())
                .stream()
                .map(this::mapToScheduleDto)
                .collect(Collectors.toList());

        return new TripDto(
                trip.getId(),
                trip.getTitle(),
                trip.getDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudgetLimit(),
                trip.getBudgetSpent(),
                trip.getStatus(),
                trip.getTravelDistance(),
                trip.getTravelTime(),
                trip.getGoogleMapsRoute(),
                trip.getPolylineCoordinates(),
                schedules
        );
    }

    private ScheduleDto mapToScheduleDto(Schedule s) {
        return new ScheduleDto(
                s.getId(),
                s.getDayNumber(),
                s.getScheduledTime(),
                s.getActivityName(),
                s.getActivityType(),
                s.getActivityId(),
                s.getStatus()
        );
    }
}
