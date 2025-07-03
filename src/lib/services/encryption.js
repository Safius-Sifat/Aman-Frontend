/**
 * Encryption service for secure handling of biometric data
 * Uses Web Crypto API for client-side encryption
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Generate encryption key
 * @returns {Promise<CryptoKey>} Encryption key
 */
async function generateKey() {
  return await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive key from password
 * @param {string} password - Password to derive key from
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} Derived key
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data
 * @param {any} data - Data to encrypt
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<string>} Encrypted data as base64 string
 */
async function encryptData(data, key = null) {
  try {
    // Use default key if none provided
    if (!key) {
      key = await getOrCreateDefaultKey();
    }

    // Convert data to string if not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(dataString);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64
    return arrayBufferToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data
 * @param {string} encryptedData - Encrypted data as base64 string
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<any>} Decrypted data
 */
async function decryptData(encryptedData, key = null) {
  try {
    // Use default key if none provided
    if (!key) {
      key = await getOrCreateDefaultKey();
    }

    // Convert from base64
    const combined = base64ToArrayBuffer(encryptedData);
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);

    // Decrypt data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      encrypted
    );

    // Convert back to string
    const decoder = new TextDecoder();
    const dataString = decoder.decode(decryptedData);

    // Try to parse as JSON, return as string if not valid JSON
    try {
      return JSON.parse(dataString);
    } catch {
      return dataString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt biometric data with additional security
 * @param {Blob|File} biometricData - Biometric data to encrypt
 * @returns {Promise<string>} Encrypted biometric data
 */
export async function encryptBiometricData(biometricData) {
  try {
    // Convert blob to array buffer
    const arrayBuffer = await biometricData.arrayBuffer();
    
    // Generate unique key for this biometric data
    const key = await generateKey();
    
    // Generate salt for key derivation
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Create encryption metadata
    const metadata = {
      algorithm: ENCRYPTION_ALGORITHM,
      keyLength: KEY_LENGTH,
      timestamp: Date.now(),
      dataType: biometricData.type || 'application/octet-stream'
    };
    
    // Encrypt the array buffer
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      arrayBuffer
    );
    
    // Export the key for storage
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    // Combine all data
    const combined = {
      metadata: metadata,
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv),
      key: arrayBufferToBase64(exportedKey),
      data: arrayBufferToBase64(encryptedData)
    };
    
    return JSON.stringify(combined);
  } catch (error) {
    console.error('Biometric encryption error:', error);
    throw new Error('Failed to encrypt biometric data');
  }
}

/**
 * Decrypt biometric data
 * @param {string} encryptedBiometricData - Encrypted biometric data
 * @returns {Promise<Blob>} Decrypted biometric data
 */
export async function decryptBiometricData(encryptedBiometricData) {
  try {
    const combined = JSON.parse(encryptedBiometricData);
    
    // Import the key
    const keyBuffer = base64ToArrayBuffer(combined.key);
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: ENCRYPTION_ALGORITHM },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const iv = base64ToArrayBuffer(combined.iv);
    const encryptedData = base64ToArrayBuffer(combined.data);
    
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      encryptedData
    );
    
    // Return as blob with original type
    return new Blob([decryptedData], { type: combined.metadata.dataType });
  } catch (error) {
    console.error('Biometric decryption error:', error);
    throw new Error('Failed to decrypt biometric data');
  }
}

/**
 * Generate secure hash of data
 * @param {any} data - Data to hash
 * @returns {Promise<string>} Hash as hex string
 */
export async function hashData(data) {
  try {
    const encoder = new TextEncoder();
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = encoder.encode(dataString);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    return arrayBufferToHex(hashBuffer);
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
}

/**
 * Get or create default encryption key
 * @returns {Promise<CryptoKey>} Default encryption key
 */
async function getOrCreateDefaultKey() {
  // In production, this would use a more secure key management system
  const keyId = 'reunite-default-key';
  
  // Try to get existing key from storage
  const storedKey = localStorage.getItem(keyId);
  
  if (storedKey) {
    try {
      const keyBuffer = base64ToArrayBuffer(storedKey);
      return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: ENCRYPTION_ALGORITHM },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Failed to import stored key, generating new one');
    }
  }
  
  // Generate new key
  const key = await generateKey();
  
  // Store key for future use
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  localStorage.setItem(keyId, arrayBufferToBase64(exportedKey));
  
  return key;
}

/**
 * Convert ArrayBuffer to base64 string
 * @param {ArrayBuffer} buffer - Buffer to convert
 * @returns {string} Base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 * @param {string} base64 - Base64 string
 * @returns {ArrayBuffer} Array buffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert ArrayBuffer to hex string
 * @param {ArrayBuffer} buffer - Buffer to convert
 * @returns {string} Hex string
 */
function arrayBufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate random salt
 * @param {number} length - Salt length in bytes
 * @returns {Uint8Array} Random salt
 */
export function generateSalt(length = 16) {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Secure random string generation
 * @param {number} length - String length
 * @returns {string} Random string
 */
export function generateSecureId(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// Default exports
export { encryptData, decryptData, hashData };

export default {
  encryptData,
  decryptData,
  encryptBiometricData,
  decryptBiometricData,
  hashData,
  generateSalt,
  generateSecureId
};
