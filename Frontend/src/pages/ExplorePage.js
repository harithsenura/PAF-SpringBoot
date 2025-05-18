"use client"

import { useState, useContext, useEffect } from "react"
import TalentPost from "../components/TalentPost"
import CreatePostModal from "../components/CreatePostModal"
import PostDetailModal from "../components/PostDetailModal"
import { AuthContext } from "../context/AuthContext"
import { PostService } from "../services/PostService"
import "./HomePage.css"

const HomePage = () => {
  const [posts, setPosts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("feed") // Added for mobile tab navigation
  const { currentUser } = useContext(AuthContext)

  // Component mount වන විට posts load කිරීම
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Try to get cached posts first
        const cachedPosts = localStorage.getItem("posts")
        if (cachedPosts) {
          const parsedPosts = JSON.parse(cachedPosts)
          setPosts(parsedPosts)
        } else {
          // Only show loading if no cached posts
          setIsLoading(true)
        }

        // Fetch fresh posts in the background
        console.log("Loading all posts...")
        const fetchedPosts = await PostService.getPosts()
        console.log("Fetched posts:", fetchedPosts)

        // Update posts and save to cache
        setPosts(fetchedPosts)
        localStorage.setItem("posts", JSON.stringify(fetchedPosts))
      } catch (error) {
        console.error("Error loading posts:", error)
        // If error and no posts loaded yet, try to use cached posts
        if (posts.length === 0) {
          const cachedPosts = localStorage.getItem("posts")
          if (cachedPosts) {
            setPosts(JSON.parse(cachedPosts))
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  // Post එකක් සෑදීමේදී මෙම function එක call වේ
  const handlePostCreated = (newPost) => {
    console.log("Handling new post creation:", newPost)
    // State එක යාවත්කාලීන කිරීම - IMPORTANT!
    setPosts((prevPosts) => [newPost, ...prevPosts])

    // Update cache with new post
    try {
      const cachedPosts = localStorage.getItem("posts")
      if (cachedPosts) {
        const posts = JSON.parse(cachedPosts)
        localStorage.setItem("posts", JSON.stringify([newPost, ...posts]))
      } else {
        localStorage.setItem("posts", JSON.stringify([newPost]))
      }
    } catch (error) {
      console.error("Error updating cache:", error)
    }
  }

  const handleLikePost = async (postId) => {
    try {
      if (!currentUser) return

      const userId = currentUser.id
      const updatedPost = await PostService.likePost(postId, userId)

      setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)))
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleAddComment = async (postId, comment, isReply = false) => {
    try {
      // If this is a reply to an existing comment
      if (isReply) {
        // Find the post and update its comments
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            // Find the comment that was replied to
            const updatedComments = post.comments.map((c) => {
              if (c.id === comment.id) {
                // Return the updated comment with replies
                return comment
              }
              return c
            })

            // Return the updated post
            return {
              ...post,
              comments: updatedComments,
            }
          }
          return post
        })

        setPosts(updatedPosts)
        return
      }

      // Regular comment (not a reply)
      const updatedPost = await PostService.addComment(postId, comment)

      setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)))
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleViewDetails = (post) => {
    setSelectedPost(post)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Share Your Talents With The World</h1>
          <p>Connect with creative minds, showcase your work, and grow your business</p>
          <button className="cta-button" onClick={() => setIsModalOpen(true)}>
            Share Your Talent
          </button>
        </div>
      </section>

      {/* Mobile Tab Navigation */}
      <div className="mobile-tabs">
        <button className={`tab-button ${activeTab === "feed" ? "active" : ""}`} onClick={() => setActiveTab("feed")}>
          Feed
        </button>
        <button
          className={`tab-button ${activeTab === "trending" ? "active" : ""}`}
          onClick={() => setActiveTab("trending")}
        >
          Trending
        </button>
        <button
          className={`tab-button ${activeTab === "suggested" ? "active" : ""}`}
          onClick={() => setActiveTab("suggested")}
        >
          Suggested
        </button>
      </div>

      <section className="feed-section">
        <div className="feed-container">
          <div className={`main-feed ${activeTab === "feed" ? "active" : ""}`}>
            <div className="section-header">
              <h2 className="section-title">Talent Feed</h2>
              <button className="create-post-button" onClick={() => setIsModalOpen(true)}>
                <span>+</span> New Post
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="posts-grid">
                {posts.map((post) => (
                  <TalentPost key={post.id} post={post} onViewDetails={handleViewDetails} />
                ))}
              </div>
            ) : isLoading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading amazing talents...</p>
              </div>
            ) : (
              <div className="no-posts-message">
                <img src="/empty-state-illustration.png" alt="No posts" />
                <h3>No posts yet</h3>
                <p>Be the first to share your talent!</p>
                <button className="cta-button" onClick={() => setIsModalOpen(true)}>
                  Create Post
                </button>
              </div>
            )}
          </div>

          <div className={`sidebar ${activeTab === "trending" || activeTab === "suggested" ? "active-mobile" : ""}`}>
            <div className={`trending-section ${activeTab === "trending" ? "active-mobile" : ""}`}>
              <h3>Trending Talents</h3>
              <ul className="trending-list">
                <li>
                  <span className="trending-number">#1</span>
                  <span className="trending-tag">Digital Art</span>
                  <span className="trending-count">2.5k posts</span>
                </li>
                <li>
                  <span className="trending-number">#2</span>
                  <span className="trending-tag">Handmade Crafts</span>
                  <span className="trending-count">1.8k posts</span>
                </li>
                <li>
                  <span className="trending-number">#3</span>
                  <span className="trending-tag">Music Production</span>
                  <span className="trending-count">1.2k posts</span>
                </li>
                <li>
                  <span className="trending-number">#4</span>
                  <span className="trending-tag">Fashion Design</span>
                  <span className="trending-count">950 posts</span>
                </li>
                <li>
                  <span className="trending-number">#5</span>
                  <span className="trending-tag">Photography</span>
                  <span className="trending-count">820 posts</span>
                </li>
              </ul>
            </div>

            <div className={`suggested-talents ${activeTab === "suggested" ? "active-mobile" : ""}`}>
              <h3>Suggested Talents</h3>
              <div className="talent-suggestions">
                <div className="suggested-talent">
                  <img src="/professional-woman-portrait.png" alt="Suggested Talent" className="suggested-avatar" />
                  <div className="suggested-info">
                    <h4>Malini Gunawardena</h4>
                    <p>Digital Artist</p>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>

                <div className="suggested-talent">
                  <img src="/professional-man-portrait.png" alt="Suggested Talent" className="suggested-avatar" />
                  <div className="suggested-info">
                    <h4>Rohan De Silva</h4>
                    <p>Photographer</p>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>

                <div className="suggested-talent">
                  <img src="/woman-musician-portrait.png" alt="Suggested Talent" className="suggested-avatar" />
                  <div className="suggested-info">
                    <h4>Dilini Jayasuriya</h4>
                    <p>Musician</p>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating action button for mobile */}
      <button className="floating-action-button" onClick={() => setIsModalOpen(true)}>
        <span>+</span>
      </button>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated} />

      <PostDetailModal
        isOpen={isDetailModalOpen}
        post={selectedPost}
        onClose={() => setIsDetailModalOpen(false)}
        onLike={handleLikePost}
        onAddComment={handleAddComment}
      />
    </div>
  )
}

export default HomePage
