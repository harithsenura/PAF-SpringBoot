package com.example.PAF.SB.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document(collection = "posts")
public class Post {
    
    @Id
    private String id;
    private String userId;
    private String text;
    private String media;
    private String mediaType;
    private String category; // Category field එකතු කිරීම
    private int likes;
    private Set<String> likedBy; // පරිශීලකයන් like කළ අය track කිරීමට
    private List<Comment> comments;
    private LocalDateTime timestamp;
    private UserInfo user;

    public Post() {
        this.comments = new ArrayList<>();
        this.likedBy = new HashSet<>(); // HashSet භාවිතා කරන්නේ duplicate entries වළක්වා ගැනීමට
        this.timestamp = LocalDateTime.now();
    }

    // Nested Comment class
    public static class Comment {
        private String id;
        private String userId;
        private String text;
        private LocalDateTime timestamp;
        private UserInfo user;
        private List<Reply> replies; // Add replies list

        public Comment() {
            this.timestamp = LocalDateTime.now();
            this.replies = new ArrayList<>(); // Initialize replies list
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

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public UserInfo getUser() {
            return user;
        }

        public void setUser(UserInfo user) {
            this.user = user;
        }
        
        public List<Reply> getReplies() {
            return replies;
        }
        
        public void setReplies(List<Reply> replies) {
            this.replies = replies;
        }
    }
    
    // Nested Reply class
    public static class Reply {
        private String id;
        private String userId;
        private String text;
        private LocalDateTime timestamp;
        private UserInfo user;
        
        public Reply() {
            this.timestamp = LocalDateTime.now();
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
        
        public String getText() {
            return text;
        }
        
        public void setText(String text) {
            this.text = text;
        }
        
        public LocalDateTime getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
        
        public UserInfo getUser() {
            return user;
        }
        
        public void setUser(UserInfo user) {
            this.user = user;
        }
    }

    // Nested UserInfo class to store user details with post
    public static class UserInfo {
        private String name;
        private String avatar;

        public UserInfo() {
        }

        public UserInfo(String name, String avatar) {
            this.name = name;
            this.avatar = avatar;
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getAvatar() {
            return avatar;
        }

        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }
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

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getMedia() {
        return media;
    }

    public void setMedia(String media) {
        this.media = media;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }
    
    // Category getter and setter
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public Set<String> getLikedBy() {
        return likedBy;
    }

    public void setLikedBy(Set<String> likedBy) {
        this.likedBy = likedBy;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public UserInfo getUser() {
        return user;
    }

    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    // Helper method to check if a user has already liked this post
    public boolean isLikedByUser(String userId) {
        return likedBy != null && likedBy.contains(userId);
    }
    
    // Helper method to add a like from a user
    public boolean addLike(String userId) {
        if (likedBy == null) {
            likedBy = new HashSet<>();
        }
        
        // If user hasn't liked the post yet
        if (!likedBy.contains(userId)) {
            likedBy.add(userId);
            likes = likedBy.size(); // Update likes count
            return true;
        }
        
        return false;
    }
    
    // Helper method to remove a like from a user
    public boolean removeLike(String userId) {
        if (likedBy != null && likedBy.contains(userId)) {
            likedBy.remove(userId);
            likes = likedBy.size(); // Update likes count
            return true;
        }
        
        return false;
    }
}
