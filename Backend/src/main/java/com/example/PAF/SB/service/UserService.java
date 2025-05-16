package com.example.PAF.SB.service;

import com.example.PAF.SB.repository.UserRepository;
import com.example.PAF.SB.models.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User registerUser(User user) {
        // Debug log
        System.out.println("Registering user: " + user.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        
        // In a real application, you should encrypt the password
        // For simplicity, we're storing it as plain text here
        return userRepository.save(user);
    }
    
    public User loginUser(String email, String password) {
        // Debug log
        System.out.println("Logging in user: " + email);
        
        Optional<User> user = userRepository.findByEmail(email);
        
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user.get();
        } else {
            throw new RuntimeException("Invalid email or password");
        }
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}