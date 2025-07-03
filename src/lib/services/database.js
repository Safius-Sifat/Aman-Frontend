import Database from 'better-sqlite3';
import path from 'path';

// Database initialization
const dbPath = path.join(process.cwd(), 'data', 'reunite.db');
let db;

try {
  db = new Database(dbPath);
  initializeDatabase();
} catch (error) {
  console.error('Database initialization error:', error);
  // Fallback to in-memory database
  db = new Database(':memory:');
  initializeDatabase();
}

/**
 * Initialize database schema
 */
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT,
      place_of_birth TEXT,
      nationality TEXT,
      languages TEXT, -- JSON array
      family_members TEXT, -- JSON array
      last_known_location TEXT,
      separation_date TEXT,
      separation_circumstances TEXT,
      contact_information TEXT,
      additional_notes TEXT,
      ai_insights TEXT, -- JSON object
      registration_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Biometric data table (encrypted)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_biometrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      photo_encrypted TEXT,
      voice_recording_encrypted TEXT,
      face_features_encrypted TEXT,
      voice_features_encrypted TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Connections/matches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      similarity_score REAL NOT NULL,
      facial_score REAL DEFAULT 0,
      voice_score REAL DEFAULT 0,
      info_score REAL DEFAULT 0,
      connection_type TEXT, -- 'potential', 'verified', 'rejected'
      predicted_relationship TEXT,
      ai_analysis TEXT, -- JSON object
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user1_id, user2_id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'match', 'message', 'system'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT, -- JSON object
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_name ON users(first_name, last_name);
    CREATE INDEX IF NOT EXISTS idx_connections_users ON user_connections(user1_id, user2_id);
    CREATE INDEX IF NOT EXISTS idx_connections_score ON user_connections(similarity_score);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);
}

/**
 * Save user data
 * @param {Object} userData - User data to save
 * @returns {Object} Saved user data
 */
export function saveUser(userData) {
  const stmt = db.prepare(`
    INSERT INTO users (
      email, password_hash, first_name, last_name, date_of_birth, place_of_birth,
      nationality, languages, family_members, last_known_location, separation_date,
      separation_circumstances, contact_information, additional_notes, ai_insights,
      registration_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userData.email,
    userData.passwordHash,
    userData.firstName,
    userData.lastName,
    userData.dateOfBirth,
    userData.placeOfBirth,
    userData.nationality,
    JSON.stringify(userData.languages || []),
    JSON.stringify(userData.familyMembers || []),
    userData.lastKnownLocation,
    userData.separationDate,
    userData.separationCircumstances,
    userData.contactInformation,
    userData.additionalNotes,
    JSON.stringify(userData.aiInsights || {}),
    userData.registrationDate,
    userData.status || 'active'
  );

  return getUserById(result.lastInsertRowid);
}

/**
 * Save user biometric data
 * @param {number} userId - User ID
 * @param {Object} biometricData - Encrypted biometric data
 * @returns {Object} Saved biometric data
 */
export function saveUserBiometrics(userId, biometricData) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_biometrics (
      user_id, photo_encrypted, voice_recording_encrypted, 
      face_features_encrypted, voice_features_encrypted
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    biometricData.photo,
    biometricData.voiceRecording,
    biometricData.faceFeatures,
    biometricData.voiceFeatures
  );

  return { id: result.lastInsertRowid, userId };
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Object|null} User data
 */
export function getUserById(userId) {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `);
  
  const user = stmt.get(userId);
  if (!user) return null;

  return {
    ...user,
    languages: JSON.parse(user.languages || '[]'),
    familyMembers: JSON.parse(user.family_members || '[]'),
    aiInsights: JSON.parse(user.ai_insights || '{}')
  };
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Object|null} User data
 */
