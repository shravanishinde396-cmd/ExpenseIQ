/**
 * Class representing standard API response payload.
 */
class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {any} data
   * @param {string} [message="Success"]
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
