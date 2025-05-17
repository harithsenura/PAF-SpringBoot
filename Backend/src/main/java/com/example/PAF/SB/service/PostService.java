package com.example.PAF.SB.service;

import com.example.PAF.SB.models.Post;
import com.example.PAF.SB.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    // Get all posts
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByTimestampDesc();
    }
    
    // Get posts by user ID
    public List<Post> getUserPosts(String userId) {
        return postRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    // Get posts by category
    public List<Post> getPostsByCategory(String category) {
        if ("all".equals(category)) {
            return getAllPosts();
        }
        return postRepository.findByCategoryOrderByTimestampDesc(category);
    }
    
    // Create a new post
    public Post createPost(Post post) {
        // Set timestamp if not already set
        if (post.getTimestamp() == null) {
            post.setTimestamp(LocalDateTime.now());
        }
        
        // Initialize collections if they're null
        if (post.getComments() == null) {
            post.setComments(List.of());
        }
        
        if (post.getLikedBy() == null) {
            post.setLikedBy(java.util.Collections.emptySet());
        }
        
        // Set likes count to 0 for new posts
        post.setLikes(0);
        
        // Log the post being created
        System.out.println("Creating post: " + post.getText());
        System.out.println("Post category: " + post.getCategory());
        
        return postRepository.save(post);
    }
    
    // Update an existing post
    public Post updatePost(Post post) {
        Optional<Post> existingPost = postRepository.findById(post.getId());
        
        if (existingPost.isPresent()) {
            // Preserve the original timestamp, likes, and comments
            Post original = existingPost.get();
            
            // Only update fields that should be editable
            post.setTimestamp(original.getTimestamp());
            post.setLikes(original.getLikes());
            post.setLikedBy(original.getLikedBy());
            post.setComments(original.getComments());
            
            return postRepository.save(post);
        }
        
        return null;
    }
    
    // Delete a post
    public boolean deletePost(String id) {
        Optional<Post> post = postRepository.findById(id);
        
        if (post.isPresent()) {
            postRepository.deleteById(id);
            return true;
        }
        
        return false;
    }
    
    // Like a post
    public Post likePost(String postId, String userId) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            
            // Check if user already liked the post
            if (post.isLikedByUser(userId)) {
                // Unlike the post
                post.removeLike(userId);
            } else {
                // Like the post
                post.addLike(userId);
            }
            
            return postRepository.save(post);
        }
        
        return null;
    }
    
    // Add a comment to a post
    public Post addComment(String postId, Post.Comment comment) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            
            // Generate a unique ID for the comment
            comment.setId(UUID.randomUUID().toString());
            
            // Set timestamp if not already set
            if (comment.getTimestamp() == null) {
                comment.setTimestamp(LocalDateTime.now());
            }
            
            // Initialize replies list if it's null
            if (comment.getReplies() == null) {
                comment.setReplies(List.of());
            }
            
            // Add the comment to the post
            post.getComments().add(comment);
            
            return postRepository.save(post);
        }
        
        return null;
    }
    
    // Update a comment
    public Post updateComment(String postId, String commentId, String userId, String text) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            
            // Find the comment
            for (int i = 0; i < post.getComments().size(); i++) {
                Post.Comment comment = post.getComments().get(i);
                
                if (comment.getId().equals(commentId)) {
                    // Check if the user is the author of the comment
                    if (comment.getUserId().equals(userId)) {
                        // Update the comment text
                        comment.setText(text);
                        
                        // Save the updated post
                        return postRepository.save(post);
                    } else {
                        // User is not authorized to update this comment
                        return null;
                    }
                }
            }
        }
        
        return null;
    }
    
    // Delete a comment
    public Post deleteComment(String postId, String commentId, String userId) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            
            // Find the comment
            for (int i = 0; i < post.getComments().size(); i++) {
                Post.Comment comment = post.getComments().get(i);
                
                if (comment.getId().equals(commentId)) {
                    // Check if the user is the author of the comment or the post
                    if (comment.getUserId().equals(userId) || post.getUserId().equals(userId)) {
                        // Remove the comment
                        post.getComments().remove(i);
                        
                        // Save the updated post
                        return postRepository.save(post);
                    } else {
                        // User is not authorized to delete this comment
                        return null;
                    }
                }
            }
        }
        
        return null;
    }
    
    // Add a reply to a comment
    public Post addReplyToComment(String postId, String commentId, Post.Reply reply) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            
            // Find the comment
            for (Post.Comment comment : post.getComments()) {
                if (comment.getId().equals(commentId)) {
                    // Generate a unique ID for the reply
                    reply.setId(UUID.randomUUID().toString());
                    
                    // Set timestamp if not already set
                    if (reply.getTimestamp() == null) {
                        reply.setTimestamp(LocalDateTime.now());
                    }
                    
                    // Add the reply to the comment
                    comment.getReplies().add(reply);
                    
                    // Save the updated post
                    return postRepository.save(post);
                }
            }
        }
        
        return null;
    }
    
    // Update a reply
    public Post updateReply(String postId, String commentId, String replyId, String userId, String text) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            
            // Find the comment
            for (Post.Comment comment : post.getComments()) {
                if (comment.getId().equals(commentId)) {
                    // Find the reply
                    for (int i = 0; i < comment.getReplies().size(); i++) {
                        Post.Reply reply = comment.getReplies().get(i);
                        
                        if (reply.getId().equals(replyId)) {
                            // Check if the user is the author of the reply
                            if (reply.getUserId().equals(userId)) {
                                // Update the reply text
                                reply.setText(text);
                                
                                // Save the updated post
                                return postRepository.save(post);
                            } else {
                                // User is not authorized to update this reply
                                return null;
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // Delete a reply
    public Post deleteReply(String postId, String commentId, String replyId, String userId) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            
            // Find the comment
            for (Post.Comment comment : post.getComments()) {
                if (comment.getId().equals(commentId)) {
                    // Find the reply
                    for (int i = 0; i < comment.getReplies().size(); i++) {
                        Post.Reply reply = comment.getReplies().get(i);
                        
                        if (reply.getId().equals(replyId)) {
                            // Check if the user is the author of the reply, comment, or post
                            if (reply.getUserId().equals(userId) || comment.getUserId().equals(userId) || post.getUserId().equals(userId)) {
                                // Remove the reply
                                comment.getReplies().remove(i);
                                
                                // Save the updated post
                                return postRepository.save(post);
                            } else {
                                // User is not authorized to delete this reply
                                return null;
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // Get a post by ID
    public Post getPostById(String id) {
        Optional<Post> post = postRepository.findById(id);
        return post.orElse(null);
    }
}
