package com.example.PAF.SB.repository;

import com.example.PAF.SB.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    // Find notifications for a specific user
    List<Notification> findByUserIdOrderByTimestampDesc(String userId);
    
    // Find unread notifications for a specific user
    List<Notification> findByUserIdAndReadOrderByTimestampDesc(String userId, boolean read);
    
    // Count unread notifications for a specific user
    long countByUserIdAndRead(String userId, boolean read);
}