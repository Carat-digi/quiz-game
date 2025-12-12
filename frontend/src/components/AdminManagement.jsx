import { useState, useEffect } from 'react'
import { getAllUsers, updateUserRole, deleteUser } from '../api/user'
import { useAuth } from '../hooks/authContext'
import logger from '../utils/logger'
import '../styles/adminManagement.css'
import ConfirmDialog from './ConfirmDialog'

const AdminManagement = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogOptions, setDialogOptions] = useState({})

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

  const handleRoleChange = async (userId, currentRole, username) => {
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

    const isPromote = currentRole !== 'admin'
    const newRole = isPromote ? 'admin' : 'user'

    // Show confirmation dialog (use explicit isPromote for clarity)
    setDialogOptions({
      title: isPromote ? 'Confirm promotion' : 'Confirm demotion',
      message: `Are you sure you want to ${isPromote ? 'promote' : 'demote'} user "${username || ''}"?`,
      details: [],
      danger: !isPromote,
      confirmLabel: isPromote ? 'Promote' : 'Demote',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          setError('')
          setSuccessMessage('')
          await updateUserRole(userId, newRole)
          setSuccessMessage(`User role updated to ${newRole}`)
          setTimeout(() => setSuccessMessage(''), 3000)
          loadUsers(searchTerm)
        } catch (err) {
          logger.error('Error updating user role:', err)
          setError(err.message || 'Error updating role')
          setTimeout(() => setError(''), 3000)
        }
      }
    })
    setDialogOpen(true)
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

    setDialogOptions({
      title: 'Confirm deletion',
      message: `Are you sure you want to delete user "${username}"?`,
      details: ['Deleting the account is irreversible: all related data will be lost.'],
      danger: true,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          setError('')
          setSuccessMessage('')
          await deleteUser(userId)
          setSuccessMessage(`User "${username}" deleted successfully`)
          setTimeout(() => setSuccessMessage(''), 3000)
          loadUsers(searchTerm)
        } catch (err) {
          logger.error('Error deleting user:', err)
          setError(err.message || 'Error deleting user')
          setTimeout(() => setError(''), 3000)
        }
      }
    })
    setDialogOpen(true)
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
                        onClick={() => handleRoleChange(u.id, u.root, u.username)}
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
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        {...dialogOptions}
      />
    </div>
  )
}

export default AdminManagement
