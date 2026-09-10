import React, { createContext, useContext, useState } from 'react'

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

  const login = (selectedRole, userData = {}) => {
    setRole(selectedRole)
    setUser({ name: 'Admin User', email: 'admin@lifeflow.in', ...userData })
  }

  const logout = () => {
    setRole(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ role, user, login, logout, ROLES, ROLE_META }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
