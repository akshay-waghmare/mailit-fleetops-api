package com.fleetops.geo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetops.geo.dto.PlaceRequest;
import com.fleetops.geo.entity.Place.PlaceType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class PlaceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetPlaces() throws Exception {
        mockMvc.perform(get("/api/v1/places"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testCreatePlace() throws Exception {
        PlaceRequest request = new PlaceRequest();
        request.setOrganizationId(UUID.randomUUID());
        request.setName("Test Location");
        request.setType(PlaceType.WAREHOUSE);
        request.setLatitude(40.7128);
        request.setLongitude(-74.0060);
        request.setAddress("123 Test Street");
        request.setCity("New York");
        request.setState("NY");
        request.setCountry("USA");
        request.setPostalCode("10001");

        mockMvc.perform(post("/api/v1/places")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Location"))
                .andExpect(jsonPath("$.type").value("WAREHOUSE"));
    }

    @Test
    public void testValidationError() throws Exception {
        PlaceRequest request = new PlaceRequest();
        // Missing required fields to trigger validation error

        mockMvc.perform(post("/api/v1/places")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // Skip spatial tests in H2 environment
    // @Test
    // public void testFindNearbyPlaces() throws Exception {
    //     mockMvc.perform(get("/api/v1/places/nearby")
    //                     .param("latitude", "40.7128")
    //                     .param("longitude", "-74.0060")
    //                     .param("radiusKm", "10.0"))
    //             .andExpect(status().isOk())
    //             .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    // }
}
