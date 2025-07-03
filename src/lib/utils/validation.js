/**
 * Validation utilities for form data and user input
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength score
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 0 };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long', strength: 0 };
  }
  
  let strength = 0;
  const checks = [
    { regex: /[a-z]/, message: 'lowercase letter' },
    { regex: /[A-Z]/, message: 'uppercase letter' },
    { regex: /[0-9]/, message: 'number' },
    { regex: /[^a-zA-Z0-9]/, message: 'special character' }
  ];
  
  const missing = [];
  checks.forEach(check => {
    if (check.regex.test(password)) {
      strength += 25;
    } else {
      missing.push(check.message);
    }
  });
  
  // Length bonus
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  
  // Common password penalty
  if (isCommonPassword(password)) {
    strength = Math.max(0, strength - 30);
  }
  
  const isValid = strength >= 50;
  const error = isValid ? null : `Password should include: ${missing.join(', ')}`;
  
  return { isValid, error, strength: Math.min(100, strength) };
}

/**
 * Validate name input
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} Validation result
 */
export function validateName(name, fieldName = 'Name') {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u27F0-\u27FF\u2800-\u28FF\u2900-\u297F\u2980-\u29FF\u2A00-\u2AFF\u2B00-\u2BFF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E00-\u2E7F\u2E80-\u2EFF\u2F00-\u2FDF\u2FE0-\u2FEF\u2FF0-\u2FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31A0-\u31BF\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA700-\uA71F\uA720-\uA7FF\uA800-\uA82F\uA830-\uA83F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE10-\uFE1F\uFE20-\uFE2F\uFE30-\uFE4F\uFE50-\uFE6F\uFE70-\uFEFF\uFF00-\uFFEF\s\-']+$/;
  
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate date input
 * @param {string} date - Date to validate (YYYY-MM-DD format)
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateDate(date, options = {}) {
  const { 
    required = false, 
    minAge = null, 
    maxAge = null, 
    future = false,
    fieldName = 'Date'
  } = options;
  
  if (!date) {
    return { isValid: !required, error: required ? `${fieldName} is required` : null };
  }
  
  // Check date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { isValid: false, error: `${fieldName} must be in YYYY-MM-DD format` };
  }
  
  const inputDate = new Date(date);
  const currentDate = new Date();
  
  // Check if date is valid
  if (isNaN(inputDate.getTime())) {
    return { isValid: false, error: `${fieldName} is not a valid date` };
  }
  
  // Check future date restriction
  if (!future && inputDate > currentDate) {
    return { isValid: false, error: `${fieldName} cannot be in the future` };
  }
  
  // Check age restrictions
  if (minAge !== null || maxAge !== null) {
    const age = Math.floor((currentDate - inputDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (minAge !== null && age < minAge) {
      return { isValid: false, error: `Age must be at least ${minAge} years` };
    }
    
    if (maxAge !== null && age > maxAge) {
      return { isValid: false, error: `Age must be less than ${maxAge} years` };
    }
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validatePhone(phone, options = {}) {
  const { required = false, international = true } = options;
  
  if (!phone) {
    return { isValid: !required, error: required ? 'Phone number is required' : null };
  }
  
  // Remove spaces, hyphens, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // International format validation
  if (international) {
    const internationalRegex = /^\+?[1-9]\d{1,14}$/;
    if (!internationalRegex.test(cleanPhone)) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
  } else {
    // US format validation
    const usRegex = /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    if (!usRegex.test(cleanPhone)) {
      return { isValid: false, error: 'Please enter a valid US phone number' };
    }
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateFile(file, options = {}) {
  const {
    required = false,
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;
  
  if (!file) {
    return { isValid: !required, error: required ? 'File is required' : null };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { isValid: false, error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}` };
    }
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate text input
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateText(text, options = {}) {
  const {
    required = false,
    minLength = 0,
    maxLength = 1000,
    pattern = null,
    fieldName = 'Text'
  } = options;
  
  if (!text || text.trim().length === 0) {
    return { isValid: !required, error: required ? `${fieldName} is required` : null };
  }
  
  const trimmedText = text.trim();
  
  if (trimmedText.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }
  
  if (trimmedText.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters long` };
  }
  
  if (pattern && !pattern.test(trimmedText)) {
    return { isValid: false, error: `${fieldName} format is invalid` };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export function validateForm(formData, rules) {
  const errors = {};
  let isValid = true;
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    let result = { isValid: true, error: null };
    
    switch (rule.type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'name':
        result = validateName(value, rule.fieldName);
        break;
      case 'date':
        result = validateDate(value, rule.options);
        break;
      case 'phone':
        result = validatePhone(value, rule.options);
        break;
      case 'file':
        result = validateFile(value, rule.options);
        break;
      case 'text':
        result = validateText(value, rule.options);
        break;
      default:
        if (rule.validator && typeof rule.validator === 'function') {
          result = rule.validator(value);
        }
    }
    
    if (!result.isValid) {
      errors[field] = result.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  
  // Basic XSS prevention - remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Check if password is commonly used
 * @param {string} password - Password to check
 * @returns {boolean} True if password is common
 */
function isCommonPassword(password) {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'shadow', 'football', 'baseball',
    'superman', 'michael', 'jordan', 'harley', 'ranger'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Format validation error messages
 * @param {Object} errors - Validation errors
 * @returns {string} Formatted error message
 */
export function formatValidationErrors(errors) {
  if (!errors || Object.keys(errors).length === 0) {
    return '';
  }
  
  const errorMessages = Object.values(errors).filter(error => error);
  
  if (errorMessages.length === 1) {
    return errorMessages[0];
  }
  
  return `Please fix the following errors:\n• ${errorMessages.join('\n• ')}`;
}

export default {
  validateEmail,
  validatePassword,
  validateName,
  validateDate,
  validatePhone,
  validateFile,
  validateText,
  validateForm,
  sanitizeHtml,
  formatValidationErrors
};
