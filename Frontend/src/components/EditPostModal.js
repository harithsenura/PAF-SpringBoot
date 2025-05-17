"use client"

import { useState, useRef, useEffect } from "react"
import "./CreatePostModal.css" // Reuse the same styles

const EditPostModal = ({ isOpen, post, onClose, onUpdate }) => {
  const [text, setText] = useState("")
  const [media, setMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [mediaType, setMediaType] = useState("image")
  const [category, setCategory] = useState("art")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  // Categories list - same as in CreatePostModal
  const categories = [
    { id: "art", name: "Art & Design" },
    { id: "music", name: "Music" },
    { id: "photography", name: "Photography" },
    { id: "crafts", name: "Crafts" },
    { id: "fashion", name: "Fashion" },
    { id: "writing", name: "Writing" },
  ]

  // Initialize form with post data when modal opens
  useEffect(() => {
    if (isOpen && post) {
      setText(post.text || "")
      setMediaPreview(post.media || null)
      setMediaType(post.mediaType || "image")
      setCategory(post.category || "art")
      setUploadProgress(0)
    }
  }, [isOpen, post])

  if (!isOpen) return null

  const handleMediaChange = (e) => {
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

    setMedia(file)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() && !mediaPreview) return

    setIsSubmitting(true)

    // Simulate progress updates
    const updateProgress = () => {
      setUploadProgress((prev) => {
        const increment = Math.floor(Math.random() * 15) + 5 // Random increment between 5-20%
        return Math.min(prev + increment, 90) // Cap at 90% until complete
      })
    }

    // Start progress updates
    const progressInterval = setInterval(updateProgress, 300)

    try {
      // In a real app, you would upload the media to a server
      // and get back a URL to store in the database
      const mediaUrl = media ? mediaPreview : post.media

      const updatedPost = {
        ...post,
        text,
        media: mediaUrl,
        mediaType,
        category,
        updatedAt: new Date().toISOString(),
      }

      // Simulate network delay for better UX feedback
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Wait a moment to show 100% before closing
      setTimeout(() => {
        onUpdate(updatedPost)
      }, 300)
    } catch (error) {
      console.error("Error updating post:", error)
      clearInterval(progressInterval)
      setUploadProgress(0)
      alert(`Failed to update post: ${error.message || "Please try again."}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Post</h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="postText">What would you like to share?</label>
            <textarea
              id="postText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your latest work, achievement, or creative idea..."
              rows="4"
              required={!mediaPreview}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Media</label>
            <div className="media-upload">
              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={isSubmitting}
              >
                <i className="fas fa-image"></i> {mediaPreview ? "Change Media" : "Add Image/Video"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaChange}
                accept="image/*,video/*"
                style={{ display: "none" }}
                disabled={isSubmitting}
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
                    setMedia(null)
                    setMediaPreview(null)
                  }}
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {isSubmitting && (
            <div className="upload-progress-container">
              <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              <div className="upload-progress-text">
                {uploadProgress < 100 ? `Updating... ${uploadProgress}%` : "Processing..."}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting || (!text.trim() && !mediaPreview)}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPostModal
