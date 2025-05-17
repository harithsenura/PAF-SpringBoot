package com.example.PAF.SB.service;

import com.example.PAF.SB.models.Notification;
import com.example.PAF.SB.models.Post;
import com.example.PAF.SB.models.User;
import com.example.PAF.SB.repository.NotificationRepository;
import com.example.PAF.SB.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // Get all notifications for a user
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    // Get unread notifications for a user
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadOrderByTimestampDesc(userId, false);
    }
    
    // Count unread notifications for a user
    public long countUnreadNotifications(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }
    
    // Mark notification as read
    public Notification markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }
    
    // Mark all notifications as read for a user
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadOrderByTimestampDesc(userId, false);
        for (Notification notification : notifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        
        // Send update to WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, countUnreadNotifications(userId));
    }
    
    // Create a notification for a like
    public void createLikeNotification(Post post, String likerId) {
        // Don't notify if user likes their own post
        if (post.getUserId().equals(likerId)) {
            return;
        }
        
        Optional<User> likerOpt = userRepository.findById(likerId);
        if (likerOpt.isPresent()) {
            User liker = likerOpt.get();
            String likerName = liker.getFirstName() + " " + liker.getLastName();
            String likerAvatar = liker.getAvatar() != null ? liker.getAvatar() : "/placeholder.svg";
            
            Notification notification = new Notification(
                post.getUserId(),
                likerId,
                likerName,
                likerAvatar,
                post.getId(),
                Notification.Type.LIKE,
                likerName + " liked your post"
            );
            
            Notification savedNotification = notificationRepository.save(notification);
            
            // Send notification to WebSocket
            messagingTemplate.convertAndSend("/topic/notifications/" + post.getUserId(), savedNotification);
            
            // Send count update
            long count = countUnreadNotifications(post.getUserId());
            messagingTemplate.convertAndSend("/topic/notifications/count/" + post.getUserId(), count);
        }
    }
    
    // Create a notification for a comment
    public void createCommentNotification(Post post, Post.Comment comment) {
        // Don't notify if user comments on their own post
        if (post.getUserId().equals(comment.getUserId())) {
            return;
        }
        
        Optional<User> commenterOpt = userRepository.findById(comment.getUserId());
        if (commenterOpt.isPresent()) {
            User commenter = commenterOpt.get();
            String commenterName = commenter.getFirstName() + " " + commenter.getLastName();
            String commenterAvatar = commenter.getAvatar() != null ? commenter.getAvatar() : "/placeholder.svg";
            
            Notification notification = new Notification(
                post.getUserId(),
                comment.getUserId(),
                commenterName,
                commenterAvatar,
                post.getId(),
                Notification.Type.COMMENT,
                commenterName + " commented on your post"
            );
            
            notification.setCommentId(comment.getId());
            Notification savedNotification = notificationRepository.save(notification);
            
            // Send notification to WebSocket
            messagingTemplate.convertAndSend("/topic/notifications/" + post.getUserId(), savedNotification);
            
            // Send count update
            long count = countUnreadNotifications(post.getUserId());
            messagingTemplate.convertAndSend("/topic/notifications/count/" + post.getUserId(), count);
        }
    }
    
    // Create a notification for a reply
    public void createReplyNotification(Post post, Post.Comment comment, Post.Reply reply) {
        // Don't notify if user replies to their own comment
        if (comment.getUserId().equals(reply.getUserId())) {
            return;
        }
        
        Optional<User> replierOpt = userRepository.findById(reply.getUserId());
        if (replierOpt.isPresent()) {
            User replier = replierOpt.get();
            String replierName = replier.getFirstName() + " " + replier.getLastName();
            String replierAvatar = replier.getAvatar() != null ? replier.getAvatar() : "/placeholder.svg";
            
            Notification notification = new Notification(
                comment.getUserId(),
                reply.getUserId(),
                replierName,
                replierAvatar,
                post.getId(),
                Notification.Type.REPLY,
                replierName + " replied to your comment"
            );
            
            notification.setCommentId(comment.getId());
            notification.setReplyId(reply.getId());
            Notification savedNotification = notificationRepository.save(notification);
            
            // Send notification to WebSocket
            messagingTemplate.convertAndSend("/topic/notifications/" + comment.getUserId(), savedNotification);
            
            // Send count update
            long count = countUnreadNotifications(comment.getUserId());
            messagingTemplate.convertAndSend("/topic/notifications/count/" + comment.getUserId(), count);
        }
    }
}