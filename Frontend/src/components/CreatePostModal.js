"use client"

import { useState, useContext, useRef } from "react"
import { AuthContext } from "../context/AuthContext"
import { PostService } from "../services/PostService"
import "./CreatePostModal.css"

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [postText, setPostText] = useState("")
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [mediaType, setMediaType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState("art") // Default category
  const fileInputRef = useRef(null)
  const { currentUser } = useContext(AuthContext)

  // Categories list - same as in ExplorePage
  const categories = [
    { id: "art", name: "Art & Design" },
    { id: "music", name: "Music" },
    { id: "photography", name: "Photography" },
    { id: "crafts", name: "Crafts" },
    { id: "fashion", name: "Fashion" },
    { id: "writing", name: "Writing" },
  ]

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check if file is an image or video
    if (file.type.startsWith("image/")) {
      setMediaType("image")
    } else if (file.type.startsWith("video/")) {
      setMediaType("video")
    } else {
      alert("Please upload an image or video file.")
      return
    }

    // Check file size - limit to 1MB
    if (file.size > 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 1MB.")
      return
    }

    setMediaFile(file)

    // Create preview with reduced quality for images
    const reader = new FileReader()
    reader.onloadend = () => {
      if (file.type.startsWith("image/")) {
        // For images, we can reduce the quality
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          // Resize image if it's too large
          let width = img.width
          let height = img.height

          // Max dimensions 800x800
          if (width > 800 || height > 800) {
            if (width > height) {
              height = Math.round(height * (800 / width))
              width = 800
            } else {
              width = Math.round(width * (800 / height))
              height = 800
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)

          // Lower quality JPEG
          setMediaPreview(canvas.toDataURL("image/jpeg", 0.6))
        }
        img.src = reader.result
      } else {
        // For videos, just use the result
        setMediaPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Check if localStorage is almost full
  const isLocalStorageAlmostFull = () => {
    try {
      let total = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          total += (key.length + (value ? value.length : 0)) * 2 // Approximate size in bytes
        }
      }

      // If using more than 4MB (localStorage limit is usually 5MB)
      return total > 4 * 1024 * 1024
    } catch (error) {
      console.error("Error checking localStorage size:", error)
      return true // Assume it's full if we can't check
    }
  }

  // Clear old localStorage data
  const clearOldLocalStorageData = () => {
    try {
      console.log("Clearing old localStorage data")

      // Clear all category caches
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith("categoryPosts_")) {
          localStorage.removeItem(key)
        }
      }

      // Keep only the 10 most recent posts in the main cache
      const cachedPosts = localStorage.getItem("posts")
      if (cachedPosts) {
        const posts = JSON.parse(cachedPosts)
        if (posts.length > 10) {
          localStorage.setItem("posts", JSON.stringify(posts.slice(0, 10)))
        }
      }
    } catch (error) {
      console.error("Error clearing old localStorage data:", error)
      // Last resort: clear everything
      try {
        localStorage.clear()
      } catch (clearError) {
        console.error("Failed to clear localStorage:", clearError)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      alert("Please log in to create a post")
      return
    }

    if (!postText.trim()) {
      alert("Please enter some text for your post")
      return
    }

    // Clear localStorage if it's getting too full
    try {
      if (isLocalStorageAlmostFull()) {
        clearOldLocalStorageData()
      }
    } catch (error) {
      console.error("Error managing localStorage:", error)
    }

    setIsSubmitting(true)

    try {
      console.log("Creating post with category:", category)

      // Create a new post object
      const newPost = {
        userId: currentUser.id,
        text: postText,
        category: category, // Include the selected category
        user: {
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          avatar: currentUser.avatar || "/placeholder.svg",
        },
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
      }

      // If media file exists, handle it
      if (mediaFile) {
        // In a real app, you would upload the file to a server/cloud storage
        // and get back a URL. For now, we'll use a placeholder or local URL

        // This is a simplified example - in a real app you'd upload the file
        // and get back a URL from your server
        const mediaUrl = mediaPreview // Using preview as URL for demo
        newPost.media = mediaUrl
        newPost.mediaType = mediaType
      }

      console.log("Sending post to service:", newPost)

      // Send post to backend
      const createdPost = await PostService.createPost(newPost)
      console.log("Received created post from service:", createdPost)

      // Validate the response
      if (!createdPost || !createdPost.id) {
        console.error("Invalid response from server:", createdPost)
        throw new Error("Invalid response from server")
      }

      // Call the callback function to update the UI
      onPostCreated(createdPost)

      // Reset form
      setPostText("")
      setMediaFile(null)
      setMediaPreview(null)
      setMediaType("")
      setCategory("art") // Reset to default category

      // Close modal
      onClose()
    } catch (error) {
      console.error("Error creating post:", error)
      alert(`Failed to create post: ${error.message || "Please try again."}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Share Your Talent</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="postText">What would you like to share?</label>
            <textarea
              id="postText"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share your latest work, achievement, or creative idea..."
              rows="4"
              required
            ></textarea>
          </div>

          {/* Category Selection Dropdown */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Add Media (Optional)</label>
            <div className="media-upload">
              <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                <i className="fas fa-image"></i> Choose Image/Video
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                style={{ display: "none" }}
              />
            </div>

            {mediaPreview && (
              <div className="media-preview">
                {mediaType === "image" ? (
                  <img src={mediaPreview || "/placeholder.svg"} alt="Preview" />
                ) : (
                  <video src={mediaPreview} controls></video>
                )}
                <button
                  type="button"
                  className="remove-media"
                  onClick={() => {
                    setMediaFile(null)
                    setMediaPreview(null)
                    setMediaType("")
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostModal
