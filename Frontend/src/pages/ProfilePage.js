"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { PostService } from "../services/PostService"
import TalentPost from "../components/TalentPost"
import EditPostModal from "../components/EditPostModal"
import CreatePostModal from "../components/CreatePostModal"
import PostDetailModal from "../components/PostDetailModal"
import "./ProfilePage.css"

const ProfilePage = () => {
  const { currentUser } = useContext(AuthContext)
  const [userPosts, setUserPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Track initial load state
  const [editingPost, setEditingPost] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [activeTab, setActiveTab] = useState("myPosts")
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Used to trigger refreshes

  // Component mount වන විට පරිශීලකයාගේ posts load කිරීම
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!currentUser) return

      try {
        // Always show loading on initial load
        if (isInitialLoad) {
          setIsLoading(true)
        }

        // First check localStorage for cached user posts
        let cachedPosts = null
        try {
          const cachedData = localStorage.getItem(`userPosts_${currentUser.id}`)
          if (cachedData) {
            cachedPosts = JSON.parse(cachedData)
            console.log(`Loaded ${cachedPosts.length} cached posts for user ${currentUser.id}`)

            // If we have cached posts, use them immediately
            if (cachedPosts && cachedPosts.length > 0) {
              setUserPosts(cachedPosts)
              setIsLoading(false) // Hide loading indicator once we have cached data
            }
          }
        } catch (error) {
          console.warn("Error reading from localStorage:", error)
        }

        // Then fetch fresh data from the API (in the background if we have cache)
        console.log("Fetching fresh posts for user ID:", currentUser.id)
        const freshPosts = await PostService.getUserPosts(currentUser.id)
        console.log(`Fetched ${freshPosts.length} fresh posts for user ${currentUser.id}`)

        // Update state with fresh data
        setUserPosts(freshPosts)

        // Save to localStorage for next time
        try {
          localStorage.setItem(`userPosts_${currentUser.id}`, JSON.stringify(freshPosts))
        } catch (storageError) {
          console.warn("Error saving to localStorage:", storageError)
          // Try to clear some space
          clearLocalStorageSelectively()
        }
      } catch (error) {
        console.error("Error loading user posts:", error)

        // If API fetch fails, try to use cached data as fallback
        try {
          const cachedData = localStorage.getItem(`userPosts_${currentUser.id}`)
          if (cachedData) {
            const cachedPosts = JSON.parse(cachedData)
            console.log(`Using ${cachedPosts.length} cached posts as fallback`)
            setUserPosts(cachedPosts)
          }
        } catch (storageError) {
          console.warn("Error reading from localStorage:", storageError)
        }
      } finally {
        setIsLoading(false)
        setIsInitialLoad(false) // No longer initial load
      }
    }

    loadUserPosts()
  }, [currentUser, refreshTrigger]) // Add refreshTrigger to dependencies

  // Function to clear localStorage selectively
  const clearLocalStorageSelectively = () => {
    try {
      // Clear all category caches first
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith("categoryPosts_")) {
          localStorage.removeItem(key)
        }
      }

      // If that's not enough, clear other user posts
      if (currentUser) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && key.startsWith("userPosts_") && !key.includes(currentUser.id)) {
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setIsEditModalOpen(true)
  }

  const handleUpdatePost = async (updatedPost) => {
    try {
      const result = await PostService.updatePost(updatedPost)

      // Update state
      setUserPosts(userPosts.map((post) => (post.id === updatedPost.id ? result : post)))

      // Update localStorage cache
      try {
        const cachedData = localStorage.getItem(`userPosts_${currentUser.id}`)
        if (cachedData) {
          const cachedPosts = JSON.parse(cachedData)
          const updatedCache = cachedPosts.map((post) => (post.id === updatedPost.id ? result : post))
          localStorage.setItem(`userPosts_${currentUser.id}`, JSON.stringify(updatedCache))
        }
      } catch (error) {
        console.warn("Error updating localStorage:", error)
      }

      setIsEditModalOpen(false)
      setEditingPost(null)
    } catch (error) {
      console.error("Error updating post:", error)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    try {
      await PostService.deletePost(postId)

      // Update state
      setUserPosts(userPosts.filter((post) => post.id !== postId))

      // Update localStorage cache
      try {
        const cachedData = localStorage.getItem(`userPosts_${currentUser.id}`)
        if (cachedData) {
          const cachedPosts = JSON.parse(cachedData)
          const updatedCache = cachedPosts.filter((post) => post.id !== postId)
          localStorage.setItem(`userPosts_${currentUser.id}`, JSON.stringify(updatedCache))
        }
      } catch (error) {
        console.warn("Error updating localStorage:", error)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  // Post එකක් සෑදීමේදී මෙම function එක call වේ
  const handlePostCreated = (newPost) => {
    console.log("Handling new post creation in profile:", newPost)

    // State එක යාවත්කාලීන කිරීම - IMPORTANT!
    setUserPosts((prevPosts) => [newPost, ...prevPosts])

    // Update localStorage cache
    try {
      const cachedData = localStorage.getItem(`userPosts_${currentUser.id}`)
      if (cachedData) {
        const cachedPosts = JSON.parse(cachedData)
        localStorage.setItem(`userPosts_${currentUser.id}`, JSON.stringify([newPost, ...cachedPosts]))
      } else {
        localStorage.setItem(`userPosts_${currentUser.id}`, JSON.stringify([newPost]))
      }
    } catch (error) {
      console.warn("Error updating localStorage:", error)
    }

    setIsCreateModalOpen(false)
  }

  const handleLikePost = async (postId) => {
    try {
      if (!currentUser) return

      const userId = currentUser.id
      const updatedPost = await PostService.likePost(postId, userId)

      // Update state
      setUserPosts(userPosts.map((post) => (post.id === postId ? updatedPost : post)))

      // Update localStorage cache
      try {
        const cachedData = localStorage.getItem(`userPosts_${currentUser.id}`)
        if (cachedData) {
          const cachedPosts = JSON.parse(cachedData)
          const updatedCache = cachedPosts.map((post) => (post.id === postId ? updatedPost : post))
          localStorage.setItem(`userPosts_${currentUser.id}`, JSON.stringify(updatedCache))
        }
      } catch (error) {
        console.warn("Error updating localStorage:", error)
      }

      // If the detail modal is open and this is the selected post, update it
      if (isDetailModalOpen && selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleAddComment = async (postId, comment) => {
    try {
      const updatedPost = await PostService.addComment(postId, comment)

      // Update state
      setUserPosts(userPosts.map((post) => (post.id === postId ? updatedPost : post)))

      // Update localStorage cache
      try {
        const cachedData = localStorage.getItem(`userPosts_${currentUser.id}`)
        if (cachedData) {
          const cachedPosts = JSON.parse(cachedData)
          const updatedCache = cachedPosts.map((post) => (post.id === postId ? updatedPost : post))
          localStorage.setItem(`userPosts_${currentUser.id}`, JSON.stringify(updatedCache))
        }
      } catch (error) {
        console.warn("Error updating localStorage:", error)
      }

      // If the detail modal is open and this is the selected post, update it
      if (isDetailModalOpen && selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost)
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleViewDetails = (post) => {
    setSelectedPost(post)
    setIsDetailModalOpen(true)
  }

  // Function to refresh posts
  const refreshPosts = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

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

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="not-logged-in">
          <h2>Please log in to view your profile</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser.avatar ? (
            <img
              src={optimizeImageUrl(currentUser.avatar) || "/placeholder.svg"}
              alt={`${currentUser.firstName}'s avatar`}
              loading="lazy"
            />
          ) : (
            <div className="avatar-initial">{getInitials(currentUser.firstName)}</div>
          )}
        </div>
        <div className="profile-info">
          <h1>
            {currentUser.firstName} {currentUser.lastName}
          </h1>
          <p className="profile-email">{currentUser.email}</p>
          <div className="profile-actions">
            <button className="share-post-btn" onClick={() => setIsCreateModalOpen(true)}>
              Share Your Talent
            </button>
            <button className="refresh-btn" onClick={refreshPosts} aria-label="Refresh posts">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="refresh-icon"
              >
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "myPosts" ? "active" : ""}`}
            onClick={() => setActiveTab("myPosts")}
          >
            My Posts
          </button>
          <button
            className={`tab-button ${activeTab === "likedPosts" ? "active" : ""}`}
            onClick={() => setActiveTab("likedPosts")}
          >
            Liked Posts
          </button>
        </div>

        <div className="user-posts">
          <h2>My Posts</h2>

          {isLoading ? (
            <div className="posts-loading-container">
              {[1, 2, 3].map((n) => (
                <div key={n} className="post-skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-info">
                      <div className="skeleton-name"></div>
                      <div className="skeleton-date"></div>
                    </div>
                  </div>
                  <div className="skeleton-content"></div>
                  <div className="skeleton-actions"></div>
                </div>
              ))}
            </div>
          ) : userPosts.length > 0 ? (
            <div className="posts-grid">
              {userPosts.map((post) => (
                <div key={post.id} className="post-container">
                  <TalentPost
                    post={{
                      ...post,
                      media: post.media ? optimizeImageUrl(post.media) : post.media,
                    }}
                    currentUser={currentUser}
                    onLike={handleLikePost}
                    onAddComment={handleAddComment}
                    onViewDetails={handleViewDetails}
                  />
                  <div className="post-actions-overlay">
                    <button className="edit-post-btn" onClick={() => handleEditPost(post)}>
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button className="delete-post-btn" onClick={() => handleDeletePost(post.id)}>
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-posts-message">
              <p>You haven't shared any posts yet.</p>
              <button className="create-post-btn" onClick={() => setIsCreateModalOpen(true)}>
                Share Your First Post
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && editingPost && (
        <EditPostModal
          isOpen={isEditModalOpen}
          post={editingPost}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingPost(null)
          }}
          onUpdate={handleUpdatePost}
        />
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

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

export default ProfilePage
