package com.example.PAF.SB.controller;

import com.example.PAF.SB.models.Post;
import com.example.PAF.SB.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, 
             allowCredentials = "true", 
             allowedHeaders = "*",
             exposedHeaders = "*",
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        System.out.println("GET /api/posts - Received request for all posts");
        List<Post> posts = postService.getAllPosts();
        System.out.println("Returning " + posts.size() + " posts");
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getUserPosts(@PathVariable String userId) {
        System.out.println("GET /api/posts/user/" + userId + " - Received request for user posts");
        List<Post> posts = postService.getUserPosts(userId);
        System.out.println("Returning " + posts.size() + " posts for user ID: " + userId);
        return ResponseEntity.ok(posts);
    }
    
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        System.out.println("POST /api/posts - Creating post for user ID: " + post.getUserId());
        System.out.println("Post content: " + post.getText());
        System.out.println("Post category: " + post.getCategory()); // Category log කිරීම
        
        Post createdPost = postService.createPost(post);
        System.out.println("Post created with ID: " + createdPost.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post post) {
        System.out.println("PUT /api/posts/" + id + " - Updating post");
        
        if (!id.equals(post.getId())) {
            System.out.println("Path ID and post ID do not match");
            return ResponseEntity.badRequest().build();
        }
        
        Post updatedPost = postService.updatePost(post);
        if (updatedPost != null) {
            System.out.println("Post updated successfully");
            return ResponseEntity.ok(updatedPost);
        }
        
        System.out.println("Post not found with ID: " + id);
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        System.out.println("DELETE /api/posts/" + id + " - Deleting post");
        
        boolean deleted = postService.deletePost(id);
        
        if (deleted) {
            System.out.println("Post deleted successfully");
            return ResponseEntity.noContent().build();
        }
        
        System.out.println("Post not found with ID: " + id);
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{postId}/like")
    public ResponseEntity<Post> likePost(@PathVariable String postId, @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        System.out.println("POST /api/posts/" + postId + "/like - User " + userId + " liking post");
        
        Post post = postService.likePost(postId, userId);
        
        if (post != null) {
            System.out.println("Post like action successful");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post not found with ID: " + postId);
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{postId}/comment")
    public ResponseEntity<Post> addComment(@PathVariable String postId, @RequestBody Post.Comment comment) {
        System.out.println("POST /api/posts/" + postId + "/comment - Adding comment to post");
        System.out.println("Comment text: " + comment.getText());
        
        Post post = postService.addComment(postId, comment);
        
        if (post != null) {
            System.out.println("Comment added successfully");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post not found with ID: " + postId);
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<Post> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> request) {
        
        String userId = request.get("userId");
        String text = request.get("text");
        
        System.out.println("PUT /api/posts/" + postId + "/comment/" + commentId + " - Updating comment");
        System.out.println("User ID: " + userId + ", New text: " + text);
        
        Post post = postService.updateComment(postId, commentId, userId, text);
        
        if (post != null) {
            System.out.println("Comment updated successfully");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post or comment not found, or user not authorized");
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<Post> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestParam String userId) {
        
        System.out.println("DELETE /api/posts/" + postId + "/comment/" + commentId + " - Deleting comment");
        System.out.println("User ID: " + userId);
        
        Post post = postService.deleteComment(postId, commentId, userId);
        
        if (post != null) {
            System.out.println("Comment deleted successfully");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post or comment not found, or user not authorized");
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/{postId}/comment/{commentId}/reply")
    public ResponseEntity<Post> addReply(
            @PathVariable String postId, 
            @PathVariable String commentId, 
            @RequestBody Post.Reply reply) {
        System.out.println("POST /api/posts/" + postId + "/comment/" + commentId + "/reply - Adding reply to comment");
        System.out.println("Reply text: " + reply.getText());
        
        Post post = postService.addReplyToComment(postId, commentId, reply);
        
        if (post != null) {
            System.out.println("Reply added successfully");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post or comment not found");
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{postId}/comment/{commentId}/reply/{replyId}")
    public ResponseEntity<Post> updateReply(
            @PathVariable String postId,
            @PathVariable String commentId,
            @PathVariable String replyId,
            @RequestBody Map<String, String> request) {
        
        String userId = request.get("userId");
        String text = request.get("text");
        
        System.out.println("PUT /api/posts/" + postId + "/comment/" + commentId + "/reply/" + replyId + " - Updating reply");
        System.out.println("User ID: " + userId + ", New text: " + text);
        
        Post post = postService.updateReply(postId, commentId, replyId, userId, text);
        
        if (post != null) {
            System.out.println("Reply updated successfully");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post, comment, or reply not found, or user not authorized");
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{postId}/comment/{commentId}/reply/{replyId}")
    public ResponseEntity<Post> deleteReply(
            @PathVariable String postId,
            @PathVariable String commentId,
            @PathVariable String replyId,
            @RequestParam String userId) {
        
        System.out.println("DELETE /api/posts/" + postId + "/comment/" + commentId + "/reply/" + replyId + " - Deleting reply");
        System.out.println("User ID: " + userId);
        
        Post post = postService.deleteReply(postId, commentId, replyId, userId);
        
        if (post != null) {
            System.out.println("Reply deleted successfully");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post, comment, or reply not found, or user not authorized");
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        System.out.println("GET /api/posts/" + id + " - Getting post");
        
        Post post = postService.getPostById(id);
        
        if (post != null) {
            System.out.println("Post found");
            return ResponseEntity.ok(post);
        }
        
        System.out.println("Post not found with ID: " + id);
        return ResponseEntity.notFound().build();
    }
    
    // Add category-related endpoints
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Post>> getPostsByCategory(@PathVariable String category) {
        System.out.println("GET /api/posts/category/" + category + " - Received request for category posts");
        List<Post> posts = postService.getPostsByCategory(category);
        System.out.println("Returning " + posts.size() + " posts for category: " + category);
        return ResponseEntity.ok(posts);
    }
    
    // Add OPTIONS method handlers for all endpoints that need them
    @RequestMapping(value = "/{postId}/comment/{commentId}", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleCommentOptions() {
        return ResponseEntity.ok().build();
    }
    
    @RequestMapping(value = "/{postId}/comment/{commentId}/reply/{replyId}", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleReplyOptions() {
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = "/{postId}/comment", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleAddCommentOptions() {
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = "/{postId}/like", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleLikeOptions() {
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = "/{postId}/comment/{commentId}/reply", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleAddReplyOptions() {
        return ResponseEntity.ok().build();
    }
    
    @RequestMapping(value = "/category/{category}", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleCategoryOptions() {
        return ResponseEntity.ok().build();
    }
}
