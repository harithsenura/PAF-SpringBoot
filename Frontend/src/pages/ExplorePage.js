"use client"

import { useState, useEffect } from "react"
import TalentPost from "../components/TalentPost"
import { PostService } from "../services/PostService"
import "./ExplorePage.css"

const ExplorePage = () => {
  const [activeCategory, setActiveCategory] = useState("all")
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false) // Changed to false initially
  
  const categories = [
    { id: "all", name: "All" },
    { id: "art", name: "Art & Design" },
    { id: "music", name: "Music" },
    { id: "photography", name: "Photography" },
    { id: "crafts", name: "Crafts" },
    { id: "fashion", name: "Fashion" },
    { id: "writing", name: "Writing" },
  ]

  //this is for testing
  // Load posts when component mounts or category changes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Try to get cached posts first
        const cacheKey = activeCategory === "all" ? "posts" : `categoryPosts_${activeCategory}`
        const cachedPosts = localStorage.getItem(cacheKey)
        
        if (cachedPosts) {
          const parsedPosts = JSON.parse(cachedPosts)
          setPosts(parsedPosts)
        } else {
          // Only show loading if no cached posts
          setIsLoading(true)
        }

        console.log(`Loading posts for category: ${activeCategory}`)

        // Fetch fresh posts in the background
        const fetchedPosts = await PostService.getPostsByCategory(activeCategory)
        console.log(`Fetched ${fetchedPosts.length} posts for category: ${activeCategory}`)
        
        // Update posts and save to cache
        setPosts(fetchedPosts)
        
        // Save to category-specific cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(fetchedPosts))
        } catch (error) {
          console.warn("Error saving to localStorage:", error)
        }
      } catch (error) {
        console.error(`Error loading posts for category ${activeCategory}:`, error)
        
        // If error and no posts loaded yet, try to use cached posts
        if (posts.length === 0) {
          const cacheKey = activeCategory === "all" ? "posts" : `categoryPosts_${activeCategory}`
          const cachedPosts = localStorage.getItem(cacheKey)
          if (cachedPosts) {
            setPosts(JSON.parse(cachedPosts))
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()

    // Listen for updates to category posts from background fetches
    const handleCategoryPostsUpdated = (event) => {
      if (event.detail.category === activeCategory || activeCategory === "all") {
        console.log(`Received fresh posts for category ${event.detail.category}`)
        if (activeCategory === "all") {
          // Refresh all posts
          PostService.getPosts().then((allPosts) => setPosts(allPosts))
        } else {
          // Update with the fresh category posts
          setPosts(event.detail.posts)
        }
      }
    }

    window.addEventListener("categoryPostsUpdated", handleCategoryPostsUpdated)

    // Listen for general posts updates
    const handlePostsUpdated = (event) => {
      if (activeCategory === "all") {
        console.log("Received fresh posts from background fetch")
        setPosts(event.detail)
      }
    }

    window.addEventListener("postsUpdated", handlePostsUpdated)

    // Cleanup
    return () => {
      window.removeEventListener("categoryPostsUpdated", handleCategoryPostsUpdated)
      window.removeEventListener("postsUpdated", handlePostsUpdated)
    }
  }, [activeCategory])

  // Function to optimize image loading
  const optimizeImageUrl = (imageUrl) => {
    // If it's a data URL (base64), return as is
    if (imageUrl && imageUrl.startsWith("data:")) {
      return imageUrl
    }

    // For external images, you could add parameters for optimization
    // This is just a placeholder - implement based on your image hosting
    return imageUrl
  }

  const handleViewDetails = (post) => {
    // You can implement view details functionality here if needed
    console.log("View details for post:", post)
  }

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1 className="section-title">Explore Talents</h1>
        <p className="explore-description">Discover amazing talents from creators around the world</p>
      </div>

      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? "active" : ""}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {posts.length > 0 ? (
        <div className="explore-grid">
          {posts.map((post) => (
            <div key={post.id} className="explore-item">
              <TalentPost
                post={{
                  ...post,
                  media: post.media ? optimizeImageUrl(post.media) : post.media,
                }}
                onViewDetails={handleViewDetails}
              />
            </div>
          ))}
        </div>
      ) : isLoading ? (
        <div className="loading-indicator">Loading posts...</div>
      ) : (
        <div className="no-posts-message">
          {activeCategory === "all"
            ? "No posts available yet. Be the first to share your talent!"
            : `No posts available in the ${categories.find((c) => c.id === activeCategory)?.name} category yet.`}
        </div>
      )}
    </div>
  )
}

export default ExplorePage