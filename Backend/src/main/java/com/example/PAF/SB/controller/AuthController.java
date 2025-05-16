package com.example.PAF.SB.controller;

import com.example.PAF.SB.models.User;
import com.example.PAF.SB.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    // Simple test endpoint to check if API is accessible
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Auth API is working!");
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            // Debug logs
            System.out.println("=== REGISTER REQUEST RECEIVED ===");
            System.out.println("First Name: " + user.getFirstName());
            System.out.println("Last Name: " + user.getLastName());
            System.out.println("Email: " + user.getEmail());
            
            User registeredUser = userService.registerUser(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", registeredUser.getId());
            response.put("firstName", registeredUser.getFirstName());
            response.put("lastName", registeredUser.getLastName());
            response.put("email", registeredUser.getEmail());
            
            System.out.println("=== REGISTER SUCCESS ===");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            System.out.println("=== REGISTER ERROR ===");
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            System.out.println("=== LOGIN REQUEST RECEIVED ===");
            System.out.println("Email: " + loginRequest.get("email"));
            
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            
            User user = userService.loginUser(email, password);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            
            System.out.println("=== LOGIN SUCCESS ===");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("=== LOGIN ERROR ===");
            System.out.println("Error message: " + e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
    }
    
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            User user = userService.getUserById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }
    }
}