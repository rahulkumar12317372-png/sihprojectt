import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  USER: {
    id: 'usr_rahul_01',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    location: { latitude: 26.9124, longitude: 75.7873, city: 'Jaipur, Rajasthan' }
  },
  RESPONDER: {
    id: 'resp_a102',
    responderId: 'A102',
    name: 'Vikram Singh (Ambulance A102)',
    email: 'a102@responder.emergencyconnect.org',
    phone: '+91 98290 11102',
    role: 'RESPONDER',
    vehicleType: 'ADVANCED_LIFE_SUPPORT_AMBULANCE',
    serviceType: 'AMBULANCE',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&auto=format&fit=crop&q=80',
    location: { latitude: 26.9240, longitude: 75.8010, city: 'Jaipur, North Zone' }
  },
  HOSPITAL: {
    id: 'hosp_sms_01',
    name: 'Dr. Alok Mehta (SMS Trauma Center)',
    hospitalName: 'SMS Medical College & Trauma Hospital',
    email: 'sms@hospital.emergencyconnect.org',
    phone: '+91 141 2560291',
    role: 'HOSPITAL',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
    location: { latitude: 26.8928, longitude: 75.8118, city: 'Jaipur' }
  },
  ADMIN: {
    id: 'usr_admin_01',
    name: 'Command Center Director',
    email: 'admin@emergencyconnect.org',
    phone: '+91 141 2221122',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    location: { latitude: 26.9124, longitude: 75.7873, city: 'Central Control' }
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('emergencyconnect_user');
    return saved ? JSON.parse(saved) : DEMO_ACCOUNTS.USER;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('emergencyconnect_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('emergencyconnect_user');
    }
  }, [currentUser]);

  const login = (roleKey = 'USER') => {
    const user = DEMO_ACCOUNTS[roleKey.toUpperCase()] || DEMO_ACCOUNTS.USER;
    setCurrentUser(user);
    return user;
  };

  const loginWithCustom = (email, password) => {
    // Find matching demo account or create session
    const matched = Object.values(DEMO_ACCOUNTS).find(a => a.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      return matched;
    }
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name: email.split('@')[0],
      email,
      role: 'USER',
      phone: '+91 98000 00000',
      location: { latitude: 26.9124, longitude: 75.7873, city: 'Jaipur' }
    };
    setCurrentUser(newUser);
    return newUser;
  };

  const register = ({ name, email, phone, role = 'USER' }) => {
    // Normal registration cannot grant ADMIN
    const safeRole = role === 'ADMIN' ? 'USER' : role;
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name,
      email,
      phone,
      role: safeRole,
      location: { latitude: 26.9124, longitude: 75.7873, city: 'Jaipur' }
    };
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (roleKey) => {
    return login(roleKey);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginWithCustom,
        register,
        logout,
        switchRole,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
