"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Navbar.css"
import { AuthContext } from "../context/AuthContext"
import { NotificationContext } from "../context/NotificationContext"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const notificationsRef = useRef(null)
  
  // AuthContext එක ඇති බව පරීක්ෂා කිරීම
  const auth = useContext(AuthContext)
  const currentUser = auth ? auth.currentUser : null
  const logout = auth ? auth.logout : () => {}

  // NotificationContext
  const notificationContext = useContext(NotificationContext)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = notificationContext || {
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {},
    markAllAsRead: () => {}
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
    setIsNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    setIsDropdownOpen(false)
  }

  const handleLoginClick = () => {
    navigate('/login')
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsDropdownOpen(false)
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setIsDropdownOpen(false)
  }

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Navigate to the post
    navigate(`/post/${notification.postId}`)
    setIsNotificationsOpen(false)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Craftora</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/explore" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Explore
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/marketplace" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Marketplace
            </Link>
          </li>
        </ul>

        <div className="nav-search">
          <input type="text" placeholder="Search talents, products..." />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="nav-auth">
          {currentUser ? (
            <>
              {/* Notification Bell */}
              <div className="notification-bell-container" ref={notificationsRef}>
                <div className="notification-bell" onClick={toggleNotifications}>
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </div>
                
                {/* Notifications Dropdown */}
                <div className={`notifications-dropdown ${isNotificationsOpen ? 'active' : ''}`}>
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <button 
                      className="mark-all-read" 
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="notifications-list">
                    {notifications && notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-avatar">
                            {notification.senderAvatar ? (
                              <img src={notification.senderAvatar || "/placeholder.svg"} alt={notification.senderName} />
                            ) : (
                              <div className="avatar-letter">{notification.senderName.charAt(0)}</div>
                            )}
                            <div className="notification-type-icon">
                              {notification.type === 'LIKE' && <i className="fas fa-heart"></i>}
                              {notification.type === 'COMMENT' && <i className="fas fa-comment"></i>}
                              {notification.type === 'REPLY' && <i className="fas fa-reply"></i>}
                            </div>
                          </div>
                          <div className="notification-content">
                            <p className="notification-text">{notification.content}</p>
                            <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          {!notification.read && <div className="unread-indicator"></div>}
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">No notifications yet</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="user-profile" ref={dropdownRef}>
                <div className="user-avatar" onClick={toggleDropdown}>
                  {currentUser.firstName ? currentUser.firstName.charAt(0) : '?'}
                </div>
                <div className={`user-dropdown ${isDropdownOpen ? 'active' : ''}`}>
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      
                      <div className="dropdown-name">
                        <p className="user-fullname">{currentUser.firstName} {currentUser.lastName}</p>
                        <p className="user-email">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={handleProfileClick}>
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}>
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <button className="login-btn" onClick={handleLoginClick}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
