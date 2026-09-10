import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export const ROLES = {
  HOSPITAL:   'hospital',
  NGO:        'ngo',
  BLOOD_BANK: 'blood_bank',
}

export const ROLE_META = {
  hospital: {
    label: 'Hospital',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    roleKey: 'hospital',
  },
  ngo: {
    label: 'NGO',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    roleKey: 'ngo',
  },
  blood_bank: {
    label: 'Blood Bank',
    color: 'text-crimson',
    bgColor: 'bg-crimson-50',
    borderColor: 'border-crimson-200',
    roleKey: 'blood_bank',
  },
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('lifeflow_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.me()
      .then(({ user }) => {
        setUser(user)
        setRole(user.role)
      })
      .catch(() => {
        localStorage.removeItem('lifeflow_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password)
    localStorage.setItem('lifeflow_token', token)
    setUser(user)
    setRole(user.role)
    return user
  }

  const register = async ({ name, email, password, role, orgName }) => {
    const { token, user } = await api.register({ name, email, password, role, orgName })
    localStorage.setItem('lifeflow_token', token)
    setUser(user)
    setRole(user.role)
    return user
  }

  const logout = () => {
    localStorage.removeItem('lifeflow_token')
    setRole(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ role, user, login, register, logout, loading, ROLES, ROLE_META }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
