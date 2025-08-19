package com.fleetops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * FleetOps Backend Application
 * A modular logistics management platform built on Spring Boot 3.5.x
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class FleetOpsApplication {

    public static void main(String[] args) {
        SpringApplication.run(FleetOpsApplication.class, args);
    }
}
