// Auth types and interfaces converted to JSDoc comments

/**
 * @typedef {Object} Role
 * @property {number} roleId
 * @property {string} roleName
 * @property {Array<Permission>} permissions
 */

/**
 * @typedef {Object} Permission
 * @property {number} permissionId
 * @property {string} permissionName
 */

/**
 * @typedef {Object} UserDetails
 * @property {number} userId
 * @property {string} username
 * @property {string} fullName
 * @property {string} email
 * @property {string} phoneNumber
 * @property {string} identityCard
 * @property {'MALE'|'FEMALE'|'OTHER'} gender
 * @property {string} dateOfBirth - ISO string
 * @property {string} address
 * @property {string} avatarUrl
 * @property {number} memberScore
 * @property {'ACTIVE'|'INACTIVE'|'BANNED'|string} status
 * @property {boolean} deleted
 * @property {Array<Role>} roles
 * @property {Array<Permission>} [permissions]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {UserDetails|null} user
 * @property {Function} setUser
 */

/**
 * @typedef {Object} RegisterFormData
 * @property {string} username
 * @property {string} email
 * @property {string} phone
 * @property {string} password
 * @property {string} confirmPassword
 */

/**
 * @typedef {Object} RegisterResponse
 * @property {boolean} success
 */

/**
 * @typedef {Object} RegisterFormProps
 * @property {Function} onClose
 * @property {Function} onSwitchToLogin
 * @property {boolean} [isPopup]
 */

/**
 * @typedef {Object} LoginFormData
 * @property {string} username
 * @property {string} password
 * @property {boolean} rememberMe
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {Array<Role>} roles
 */

export {};
