// ============================================
// FEAST Auth Helpers — JWT Token Management
// ============================================

export function saveTokens({ access, refresh }) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function isLoggedIn() {
  return !!getAccessToken();
}

/**
 * Decode JWT payload (tanpa verifikasi — verifikasi di server).
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** @returns {"EMPLOYEE"|"CUSTOMER"|"SUPERADMIN"|null} */
export function getActorType() {
  const payload = decodeToken(getAccessToken());
  return payload?.actor_type ?? null;
}

/** @returns {boolean} */
export function isSuperAdmin() {
  return getActorType() === 'SUPERADMIN';
}

/** @returns {string|null} */
export function getBrandId() {
  const payload = decodeToken(getAccessToken());
  return payload?.brand_id ?? null;
}

/** @returns {string|null} Primary outlet ID */
export function getOutletId() {
  const payload = decodeToken(getAccessToken());
  return payload?.outlet_id ?? null;
}

/** @returns {string[]} All outlet IDs the user has access to */
export function getOutletIds() {
  const payload = decodeToken(getAccessToken());
  return payload?.outlet_ids ?? [];
}

/** @returns {string|null} */
export function getRoleId() {
  const payload = decodeToken(getAccessToken());
  return payload?.role_id ?? null;
}

/** @returns {string|null} */
export function getUserId() {
  const payload = decodeToken(getAccessToken());
  return payload?.user_id ?? null;
}

/** @returns {Set<string>} */
export function getPermissions() {
  const payload = decodeToken(getAccessToken());
  return new Set(payload?.permissions || []);
}

/**
 * Check if current user has a specific permission.
 * @param {string} codename — e.g. "kitchen.order.view"
 * @returns {boolean}
 */
export function hasPermission(codename) {
  return getPermissions().has(codename);
}

/**
 * Check if current token is expired.
 * @returns {boolean}
 */
export function isTokenExpired() {
  const payload = decodeToken(getAccessToken());
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
