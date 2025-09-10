package com.fleetops.geo.controller;

import com.fleetops.geo.dto.PlaceRequest;
import com.fleetops.geo.dto.PlaceResponse;
import com.fleetops.geo.entity.Place.PlaceType;
import com.fleetops.geo.service.PlaceService;
import com.fleetops.geo.config.TestSecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@WebMvcTest(PlaceController.class)
@Import(TestSecurityConfig.class)
class PlaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlaceService placeService;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID organizationId;
    private UUID placeId;
    private PlaceRequest placeRequest;
    private PlaceResponse placeResponse;

    @BeforeEach
    void setUp() {
        organizationId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
        placeId = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");

        placeRequest = new PlaceRequest();
        placeRequest.setName("Test Warehouse");
        placeRequest.setType(PlaceType.WAREHOUSE);
        placeRequest.setLatitude(40.7128);
        placeRequest.setLongitude(-74.0060);
        placeRequest.setAddress("123 Test St");
        placeRequest.setAddressLine1("123 Test St");
        placeRequest.setCity("New York");
        placeRequest.setState("NY");
        placeRequest.setCountry("USA");
        placeRequest.setPostalCode("10001");
        placeRequest.setOrganizationId(organizationId);

        placeResponse = new PlaceResponse();
        placeResponse.setId(placeId);
        placeResponse.setName("Test Warehouse");
        placeResponse.setType(PlaceType.WAREHOUSE);
        placeResponse.setAddress("123 Test St");
        placeResponse.setAddressLine1("123 Test St");
        placeResponse.setCity("New York");
        placeResponse.setState("NY");
        placeResponse.setCountry("USA");
        placeResponse.setPostalCode("10001");
        placeResponse.setOrganizationId(organizationId);
        placeResponse.setCreatedAt(LocalDateTime.now());
        placeResponse.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createPlace_ShouldReturnCreatedPlace() throws Exception {
        // Given
        when(placeService.createPlace(any(PlaceRequest.class))).thenReturn(placeResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/places")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(placeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(placeId.toString()))
                .andExpect(jsonPath("$.name").value("Test Warehouse"))
                .andExpect(jsonPath("$.type").value("WAREHOUSE"));

        verify(placeService).createPlace(any(PlaceRequest.class));
    }

    @Test
    void getPlace_ShouldReturnPlace() throws Exception {
        // Given
        when(placeService.getPlace(placeId)).thenReturn(placeResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/places/{id}", placeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(placeId.toString()))
                .andExpect(jsonPath("$.name").value("Test Warehouse"))
                .andExpect(jsonPath("$.type").value("WAREHOUSE"));

        verify(placeService).getPlace(placeId);
    }

    @Test
    void getPlaces_ShouldReturnPagedPlaces() throws Exception {
        // Given
        List<PlaceResponse> places = Arrays.asList(placeResponse);
        Page<PlaceResponse> placePage = new PageImpl<>(places, PageRequest.of(0, 20), 1);
        when(placeService.getPlaces(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(placePage);

        // When & Then
        mockMvc.perform(get("/api/v1/places")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Test Warehouse"))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(placeService).getPlaces(any(), any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    void updatePlace_ShouldReturnUpdatedPlace() throws Exception {
        // Given
        placeRequest.setName("Updated Warehouse");
        placeResponse.setName("Updated Warehouse");
        when(placeService.updatePlace(eq(placeId), any(PlaceRequest.class))).thenReturn(placeResponse);

        // When & Then
        mockMvc.perform(put("/api/v1/places/{id}", placeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(placeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(placeId.toString()))
                .andExpect(jsonPath("$.name").value("Updated Warehouse"));

        verify(placeService).updatePlace(eq(placeId), any(PlaceRequest.class));
    }

    @Test
    void deletePlace_ShouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(placeService).deletePlace(placeId);

        // When & Then
        mockMvc.perform(delete("/api/v1/places/{id}", placeId))
                .andExpect(status().isNoContent());

        verify(placeService).deletePlace(placeId);
    }

    @Test
    void findNearbyPlaces_ShouldReturnNearbyPlaces() throws Exception {
        // Given
        List<PlaceResponse> nearbyPlaces = Arrays.asList(placeResponse);
        when(placeService.findNearbyPlaces(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(nearbyPlaces);

        // When & Then
        mockMvc.perform(get("/api/v1/places/nearby")
                .param("latitude", "40.7128")
                .param("longitude", "-74.0060")
                .param("radius", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test Warehouse"));

        verify(placeService).findNearbyPlaces(40.7128, -74.0060, 10.0);
    }

    @Test
    void createPlace_ShouldReturnBadRequest_WhenInvalidData() throws Exception {
        // Given
        placeRequest.setName(""); // Invalid name
        placeRequest.setLatitude(null); // Invalid latitude

        // When & Then
        mockMvc.perform(post("/api/v1/places")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(placeRequest)))
                .andExpect(status().isBadRequest());

        verify(placeService, never()).createPlace(any(PlaceRequest.class));
    }
}