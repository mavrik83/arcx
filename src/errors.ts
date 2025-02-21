/**
 * @module errors
 * This module provides error classes and interfaces
 * for handling fetch-related errors in ArcX.
 */

/**
 * A base interface for fetch-related errors.
 */
export interface FetchError extends Error {
  /** HTTP status code, if applicable (e.g., 404, 500). */
  status?: number;
  /** Raw text of the response body, if applicable. */
  responseBody?: string;
}

/**
 * An error class representing HTTP error responses (4xx, 5xx).
 */
export class HTTPError extends Error implements FetchError {
  status?: number;
  responseBody?: string;

  constructor(message: string, status?: number, responseBody?: string) {
    super(message);
    this.name = "HTTPError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

/**
 * An error class representing network or other unexpected errors
 * that are not HTTP errors.
 */
export class NetworkError extends Error implements FetchError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}
