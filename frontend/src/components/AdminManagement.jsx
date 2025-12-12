import { useState, useEffect } from 'react'
import { getAllUsers, updateUserRole, deleteUser } from '../api/user'
import { useAuth } from '../hooks/authContext'
import logger from '../utils/logger'
import '../styles/adminManagement.css'

const AdminManagement = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async (search = '') => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllUsers(search)
      logger.log('Users loaded from API:', data.users)
      setUsers(data.users)
    } catch (error) {
      logger.error('Error loading users:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadUsers(searchTerm)
  }

  const handleRoleChange = async (userId, currentRole) => {
    logger.log('handleRoleChange called:', { userId, currentRole, currentUserId: user?.id })

    if (!userId || userId === 'undefined') {
      setError('Invalid user ID')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (String(userId) === String(user?.id)) {
      setError('You cannot change your own role')
      setTimeout(() => setError(''), 3000)
      return
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const confirmMessage = `Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} this user?`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setError('')
      setSuccessMessage('')
      await updateUserRole(userId, newRole)
      setSuccessMessage(`User role updated to ${newRole}`)
      setTimeout(() => setSuccessMessage(''), 3000)
      // Reload users list
      loadUsers(searchTerm)
    } catch (error) {
      logger.error('Error updating user role:', error)
      setError(error.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    loadUsers('')
  }

  const handleDeleteUser = async (userId, username) => {
    if (!userId || userId === 'undefined') {
      setError('Invalid user ID')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (String(userId) === String(user?.id)) {
      setError('You cannot delete your own account')
      setTimeout(() => setError(''), 3000)
      return
    }

    const confirmMessage = `Are you sure you want to DELETE user "${username}"? This action cannot be undone.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setError('')
      setSuccessMessage('')
      await deleteUser(userId)
      setSuccessMessage(`User "${username}" deleted successfully`)
      setTimeout(() => setSuccessMessage(''), 3000)
      // Reload users list
      loadUsers(searchTerm)
    } catch (error) {
      logger.error('Error deleting user:', error)
      setError(error.message)
      setTimeout(() => setError(''), 3000)
    }
  }

  if (loading) {
    return <div className="admin-loading">Loading users...</div>
  }

  return (
    <div className="admin-management">
      <div className="admin-header">
        <h2>User Management</h2>
        <p className="admin-subtitle">Manage user roles and permissions</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
          {searchTerm && (
            <button type="button" onClick={clearSearch} className="clear-btn">
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="users-table-container">
        {users.length === 0 ? (
          <p className="no-users">No users found</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span className="username">
                      {u.username}
                      {String(u.id) === String(user?.id) && <span className="you-badge">(You)</span>}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.root}`}>
                      {u.root === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-buttons">
                      <button
                        onClick={() => handleRoleChange(u.id, u.root)}
                        className={`role-toggle-btn ${u.root === 'admin' ? 'demote' : 'promote'}`}
                        disabled={String(u.id) === String(user?.id)}
                      >
                        {u.root === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="delete-btn"
                        disabled={String(u.id) === String(user?.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="users-summary">
        <p>Total users: {users.length}</p>
        <p>Admins: {users.filter(u => u.root === 'admin').length}</p>
        <p>Regular users: {users.filter(u => u.root === 'user').length}</p>
      </div>
    </div>
  )
}

export default AdminManagement
