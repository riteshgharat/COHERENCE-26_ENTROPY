/**
 * Session Manager
 * Note: Session state is predominately handled by whatsapp-web.js LocalAuth under the hood.
 * We leave this module for future extensions (e.g., storing session in Postgres/Redis via FastAPI).
 */

function checkSession() {
  return true;
}

module.exports = {
  checkSession,
};
