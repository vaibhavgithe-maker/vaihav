export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return { valid: false, message: `Name must be at least 20 characters (currently ${trimmed.length})` };
  }
  if (trimmed.length > 60) {
    return { valid: false, message: `Name must not exceed 60 characters (currently ${trimmed.length})` };
  }
  return { valid: true };
}

export function validateAddress(address: string): ValidationResult {
  if (!address || typeof address !== 'string') {
    return { valid: false, message: 'Address is required' };
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: 'Address cannot be empty' };
  }
  if (trimmed.length > 400) {
    return { valid: false, message: `Address must not exceed 400 characters (currently ${trimmed.length})` };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8 || password.length > 16) {
    return { valid: false, message: `Password must be between 8 and 16 characters (currently ${password.length})` };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (e.g. !@#$%^&*)' };
  }
  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  const trimmed = email.trim();
  // Standard RFC 5322 compatible regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address (e.g. name@example.com)' };
  }
  return { valid: true };
}

export function validateRating(rating: number): ValidationResult {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return { valid: false, message: 'Rating must be a number' };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { valid: false, message: 'Rating must be an integer between 1 and 5' };
  }
  return { valid: true };
}
