package com.example.PAF.SB;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.example.PAF.SB", 
    "com.example.PAF.SB.controller", 
    "com.example.PAF.SB.service", 
    "com.example.PAF.SB.repository",
    "com.example.PAF.config"  // Make sure this line is included
})
public class PafSbApplication {

    public static void main(String[] args) {
        SpringApplication.run(PafSbApplication.class, args);
    }
}