// Backend API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const PostService = {
  // Get all posts
  getPosts: async () => {
    try {
      console.log("Fetching all posts from API")
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const posts = await response.json()
      console.log(`Received ${posts.length} posts from API`)

      // Save posts to localStorage for offline access - limit to 50 posts
      try {
        localStorage.setItem("posts", JSON.stringify(posts.slice(0, 50)))
      } catch (storageError) {
        console.warn("Could not save to localStorage:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return posts
    } catch (error) {
      console.error("Error getting posts:", error)

      // Try to get posts from localStorage if API fails
      try {
        const cachedPosts = localStorage.getItem("posts")
        if (cachedPosts) {
          console.log("Returning cached posts from localStorage")
          return JSON.parse(cachedPosts)
        }
      } catch (storageError) {
        console.warn("Could not read from localStorage:", storageError)
      }

      return []
    }
  },

  // Get posts by category
  getPostsByCategory: async (category) => {
    try {
      console.log(`Fetching posts for category ${category}`)

      if (category === "all") {
        return await PostService.getPosts()
      }

      // Try to get from API first
      const response = await fetch(`${API_URL}/category/${category}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const posts = await response.json()
      console.log(`Found ${posts.length} posts in category ${category}`)

      // Save category posts to localStorage - limit to 20 posts per category
      try {
        localStorage.setItem(`categoryPosts_${category}`, JSON.stringify(posts.slice(0, 20)))
      } catch (storageError) {
        console.warn("Could not save category posts to localStorage:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return posts
    } catch (error) {
      console.error(`Error getting posts for category ${category}:`, error)

      // Try to get from localStorage if API fails
      try {
        const cachedCategoryPosts = localStorage.getItem(`categoryPosts_${category}`)
        if (cachedCategoryPosts) {
          console.log(`Returning cached posts for category ${category} from localStorage`)
          return JSON.parse(cachedCategoryPosts)
        }

        // If no category cache, try filtering from all posts
        const cachedPosts = localStorage.getItem("posts")
        if (cachedPosts) {
          const allPosts = JSON.parse(cachedPosts)
          return allPosts.filter((post) => post.category === category)
        }
      } catch (storageError) {
        console.warn("Could not read from localStorage:", storageError)
      }

      return []
    }
  },

  // Get posts by user ID
  getUserPosts: async (userId) => {
    try {
      console.log(`Fetching posts for user ${userId}`)
      const response = await fetch(`${API_URL}/user/${userId}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const posts = await response.json()
      console.log(`Received ${posts.length} posts for user ${userId}`)

      // Save user posts to localStorage - limit to 20 posts per user
      try {
        localStorage.setItem(`userPosts_${userId}`, JSON.stringify(posts.slice(0, 20)))
      } catch (storageError) {
        console.warn("Could not save user posts to localStorage:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return posts
    } catch (error) {
      console.error("Error getting user posts:", error)

      // Try to get user posts from localStorage if API fails
      try {
        const cachedUserPosts = localStorage.getItem(`userPosts_${userId}`)
        if (cachedUserPosts) {
          console.log("Returning cached user posts from localStorage")
          return JSON.parse(cachedUserPosts)
        }
      } catch (storageError) {
        console.warn("Could not read from localStorage:", storageError)
      }

      return []
    }
  },

  // Create a new post
  createPost: async (post) => {
    try {
      console.log("Creating new post:", post)

      // Create a clean copy of the post to send to the server
      const postToSend = {
        userId: post.userId,
        text: post.text,
        media: post.media,
        mediaType: post.mediaType,
        category: post.category, // Include the category field
        likes: 0,
        likedBy: [],
        comments: [],
        user: post.user,
      }

      console.log("Sending post with category:", postToSend.category)
      console.log("Full post data being sent:", JSON.stringify(postToSend))

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postToSend),
        credentials: "include",
      })

      console.log("Response status:", response.status)

      // Get the raw response text first
      const responseText = await response.text()
      console.log("Raw response:", responseText)

      if (!response.ok) {
        console.error("Server error response:", responseText)
        throw new Error(`Error: ${response.status} - ${responseText}`)
      }

      // Parse the response text as JSON if it's not empty
      let createdPost
      try {
        createdPost = responseText ? JSON.parse(responseText) : {}
      } catch (e) {
        console.error("Error parsing response as JSON:", e)
        throw new Error("Invalid JSON response from server")
      }

      console.log("Post created successfully:", createdPost)

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithNewPost(createdPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with new post:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return createdPost
    } catch (error) {
      console.error("Error creating post:", error)

      // Only create a temporary post if it's a network error, not a server error
      if (!error.message.startsWith("Error:")) {
        // Generate a temporary ID for the post
        const tempPost = {
          ...post,
          id: `temp_${Date.now()}`,
          timestamp: new Date().toISOString(),
          likedBy: [],
        }

        // Try to update localStorage, but don't fail if it doesn't work
        try {
          updateLocalStorageWithNewPost(tempPost)
        } catch (storageError) {
          console.warn("Could not update localStorage with temp post:", storageError)
          // Clear localStorage if it's full
          clearLocalStorageSelectively()
        }

        return tempPost
      }

      // Re-throw the error to be handled by the component
      throw error
    }
  },

  // Update a post
  updatePost: async (post) => {
    try {
      console.log("Updating post:", post)
      const response = await fetch(`${API_URL}/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const updatedPost = await response.json()

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with updated post:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error updating post:", error)
      throw error
    }
  },

  // Delete a post
  deletePost: async (postId) => {
    try {
      console.log("Deleting post:", postId)
      const response = await fetch(`${API_URL}/${postId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        removePostFromLocalStorage(postId)
      } catch (storageError) {
        console.warn("Could not remove post from localStorage:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return true
    } catch (error) {
      console.error("Error deleting post:", error)
      throw error
    }
  },

  // Like a post
  likePost: async (postId, userId) => {
    try {
      console.log(`User ${userId} liking post ${postId}`)
      const response = await fetch(`${API_URL}/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const updatedPost = await response.json()

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with liked post:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error liking post:", error)
      throw error
    }
  },

  // Add comment to a post
  addComment: async (postId, comment) => {
    try {
      console.log(`Adding comment to post ${postId}:`, comment)
      const response = await fetch(`${API_URL}/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const updatedPost = await response.json()

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with commented post:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    }
  },

  // Update a comment
  updateComment: async (postId, commentId, userId, text) => {
    try {
      console.log(`Updating comment ${commentId} in post ${postId}`)

      const response = await fetch(`${API_URL}/${postId}/comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, text }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Error: ${response.status} - ${errorText}`)
      }

      const updatedPost = await response.json()
      console.log("Comment updated successfully, updated post:", updatedPost)

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with updated comment:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error updating comment:", error)
      throw error
    }
  },

  // Delete a comment
  deleteComment: async (postId, commentId, userId) => {
    try {
      console.log(`Deleting comment ${commentId} from post ${postId}`)

      const response = await fetch(`${API_URL}/${postId}/comment/${commentId}?userId=${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Error: ${response.status} - ${errorText}`)
      }

      const updatedPost = await response.json()
      console.log("Comment deleted successfully, updated post:", updatedPost)

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with deleted comment:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error deleting comment:", error)
      throw error
    }
  },

  // Add reply to a comment
  addReply: async (postId, commentId, reply) => {
    try {
      console.log(`Adding reply to comment ${commentId} in post ${postId}:`, reply)

      // Log the request details for debugging
      console.log("Request URL:", `${API_URL}/${postId}/comment/${commentId}/reply`)
      console.log("Request body:", JSON.stringify(reply))

      const response = await fetch(`${API_URL}/${postId}/comment/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reply),
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Error: ${response.status} - ${errorText}`)
      }

      const updatedPost = await response.json()
      console.log("Reply added successfully, updated post:", updatedPost)

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with replied post:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error adding reply:", error)
      throw error
    }
  },

  // Update a reply
  updateReply: async (postId, commentId, replyId, userId, text) => {
    try {
      console.log(`Updating reply ${replyId} in comment ${commentId} in post ${postId}`)

      const response = await fetch(`${API_URL}/${postId}/comment/${commentId}/reply/${replyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, text }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Error: ${response.status} - ${errorText}`)
      }

      const updatedPost = await response.json()
      console.log("Reply updated successfully, updated post:", updatedPost)

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with updated reply:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error updating reply:", error)
      throw error
    }
  },

  // Delete a reply
  deleteReply: async (postId, commentId, replyId, userId) => {
    try {
      console.log(`Deleting reply ${replyId} from comment ${commentId} in post ${postId}`)

      const response = await fetch(`${API_URL}/${postId}/comment/${commentId}/reply/${replyId}?userId=${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Error: ${response.status} - ${errorText}`)
      }

      const updatedPost = await response.json()
      console.log("Reply deleted successfully, updated post:", updatedPost)

      // Try to update localStorage, but don't fail if it doesn't work
      try {
        updateLocalStorageWithUpdatedPost(updatedPost)
      } catch (storageError) {
        console.warn("Could not update localStorage with deleted reply:", storageError)
        // Clear localStorage if it's full
        clearLocalStorageSelectively()
      }

      return updatedPost
    } catch (error) {
      console.error("Error deleting reply:", error)
      throw error
    }
  },

  // Get a post by ID
  getPostById: async (postId) => {
    try {
      console.log(`Fetching post with ID ${postId}`)
      const response = await fetch(`${API_URL}/${postId}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const post = await response.json()
      console.log(`Received post with ID ${postId}`)

      return post
    } catch (error) {
      console.error(`Error getting post with ID ${postId}:`, error)

      // Try to get post from localStorage if API fails
      try {
        const cachedPosts = localStorage.getItem("posts")
        if (cachedPosts) {
          const posts = JSON.parse(cachedPosts)
          const post = posts.find((p) => p.id === postId)
          if (post) {
            console.log(`Returning cached post with ID ${postId} from localStorage`)
            return post
          }
        }
      } catch (storageError) {
        console.warn("Could not read from localStorage:", storageError)
      }

      throw error
    }
  },
}

// Helper functions for localStorage management
function updateLocalStorageWithNewPost(newPost) {
  try {
    // Update all posts - limit to most recent 50 posts
    const cachedPosts = localStorage.getItem("posts")
    if (cachedPosts) {
      const posts = JSON.parse(cachedPosts)
      // Keep only the most recent 50 posts
      const limitedPosts = [newPost, ...posts].slice(0, 50)
      localStorage.setItem("posts", JSON.stringify(limitedPosts))
    } else {
      localStorage.setItem("posts", JSON.stringify([newPost]))
    }

    // Update user posts - limit to most recent 20 posts per user
    const userId = newPost.userId
    const cachedUserPosts = localStorage.getItem(`userPosts_${userId}`)
    if (cachedUserPosts) {
      const userPosts = JSON.parse(cachedUserPosts)
      // Keep only the most recent 20 posts for this user
      const limitedUserPosts = [newPost, ...userPosts].slice(0, 20)
      localStorage.setItem(`userPosts_${userId}`, JSON.stringify(limitedUserPosts))
    } else {
      localStorage.setItem(`userPosts_${userId}`, JSON.stringify([newPost]))
    }

    // Update category posts - limit to most recent 20 posts per category
    if (newPost.category) {
      const categoryKey = `categoryPosts_${newPost.category}`
      const cachedCategoryPosts = localStorage.getItem(categoryKey)
      if (cachedCategoryPosts) {
        const categoryPosts = JSON.parse(cachedCategoryPosts)
        // Keep only the most recent 20 posts for this category
        const limitedCategoryPosts = [newPost, ...categoryPosts].slice(0, 20)
        localStorage.setItem(categoryKey, JSON.stringify(limitedCategoryPosts))
      } else {
        localStorage.setItem(categoryKey, JSON.stringify([newPost]))
      }
    }
  } catch (error) {
    console.error("Error updating localStorage:", error)
    // If localStorage fails, clear some data
    clearLocalStorageSelectively()
    // Try again with just the new post
    try {
      localStorage.setItem("posts", JSON.stringify([newPost]))
    } catch (retryError) {
      console.error("Failed to update localStorage even after clearing:", retryError)
    }
  }
}

function updateLocalStorageWithUpdatedPost(updatedPost) {
  try {
    // Update all posts
    const cachedPosts = localStorage.getItem("posts")
    if (cachedPosts) {
      const posts = JSON.parse(cachedPosts)
      const updatedPosts = posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      localStorage.setItem("posts", JSON.stringify(updatedPosts))
    }

    // Update user posts
    const userId = updatedPost.userId
    const cachedUserPosts = localStorage.getItem(`userPosts_${userId}`)
    if (cachedUserPosts) {
      const userPosts = JSON.parse(cachedUserPosts)
      const updatedUserPosts = userPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      localStorage.setItem(`userPosts_${userId}`, JSON.stringify(updatedUserPosts))
    }

    // Update category posts
    if (updatedPost.category) {
      const categoryKey = `categoryPosts_${updatedPost.category}`
      const cachedCategoryPosts = localStorage.getItem(categoryKey)
      if (cachedCategoryPosts) {
        const categoryPosts = JSON.parse(cachedCategoryPosts)
        const updatedCategoryPosts = categoryPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
        localStorage.setItem(categoryKey, JSON.stringify(updatedCategoryPosts))
      }
    }
  } catch (error) {
    console.error("Error updating localStorage with updated post:", error)
    // If localStorage fails, clear some data
    clearLocalStorageSelectively()
  }
}

function removePostFromLocalStorage(postId) {
  try {
    // First get the post to know its category
    let postCategory = null
    let userId = null
    const cachedPosts = localStorage.getItem("posts")
    if (cachedPosts) {
      const posts = JSON.parse(cachedPosts)
      const post = posts.find((p) => p.id === postId)
      if (post) {
        postCategory = post.category
        userId = post.userId
      }

      // Update all posts
      const filteredPosts = posts.filter((post) => post.id !== postId)
      localStorage.setItem("posts", JSON.stringify(filteredPosts))
    }

    // Update user posts if we know the userId
    if (userId) {
      const userPostsKey = `userPosts_${userId}`
      const cachedUserPosts = localStorage.getItem(userPostsKey)
      if (cachedUserPosts) {
        const userPosts = JSON.parse(cachedUserPosts)
        const filteredUserPosts = userPosts.filter((post) => post.id !== postId)
        localStorage.setItem(userPostsKey, JSON.stringify(filteredUserPosts))
      }
    } else {
      // If we don't know the userId, check all user posts
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userPosts_")) {
          const userPosts = JSON.parse(localStorage.getItem(key))
          const filteredUserPosts = userPosts.filter((post) => post.id !== postId)
          localStorage.setItem(key, JSON.stringify(filteredUserPosts))
        }
      }
    }

    // Update category posts
    if (postCategory) {
      const categoryKey = `categoryPosts_${postCategory}`
      const cachedCategoryPosts = localStorage.getItem(categoryKey)
      if (cachedCategoryPosts) {
        const categoryPosts = JSON.parse(cachedCategoryPosts)
        const filteredCategoryPosts = categoryPosts.filter((post) => post.id !== postId)
        localStorage.setItem(categoryKey, JSON.stringify(filteredCategoryPosts))
      }
    } else {
      // If we don't know the category, check all category posts
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("categoryPosts_")) {
          const categoryPosts = JSON.parse(localStorage.getItem(key))
          const filteredCategoryPosts = categoryPosts.filter((post) => post.id !== postId)
          localStorage.setItem(key, JSON.stringify(filteredCategoryPosts))
        }
      }
    }
  } catch (error) {
    console.error("Error removing post from localStorage:", error)
    // If localStorage fails, clear some data
    clearLocalStorageSelectively()
  }
}

// Function to clear localStorage selectively to make room
function clearLocalStorageSelectively() {
  console.log("Clearing localStorage selectively to make room")

  try {
    // First, clear all category caches as they can be regenerated
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith("categoryPosts_")) {
        localStorage.removeItem(key)
      }
    }

    // Then try to reduce the size of the main posts cache
    const cachedPosts = localStorage.getItem("posts")
    if (cachedPosts) {
      const posts = JSON.parse(cachedPosts)
      // Keep only 10 most recent posts
      if (posts.length > 10) {
        localStorage.setItem("posts", JSON.stringify(posts.slice(0, 10)))
      }
    }

    // Finally, reduce user posts caches
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith("userPosts_")) {
        const userPosts = JSON.parse(localStorage.getItem(key))
        if (userPosts.length > 5) {
          localStorage.setItem(key, JSON.stringify(userPosts.slice(0, 5)))
        }
      }
    }
  } catch (error) {
    console.error("Error while trying to clear localStorage selectively:", error)
    // Last resort: clear everything
    try {
      localStorage.clear()
    } catch (clearError) {
      console.error("Failed to clear localStorage:", clearError)
    }
  }
}

export default PostService
