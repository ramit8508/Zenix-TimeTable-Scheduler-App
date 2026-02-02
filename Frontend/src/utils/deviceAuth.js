// Device-based Authentication Utility
// This provides offline authentication using a unique device ID

/**
 * Generates a unique device ID based on browser fingerprinting
 * @returns {string} Unique device ID
 */
export const generateDeviceId = () => {
  // Check if device ID already exists
  let deviceId = localStorage.getItem('device_id');
  
  if (!deviceId) {
    // Create a unique device ID based on multiple factors
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device Fingerprint', 2, 2);
    
    const canvasData = canvas.toDataURL();
    const navigatorInfo = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvasData
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < navigatorInfo.length; i++) {
      const char = navigatorInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Create device ID with timestamp for uniqueness
    deviceId = `device_${Math.abs(hash)}_${Date.now()}`;
    
    // Store the device ID
    localStorage.setItem('device_id', deviceId);
    localStorage.setItem('device_created_at', new Date().toISOString());
  }
  
  return deviceId;
};

/**
 * Gets the current device ID
 * @returns {string|null} Device ID or null
 */
export const getDeviceId = () => {
  return localStorage.getItem('device_id');
};

/**
 * Gets device information
 * @returns {object} Device information
 */
export const getDeviceInfo = () => {
  const deviceId = getDeviceId();
  const createdAt = localStorage.getItem('device_created_at');
  const deviceName = localStorage.getItem('device_name') || 'My Device';
  
  return {
    deviceId,
    createdAt,
    deviceName,
    platform: navigator.platform,
    userAgent: navigator.userAgent
  };
};

/**
 * Sets a friendly device name
 * @param {string} name - Device name
 */
export const setDeviceName = (name) => {
  localStorage.setItem('device_name', name);
};

/**
 * Initialize device authentication
 * Creates device ID and sets up device-based user
 * @returns {object} Device user object
 */
export const initializeDeviceAuth = () => {
  const deviceId = generateDeviceId();
  const deviceInfo = getDeviceInfo();
  
  // Create or get device user
  let deviceUser = localStorage.getItem('device_user');
  
  if (!deviceUser) {
    deviceUser = {
      id: deviceId,
      name: deviceInfo.deviceName,
      email: `${deviceId}@device.local`,
      deviceId: deviceId,
      createdAt: deviceInfo.createdAt,
      isDeviceAuth: true
    };
    
    localStorage.setItem('device_user', JSON.stringify(deviceUser));
    localStorage.setItem('device_token', `device_token_${deviceId}`);
  } else {
    deviceUser = JSON.parse(deviceUser);
  }
  
  return deviceUser;
};

/**
 * Get device user
 * @returns {object|null} Device user object
 */
export const getDeviceUser = () => {
  const deviceUser = localStorage.getItem('device_user');
  return deviceUser ? JSON.parse(deviceUser) : null;
};

/**
 * Get device token
 * @returns {string|null} Device token
 */
export const getDeviceToken = () => {
  return localStorage.getItem('device_token');
};

/**
 * Check if device is authenticated
 * @returns {boolean} Authentication status
 */
export const isDeviceAuthenticated = () => {
  return !!(getDeviceId() && getDeviceUser() && getDeviceToken());
};

/**
 * Clear device authentication (reset)
 */
export const clearDeviceAuth = () => {
  localStorage.removeItem('device_id');
  localStorage.removeItem('device_user');
  localStorage.removeItem('device_token');
  localStorage.removeItem('device_created_at');
  localStorage.removeItem('device_name');
};
