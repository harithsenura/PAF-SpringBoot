package com.example.PAF.SB.controller;

import com.example.PAF.SB.models.Notification;
import com.example.PAF.SB.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             allowCredentials = "true", 
             allowedHeaders = "*",
             exposedHeaders = "*",
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        System.out.println("GET /api/notifications/user/" + userId + " - Getting notifications for user");
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String userId) {
        System.out.println("GET /api/notifications/user/" + userId + "/unread - Getting unread notifications for user");
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        System.out.println("GET /api/notifications/user/" + userId + "/count - Getting unread notification count for user");
        long count = notificationService.countUnreadNotifications(userId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        System.out.println("PUT /api/notifications/" + id + "/read - Marking notification as read");
        Notification notification = notificationService.markAsRead(id);
        if (notification != null) {
            return ResponseEntity.ok(notification);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        System.out.println("PUT /api/notifications/user/" + userId + "/read-all - Marking all notifications as read");
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}