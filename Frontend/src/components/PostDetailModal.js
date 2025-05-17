"use client"

import { useState, useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { PostService } from "../services/PostService"
import "./PostDetailModal.css"

const PostDetailModal = ({ isOpen, post, onClose }) => {
  const { currentUser } = useContext(AuthContext)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPost, setCurrentPost] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [editingReplyId, setEditingReplyId] = useState(null)
  const [editReplyText, setEditReplyText] = useState("")
  
  useEffect(() => {
    if (post) {
      setCurrentPost(post);
    }
  }, [post]);
  
  if (!isOpen || !currentPost) return null

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!currentUser) {
      alert("Please log in to comment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const comment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        text: newComment,
        timestamp: new Date().toISOString(),
        user: {
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          avatar: currentUser.avatar || "/placeholder.svg",
        },
        replies: []
      };
      
      // Send comment to backend
      const updatedPost = await PostService.addComment(currentPost.id, comment);
      
      // Update local state
      setCurrentPost(updatedPost);
      setNewComment("");
    } catch (error) {
      console.error("Error while adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
    setEditingReplyId(null);
    setReplyingTo(null);
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  }

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Send update to backend
      const updatedPost = await PostService.updateComment(
        currentPost.id, 
        commentId, 
        currentUser.id, 
        editCommentText
      );
      
      // Update local state
      setCurrentPost(updatedPost);
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    setIsSubmitting(true);
    
    try {
      // Send delete request to backend
      const updatedPost = await PostService.deleteComment(
        currentPost.id, 
        commentId, 
        currentUser.id
      );
      
      // Update local state
      setCurrentPost(updatedPost);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText("");
    setEditingCommentId(null);
    setEditingReplyId(null);
  }

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  }

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    if (!currentUser) {
      alert("Please log in to reply");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Submitting reply to comment ${commentId} in post ${currentPost.id}`);
      
      const reply = {
        userId: currentUser.id,
        text: replyText,
        timestamp: new Date().toISOString(),
        user: {
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          avatar: currentUser.avatar || "/placeholder.svg",
        }
      };
      
      console.log("Reply object:", reply);
      
      // Send reply to backend
      const updatedPost = await PostService.addReply(currentPost.id, commentId, reply);
      console.log("Received updated post:", updatedPost);
      
      // Update local state
      setCurrentPost(updatedPost);
      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error adding reply:", error);
      alert(`Failed to add reply: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEditReply = (commentId, reply) => {
    setEditingReplyId(reply.id);
    setEditReplyText(reply.text);
    setReplyingTo(commentId);
    setEditingCommentId(null);
  }

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyText("");
  }

  const handleUpdateReply = async (commentId, replyId) => {
    if (!editReplyText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Send update to backend
      const updatedPost = await PostService.updateReply(
        currentPost.id, 
        commentId, 
        replyId, 
        currentUser.id, 
        editReplyText
      );
      
      // Update local state
      setCurrentPost(updatedPost);
      setEditingReplyId(null);
      setEditReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error updating reply:", error);
      alert("Failed to update reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    
    setIsSubmitting(true);
    
    try {
      // Send delete request to backend
      const updatedPost = await PostService.deleteReply(
        currentPost.id, 
        commentId, 
        replyId, 
        currentUser.id
      );
      
      // Update local state
      setCurrentPost(updatedPost);
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert("Failed to delete reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Check if user is the owner of a comment or reply
  const isCommentOwner = (userId) => {
    return currentUser && currentUser.id === userId;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        
        <div className="post-detail-content">
          <div className="post-detail-left">
            {currentPost.mediaType === "image" && (
              <img 
                src={currentPost.media || "/placeholder.svg"} 
                alt="Post content" 
                className="detail-media" 
              />
            )}
            
            {currentPost.mediaType === "video" && (
              <video 
                src={currentPost.media} 
                controls 
                className="detail-media"
              ></video>
            )}
          </div>
          
          <div className="post-detail-right">
            <div className="detail-header">
              <img 
                src={currentPost.user.avatar || "/placeholder.svg"} 
                alt={currentPost.user.name} 
                className="detail-avatar" 
              />
              <div className="detail-user-info">
                <h3 className="detail-username">{currentPost.user.name}</h3>
                <p className="detail-timestamp">{formatTimestamp(currentPost.timestamp)}</p>
              </div>
            </div>
            
            <div className="detail-content">
              <p className="detail-text">{currentPost.text}</p>
            </div>
            
            <div className="detail-stats">
              <div className="stat-item">
                <i className="fas fa-heart"></i>
                <span>{currentPost.likes} likes</span>
              </div>
              <div className="stat-item">
                <i className="fas fa-comment"></i>
                <span>{currentPost.comments?.length || 0} comments</span>
              </div>
            </div>
            
            <div className="detail-comments">
              <h4>Comments</h4>
              
              <form className="detail-comment-form" onSubmit={handleAddComment}>
                <input
                  type="text"
                  placeholder={currentUser ? "Add a comment as " + currentUser.firstName : "Add a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="detail-comment-input"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="detail-comment-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </form>
              
              <div className="detail-comments-list">
                {currentPost.comments && currentPost.comments.length > 0 ? (
                  currentPost.comments.map((comment) => (
                    <div key={comment.id} className="detail-comment-container">
                      <div className="detail-comment">
                        <img
                          src={comment.user.avatar || "/placeholder.svg"}
                          alt={comment.user.name}
                          className="detail-comment-avatar"
                        />
                        <div className="detail-comment-content">
                          <div className="detail-comment-header">
                            <h4 className="detail-comment-user">{comment.user.name}</h4>
                            <span className="detail-comment-timestamp">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                          </div>
                          
                          {editingCommentId === comment.id ? (
                            <div className="detail-edit-comment-form">
                              <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className="detail-edit-comment-input"
                                disabled={isSubmitting}
                              />
                              <div className="detail-edit-actions">
                                <button 
                                  type="button" 
                                  className="detail-cancel-edit" 
                                  onClick={handleCancelEditComment}
                                  disabled={isSubmitting}
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="button" 
                                  className="detail-save-edit"
                                  onClick={() => handleUpdateComment(comment.id)}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="detail-comment-text">{comment.text}</p>
                              <div className="detail-comment-actions">
                                <button 
                                  className="detail-reply-button"
                                  onClick={() => handleReply(comment.id)}
                                >
                                  Reply
                                </button>
                                
                                {isCommentOwner(comment.userId) && (
                                  <>
                                    <button 
                                      className="detail-edit-button"
                                      onClick={() => handleEditComment(comment)}
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      className="detail-delete-button"
                                      onClick={() => handleDeleteComment(comment.id)}
                                    >
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
                        <div className="detail-replies-container">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="detail-reply">
                              <img
                                src={reply.user.avatar || "/placeholder.svg"}
                                alt={reply.user.name}
                                className="detail-reply-avatar"
                              />
                              <div className="detail-reply-content">
                                <div className="detail-reply-header">
                                  <h4 className="detail-reply-user">{reply.user.name}</h4>
                                  <span className="detail-reply-timestamp">{formatTimestamp(reply.timestamp)}</span>
                                </div>
                                
                                {editingReplyId === reply.id ? (
                                  <div className="detail-edit-reply-form">
                                    <textarea
                                      value={editReplyText}
                                      onChange={(e) => setEditReplyText(e.target.value)}
                                      className="detail-edit-reply-input"
                                      disabled={isSubmitting}
                                    />
                                    <div className="detail-edit-actions">
                                      <button 
                                        type="button" 
                                        className="detail-cancel-edit" 
                                        onClick={handleCancelEditReply}
                                        disabled={isSubmitting}
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        type="button" 
                                        className="detail-save-edit"
                                        onClick={() => handleUpdateReply(comment.id, reply.id)}
                                        disabled={isSubmitting}
                                      >
                                        {isSubmitting ? "Saving..." : "Save"}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="detail-reply-text">{reply.text}</p>
                                    
                                    {isCommentOwner(reply.userId) && (
                                      <div className="detail-reply-actions">
                                        <button 
                                          className="detail-edit-button"
                                          onClick={() => handleEditReply(comment.id, reply)}
                                        >
                                          Edit
                                        </button>
                                        <button 
                                          className="detail-delete-button"
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
                        <div className="detail-reply-form-container">
                          <form className="detail-reply-form" onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                            <input
                              type="text"
                              placeholder={currentUser ? "Reply as " + currentUser.firstName : "Add a reply..."}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="detail-reply-input"
                              autoFocus
                              disabled={isSubmitting}
                            />
                            <div className="detail-reply-form-actions">
                              <button 
                                type="button" 
                                className="detail-cancel-reply" 
                                onClick={handleCancelReply}
                                disabled={isSubmitting}
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="detail-submit-reply"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Sending..." : "Reply"}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetailModal