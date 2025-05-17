"use client"

import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { PostService } from "../services/PostService"
import "./TalentPost.css"

const TalentPost = ({ post, onViewDetails }) => {
  const { currentUser } = useContext(AuthContext)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([])
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [editingReplyId, setEditingReplyId] = useState(null)
  const [editReplyText, setEditReplyText] = useState("")
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)

  // Load comments from post when component mounts or post changes
  useEffect(() => {
    if (post && post.comments) {
      setComments(post.comments)
    }
  }, [post])

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please log in to like posts")
      return
    }

    setIsLikeAnimating(true)
    setTimeout(() => setIsLikeAnimating(false), 1000)

    try {
      const updatedPost = await PostService.likePost(post.id, currentUser.id)
      setLikesCount(updatedPost.likes)
      setIsLiked(updatedPost.likedBy.includes(currentUser.id))
    } catch (error) {
      console.error("Error liking post:", error)
      // Fallback to local state if API fails
      if (isLiked) {
        setLikesCount(likesCount - 1)
      } else {
        setLikesCount(likesCount + 1)
      }
      setIsLiked(!isLiked)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    if (!currentUser) {
      alert("Please log in to comment")
      return
    }

    setIsSubmitting(true)

    try {
      const comment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        text: newComment,
        timestamp: new Date().toISOString(),
        user: {
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          avatar: currentUser.avatar || "",
        },
        replies: [],
      }

      // Send comment to backend
      const updatedPost = await PostService.addComment(post.id, comment)

      // Update local state with the latest comments from the server
      setComments(updatedPost.comments)
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.text)
    setEditingReplyId(null)
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentText("")
  }

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return

    setIsSubmitting(true)

    try {
      // Send update to backend
      const updatedPost = await PostService.updateComment(post.id, commentId, currentUser.id, editCommentText)

      // Update local state
      setComments(updatedPost.comments)
      setEditingCommentId(null)
      setEditCommentText("")
    } catch (error) {
      console.error("Error updating comment:", error)
      alert("Failed to update comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    setIsSubmitting(true)

    try {
      // Send delete request to backend
      const updatedPost = await PostService.deleteComment(post.id, commentId, currentUser.id)

      // Update local state
      setComments(updatedPost.comments)
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = (commentId) => {
    setReplyingTo(commentId)
    setReplyText("")
    setEditingCommentId(null)
    setEditingReplyId(null)
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyText("")
  }

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault()
    if (!replyText.trim()) return

    if (!currentUser) {
      alert("Please log in to reply")
      return
    }

    setIsSubmitting(true)

    try {
      console.log(`Submitting reply to comment ${commentId} in post ${post.id}`)

      const reply = {
        userId: currentUser.id,
        text: replyText,
        timestamp: new Date().toISOString(),
        user: {
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          avatar: currentUser.avatar || "",
        },
      }

      console.log("Reply object:", reply)

      // Send reply to backend
      const updatedPost = await PostService.addReply(post.id, commentId, reply)
      console.log("Received updated post:", updatedPost)

      // Update local state with the latest comments from the server
      setComments(updatedPost.comments)
      setReplyingTo(null)
      setReplyText("")
    } catch (error) {
      console.error("Error adding reply:", error)
      alert(`Failed to add reply: ${error.message}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReply = (commentId, reply) => {
    setEditingReplyId(reply.id)
    setEditReplyText(reply.text)
    setReplyingTo(commentId)
    setEditingCommentId(null)
  }

  const handleCancelEditReply = () => {
    setEditingReplyId(null)
    setEditReplyText("")
  }

  const handleUpdateReply = async (commentId, replyId) => {
    if (!editReplyText.trim()) return

    setIsSubmitting(true)

    try {
      // Send update to backend
      const updatedPost = await PostService.updateReply(post.id, commentId, replyId, currentUser.id, editReplyText)

      // Update local state
      setComments(updatedPost.comments)
      setEditingReplyId(null)
      setEditReplyText("")
      setReplyingTo(null)
    } catch (error) {
      console.error("Error updating reply:", error)
      alert("Failed to update reply. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return

    setIsSubmitting(true)

    try {
      // Send delete request to backend
      const updatedPost = await PostService.deleteReply(post.id, commentId, replyId, currentUser.id)

      // Update local state
      setComments(updatedPost.comments)
    } catch (error) {
      console.error("Error deleting reply:", error)
      alert("Failed to delete reply. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Check if current user has liked this post
  useEffect(() => {
    if (currentUser && post.likedBy) {
      setIsLiked(post.likedBy.includes(currentUser.id))
    }
  }, [currentUser, post.likedBy])

  // Check if user is the owner of a comment or reply
  const isCommentOwner = (userId) => {
    return currentUser && currentUser.id === userId
  }

  return (
    <div className="talent-post">
      <div className="post-header">
        <div className="user-avatar">
          {post.user.avatar ? (
            <img src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
          ) : (
            post.user.name.charAt(0)
          )}
        </div>
        <div className="post-info">
          <h3 className="user-name">{post.user.name}</h3>
          <p className="post-timestamp">{formatTimestamp(post.timestamp)}</p>
        </div>
      </div>

      <div className="post-content">
        <p className="post-text">{post.text}</p>

        {post.mediaType === "image" && (
          <img src={post.media || "/placeholder.svg"} alt="Post content" className="post-media post-image" />
        )}

        {post.mediaType === "video" && <video src={post.media} controls className="post-media post-video"></video>}
      </div>

      <div className="post-actions-container">
        <div className="post-actions">
          <button
            className={`action-button like-button ${isLiked ? "liked" : ""} ${isLikeAnimating ? "animating" : ""}`}
            onClick={handleLike}
            aria-label="Like post"
          >
            <div className="action-icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="action-icon"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {isLiked && <div className="like-particles"></div>}
            </div>
            <span className="action-count">{likesCount}</span>
          </button>

          <button
            className={`action-button comment-button ${showComments ? "active" : ""}`}
            onClick={() => setShowComments(!showComments)}
            aria-label="Show comments"
          >
            <div className="action-icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="action-icon"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <span className="action-count">{comments.length}</span>
          </button>

          <button className="action-button share-button" aria-label="Share post">
            <div className="action-icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="action-icon"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
          </button>
        </div>

        <button
          className="detail-button"
          onClick={() => onViewDetails && onViewDetails(post)}
          aria-label="View details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="detail-icon"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Detail</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form className="comment-form" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder={currentUser ? "Add a comment as " + currentUser.firstName : "Add a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
              disabled={isSubmitting}
            />
            <button type="submit" className="comment-submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </form>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-container">
                <div className="comment">
                  <div className="comment-avatar">
                    {comment.user.avatar ? (
                      <img src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                    ) : (
                      comment.user.name.charAt(0)
                    )}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <h4 className="comment-user">{comment.user.name}</h4>
                      <span className="comment-timestamp">{formatTimestamp(comment.timestamp)}</span>
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="edit-comment-form">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="edit-comment-input"
                          disabled={isSubmitting}
                        />
                        <div className="edit-actions">
                          <button
                            type="button"
                            className="cancel-edit"
                            onClick={handleCancelEditComment}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="save-edit"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="comment-text">{comment.text}</p>
                        <div className="comment-actions">
                          <button className="reply-button" onClick={() => handleReply(comment.id)}>
                            Reply
                          </button>

                          {isCommentOwner(comment.userId) && (
                            <>
                              <button className="edit-button" onClick={() => handleEditComment(comment)}>
                                Edit
                              </button>
                              <button className="delete-button" onClick={() => handleDeleteComment(comment.id)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Replies to this comment */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="replies-container">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply">
                        <div className="reply-avatar">
                          {reply.user.avatar ? (
                            <img src={reply.user.avatar || "/placeholder.svg"} alt={reply.user.name} />
                          ) : (
                            reply.user.name.charAt(0)
                          )}
                        </div>
                        <div className="reply-content">
                          <div className="reply-header">
                            <h4 className="reply-user">{reply.user.name}</h4>
                            <span className="reply-timestamp">{formatTimestamp(reply.timestamp)}</span>
                          </div>

                          {editingReplyId === reply.id ? (
                            <div className="edit-reply-form">
                              <textarea
                                value={editReplyText}
                                onChange={(e) => setEditReplyText(e.target.value)}
                                className="edit-reply-input"
                                disabled={isSubmitting}
                              />
                              <div className="edit-actions">
                                <button
                                  type="button"
                                  className="cancel-edit"
                                  onClick={handleCancelEditReply}
                                  disabled={isSubmitting}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="save-edit"
                                  onClick={() => handleUpdateReply(comment.id, reply.id)}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="reply-text">{reply.text}</p>

                              {isCommentOwner(reply.userId) && (
                                <div className="reply-actions">
                                  <button className="edit-button" onClick={() => handleEditReply(comment.id, reply)}>
                                    Edit
                                  </button>
                                  <button
                                    className="delete-button"
                                    onClick={() => handleDeleteReply(comment.id, reply.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                {replyingTo === comment.id && !editingReplyId && (
                  <div className="reply-form-container">
                    <form className="reply-form" onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                      <input
                        type="text"
                        placeholder={currentUser ? "Reply as " + currentUser.firstName : "Add a reply..."}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="reply-input"
                        autoFocus
                        disabled={isSubmitting}
                      />
                      <div className="reply-form-actions">
                        <button
                          type="button"
                          className="cancel-reply"
                          onClick={handleCancelReply}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="submit-reply" disabled={isSubmitting}>
                          {isSubmitting ? "Sending..." : "Reply"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TalentPost
