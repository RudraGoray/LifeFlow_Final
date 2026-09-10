const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getToken() {
  return localStorage.getItem('lifeflow_token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }

  return data
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
