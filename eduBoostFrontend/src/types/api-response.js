/**
 * @typedef {Object} Pagination
 * @property {number} pageNo
 * @property {number} pageSize
 * @property {number} totalElements
 * @property {number} totalPages
 */

/**
 * @typedef {Object} ApiResponses
 * @property {*} [data]
 * @property {number} [code]
 * @property {number} [statusCode]
 * @property {string} [message]
 * @property {Pagination} [pagination]
 */

/**
 * @typedef {Object} BackendPaginatedResponse
 * @property {Array<*>} data
 * @property {Pagination} pagination
 */

/**
 * Create error response
 * @param {string} message - Error message
 * @returns {ApiResponses}
 */
export function errorResponse(message) {
    return {
        data: null,
        code: 500,
        statusCode: 500,
        message: message
    };
}