export function getUserByEmail(email) {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `);
  
  const user = stmt.get(email);
  if (!user) return null;

  return {
    ...user,
    languages: JSON.parse(user.languages || '[]'),
    familyMembers: JSON.parse(user.family_members || '[]'),
    aiInsights: JSON.parse(user.ai_insights || '{}')
  };
}

/**
 * Find potential matches for a user
 * @param {number} userId - User ID
 * @param {Object} options - Search options
 * @returns {Array} Array of potential matches
 */
export function findPotentialMatches(userId, options = {}) {
  const { minScore = 50, maxResults = 20 } = options;
  
  const stmt = db.prepare(`
    SELECT 
      u.*,
      uc.similarity_score,
      uc.facial_score,
      uc.voice_score,
      uc.info_score,
      uc.predicted_relationship,
      uc.connection_type
    FROM users u
    JOIN user_connections uc ON (u.id = uc.user1_id OR u.id = uc.user2_id)
    WHERE (uc.user1_id = ? OR uc.user2_id = ?)
      AND u.id != ?
      AND uc.similarity_score >= ?
      AND u.status = 'active'
    ORDER BY uc.similarity_score DESC
    LIMIT ?
  `);

  const matches = stmt.all(userId, userId, userId, minScore, maxResults);
  
  return matches.map(match => ({
    ...match,
    languages: JSON.parse(match.languages || '[]'),
    familyMembers: JSON.parse(match.family_members || '[]'),
    aiInsights: JSON.parse(match.ai_insights || '{}')
  }));
}

/**
 * Save user connection
 * @param {number} user1Id - First user ID
 * @param {number} user2Id - Second user ID
 * @param {Object} connectionData - Connection data
 * @returns {Object} Saved connection
 */
export function saveUserConnection(user1Id, user2Id, connectionData) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_connections (
      user1_id, user2_id, similarity_score, facial_score, voice_score, info_score,
      connection_type, predicted_relationship, ai_analysis
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    Math.min(user1Id, user2Id), // Ensure consistent ordering
    Math.max(user1Id, user2Id),
    connectionData.similarityScore,
    connectionData.facialScore || 0,
    connectionData.voiceScore || 0,
    connectionData.infoScore || 0,
    connectionData.connectionType || 'potential',
    connectionData.predictedRelationship,
    JSON.stringify(connectionData.aiAnalysis || {})
  );

  return { id: result.lastInsertRowid, ...connectionData };
}

/**
 * Get connection graph for visualization
 * @param {number} userId - Center user ID
 * @param {Object} options - Graph options
 * @returns {Object} Graph data with nodes and connections
 */
export function getConnectionGraph(userId, options = {}) {
  const { minScore = 50, maxDepth = 3 } = options;
  
  // Get all connections for the user and their connections
  const stmt = db.prepare(`
    WITH RECURSIVE connection_tree AS (
      -- Base case: direct connections
      SELECT 
        u1.id as user1_id, u2.id as user2_id, 
        uc.similarity_score, uc.facial_score, uc.voice_score, uc.info_score,
        uc.predicted_relationship, 1 as depth
      FROM users u1
      JOIN user_connections uc ON u1.id = uc.user1_id
      JOIN users u2 ON u2.id = uc.user2_id
      WHERE u1.id = ? AND uc.similarity_score >= ?
      
      UNION
      
      SELECT 
        u1.id as user1_id, u2.id as user2_id,
        uc.similarity_score, uc.facial_score, uc.voice_score, uc.info_score,
        uc.predicted_relationship, 1 as depth
      FROM users u1
      JOIN user_connections uc ON u1.id = uc.user2_id
      JOIN users u2 ON u2.id = uc.user1_id
      WHERE u1.id = ? AND uc.similarity_score >= ?
      
      UNION
      
      -- Recursive case: connections of connections
      SELECT 
        ct.user2_id as user1_id, u.id as user2_id,
        uc.similarity_score, uc.facial_score, uc.voice_score, uc.info_score,
        uc.predicted_relationship, ct.depth + 1 as depth
      FROM connection_tree ct
      JOIN user_connections uc ON ct.user2_id = uc.user1_id
      JOIN users u ON u.id = uc.user2_id
      WHERE ct.depth < ? AND uc.similarity_score >= ?
    )
    SELECT DISTINCT * FROM connection_tree
  `);

  const connections = stmt.all(userId, minScore, userId, minScore, maxDepth, minScore);
  
  // Get unique user IDs
  const userIds = new Set([userId]);
  connections.forEach(conn => {
    userIds.add(conn.user1_id);
    userIds.add(conn.user2_id);
  });

  // Get user details
  const usersStmt = db.prepare(`
    SELECT id, first_name, last_name, last_known_location, registration_date
    FROM users WHERE id IN (${Array.from(userIds).map(() => '?').join(',')})
  `);
  
  const users = usersStmt.all(...Array.from(userIds));

  return {
    users,
    connections: connections.map(conn => ({
      user1Id: conn.user1_id,
      user2Id: conn.user2_id,
      score: Math.round(conn.similarity_score),
      facialScore: Math.round(conn.facial_score || 0),
      voiceScore: Math.round(conn.voice_score || 0),
      infoScore: Math.round(conn.info_score || 0),
      relationship: conn.predicted_relationship,
      depth: conn.depth
    }))
  };
}

/**
 * Create notification
 * @param {number} userId - User ID
 * @param {Object} notificationData - Notification data
 * @returns {Object} Created notification
 */
export function createNotification(userId, notificationData) {
  const stmt = db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    notificationData.type,
    notificationData.title,
    notificationData.message,
    JSON.stringify(notificationData.data || {})
  );

  return { id: result.lastInsertRowid, ...notificationData };
}

/**
 * Get notifications for user
 * @param {number} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} Array of notifications
 */
export function getNotifications(userId, options = {}) {
  const { limit = 50, unreadOnly = false } = options;
  
  let query = `
    SELECT * FROM notifications 
    WHERE user_id = ?
  `;
  
  if (unreadOnly) {
    query += ` AND read_at IS NULL`;
  }
  
  query += ` ORDER BY created_at DESC LIMIT ?`;
  
  const stmt = db.prepare(query);
  const notifications = stmt.all(userId, limit);
  
  return notifications.map(notif => ({
    ...notif,
    data: JSON.parse(notif.data || '{}')
  }));
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID
 * @returns {boolean} Success status
 */
export function markNotificationRead(notificationId, userId) {
  const stmt = db.prepare(`
    UPDATE notifications 
    SET read_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?
  `);

  const result = stmt.run(notificationId, userId);
  return result.changes > 0;
}

/**
 * Search users by criteria
 * @param {Object} criteria - Search criteria
 * @param {Object} options - Search options
 * @returns {Array} Array of matching users
 */
export function searchUsers(criteria, options = {}) {
  const { limit = 50, offset = 0 } = options;
  
  let query = `SELECT * FROM users WHERE status = 'active'`;
  const params = [];
  
  if (criteria.name) {
    query += ` AND (first_name LIKE ? OR last_name LIKE ?)`;
    params.push(`%${criteria.name}%`, `%${criteria.name}%`);
  }
  
  if (criteria.location) {
    query += ` AND (place_of_birth LIKE ? OR last_known_location LIKE ?)`;
    params.push(`%${criteria.location}%`, `%${criteria.location}%`);
  }
  
  if (criteria.age) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - criteria.age;
    query += ` AND date_of_birth LIKE ?`;
    params.push(`${birthYear}%`);
  }
  
  query += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const stmt = db.prepare(query);
  const users = stmt.all(...params);
  
  return users.map(user => ({
    ...user,
    languages: JSON.parse(user.languages || '[]'),
    familyMembers: JSON.parse(user.family_members || '[]'),
    aiInsights: JSON.parse(user.ai_insights || '{}')
  }));
}

/**
 * Get database statistics
 * @returns {Object} Database statistics
 */
export function getDatabaseStats() {
  const stats = {};
  
  // Total users
  stats.totalUsers = db.prepare(`SELECT COUNT(*) as count FROM users`).get().count;
  
  // Active users
  stats.activeUsers = db.prepare(`SELECT COUNT(*) as count FROM users WHERE status = 'active'`).get().count;
  
  // Total connections
  stats.totalConnections = db.prepare(`SELECT COUNT(*) as count FROM user_connections`).get().count;
  
  // High-confidence matches
  stats.highConfidenceMatches = db.prepare(`
    SELECT COUNT(*) as count FROM user_connections WHERE similarity_score >= 80
  `).get().count;
  
  // Unread notifications
  stats.unreadNotifications = db.prepare(`
    SELECT COUNT(*) as count FROM notifications WHERE read_at IS NULL
  `).get().count;
  
  return stats;
}

// Export database instance for advanced queries
export { db };

export default {
  saveUser,
  saveUserBiometrics,
  getUserById,
  getUserByEmail,
  findPotentialMatches,
  saveUserConnection,
  getConnectionGraph,
  createNotification,
  getNotifications,
  markNotificationRead,
  searchUsers,
  getDatabaseStats
};
