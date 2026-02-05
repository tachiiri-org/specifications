function where(b) {
  return b.__file ? `${b.__file} (${b.boundary})` : `${b.boundary}`
}

export function lintBrowserSessionCsrfCoupling(boundary) {
  if (boundary.boundary !== "browser_to_bff") return

  // auth transport must be cookie_session
  const transport = boundary.auth?.transport
  if (transport !== "cookie_session") {
    throw new Error(`${where(boundary)}: browser_to_bff auth.transport must be "cookie_session"`)
  }

  // CSRF must be enabled and aligned
  const csrf = boundary.http?.csrf
  if (!csrf || csrf.mode !== "enabled") {
    throw new Error(`${where(boundary)}: browser_to_bff http.csrf.mode must be "enabled"`)
  }

  const modeDetail = csrf.mode_detail
  if (modeDetail !== "origin_check_and_token") {
    throw new Error(`${where(boundary)}: browser_to_bff http.csrf.mode_detail must be "origin_check_and_token"`)
  }

  // token strategy hardening
  const token = csrf.token
  if (!token || token.strategy !== "double_submit_cookie") {
    throw new Error(`${where(boundary)}: browser_to_bff http.csrf.token.strategy must be "double_submit_cookie"`)
  }
  if (token.header_name !== "x-csrf-token") {
    throw new Error(`${where(boundary)}: browser_to_bff http.csrf.token.header_name must be "x-csrf-token"`)
  }
  if (token.cookie_name !== "__Host-csrf") {
    throw new Error(`${where(boundary)}: browser_to_bff http.csrf.token.cookie_name must be "__Host-csrf"`)
  }

  // session cookie coupling
  const session = csrf.session
  if (!session || session.require_session_cookie !== true) {
    throw new Error(`${where(boundary)}: browser_to_bff http.csrf.session.require_session_cookie must be true`)
  }
  if (session.session_cookie_name !== "__Host-session") {
    throw new Error(`${where(boundary)}: browser_to_bff http.csrf.session.session_cookie_name must be "__Host-session"`)
  }

  // cookies subtree must exist for __Host-session and __Host-csrf
  const cookies = boundary.cookies
  if (!cookies || typeof cookies !== "object") {
    throw new Error(`${where(boundary)}: browser_to_bff cookies subtree is required`)
  }

  const sc = cookies.session_cookie
  if (!sc || sc.name !== "__Host-session") {
    throw new Error(`${where(boundary)}: browser_to_bff cookies.session_cookie.name must be "__Host-session"`)
  }

  const cc = cookies.csrf_cookie
  if (!cc || cc.name !== "__Host-csrf") {
    throw new Error(`${where(boundary)}: browser_to_bff cookies.csrf_cookie.name must be "__Host-csrf"`)
  }

  // CORS allow_credentials must be enabled (cookie session needs it)
  const allowCred = boundary.cors?.allow_credentials
  if (!allowCred || allowCred.mode !== "enabled") {
    throw new Error(`${where(boundary)}: browser_to_bff cors.allow_credentials.mode must be "enabled"`)
  }
}
