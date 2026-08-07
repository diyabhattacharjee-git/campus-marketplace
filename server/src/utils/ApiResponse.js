/**
 * Every successful response from this API has the same shape:
 *   { success: true, message, data }
 * Paired with ApiError's error shape (see errorHandler.js), the frontend's
 * axios interceptor (client) can rely on one consistent contract instead of
 * guessing per-endpoint whether data is nested, an array, or bare.
 */
export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}
