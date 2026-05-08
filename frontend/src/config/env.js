export const API_URL = process.env.REACT_APP_API_URL; // Đã bỏ fallback || 'http://localhost:5000/api'
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL; // Đã bỏ fallback || 'http://localhost:5000'
export const ENV = process.env.REACT_APP_ENV || 'development';
export const IS_PRODUCTION = ENV === 'production';
export const IS_DEVELOPMENT = ENV === 'development';
