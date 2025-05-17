package com.example.PAF.SB.repository;

import com.example.PAF.SB.models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    
    // Find posts by user ID
    List<Post> findByUserId(String userId);
    
    // Find posts by category
    List<Post> findByCategory(String category);
    
    // Find posts by user ID and sort by timestamp in descending order
    List<Post> findByUserIdOrderByTimestampDesc(String userId);
    
    // Find all posts sorted by timestamp in descending order
    List<Post> findAllByOrderByTimestampDesc();
    
    // Find posts by category sorted by timestamp in descending order
    List<Post> findByCategoryOrderByTimestampDesc(String category);
}
