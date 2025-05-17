package com.example.PAF.SB.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    private String userId;         // Recipient user ID
    private String senderId;       // User who triggered the notification
    private String senderName;     // Name of the user who triggered the notification
    private String senderAvatar;   // Avatar of the user who triggered the notification
    private String postId;         // Related post ID
    private String commentId;      // Related comment ID (optional)
    private String replyId;        // Related reply ID (optional)
    private String type;           // Type of notification: LIKE, COMMENT, REPLY
    private String content;        // Content of the notification
    private LocalDateTime timestamp;
    private boolean read;          // Whether the notification has been read
    
    // Constructors
    public Notification() {
        this.timestamp = LocalDateTime.now();
        this.read = false;
    }
    
    public Notification(String userId, String senderId, String senderName, String senderAvatar, 
                        String postId, String type, String content) {
        this.userId = userId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAvatar = senderAvatar;
        this.postId = postId;
        this.type = type;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.read = false;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getSenderId() {
        return senderId;
    }
    
    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }
    
    public String getSenderName() {
        return senderName;
    }
    
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
    
    public String getSenderAvatar() {
        return senderAvatar;
    }
    
    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }
    
    public String getPostId() {
        return postId;
    }
    
    public void setPostId(String postId) {
        this.postId = postId;
    }
    
    public String getCommentId() {
        return commentId;
    }
    
    public void setCommentId(String commentId) {
        this.commentId = commentId;
    }
    
    public String getReplyId() {
        return replyId;
    }
    
    public void setReplyId(String replyId) {
        this.replyId = replyId;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public boolean isRead() {
        return read;
    }
    
    public void setRead(boolean read) {
        this.read = read;
    }
    
    // Helper method to create notification types
    public static class Type {
        public static final String LIKE = "LIKE";
        public static final String COMMENT = "COMMENT";
        public static final String REPLY = "REPLY";
    }
}