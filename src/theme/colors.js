export const themePresets = {
  Violeta: { primary: '#8B5CF6', primaryLight: '#A78BFA' },
  Azul: { primary: '#3B82F6', primaryLight: '#60A5FA' },
  Verde: { primary: '#10B981', primaryLight: '#34D399' },
  Rosa: { primary: '#EC4899', primaryLight: '#F472B6' },
  Naranja: { primary: '#F97316', primaryLight: '#FB923C' },
};

export const bgPresets = {
  // --- TEMAS OSCUROS ---
  'Azul Oscuro': {
    isDark: true,
    background: '#0B0F19',
    cardBg: '#161F30',
    cardBgSecondary: '#1F2C45',
    border: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  Negro: {
    isDark: true,
    background: '#000000',
    cardBg: '#0D0D0D',
    cardBgSecondary: '#1A1A1A',
    border: '#222222',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  Oscuro: {
    isDark: true,
    background: '#121212',
    cardBg: '#1E1E1E',
    cardBgSecondary: '#292929',
    border: '#2A2A2A',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  // --- TEMAS CLAROS ---
  Blanco: {
    isDark: false,
    background: '#FFFFFF',
    cardBg: '#F8FAFC',
    cardBgSecondary: '#F1F5F9',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
  },
  'Gris Claro': {
    isDark: false,
    background: '#F3F4F6',      // Gris claro neutral
    cardBg: '#FFFFFF',
    cardBgSecondary: '#E5E7EB', // Gris claro secundario
    border: '#D1D5DB',          // Gris claro borde
    textPrimary: '#1F2937',     // Texto oscuro para alto contraste
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
  }
};

// Respaldo estático predeterminado para evitar errores de importación
export const colors = {
  background: '#0B0F19',
  cardBg: '#161F30',
  cardBgSecondary: '#1F2C45',
  
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  
  success: '#10B981',
  successLight: '#34D399',     
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  
  danger: '#EF4444',
  dangerLight: '#F87171',
  
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  border: '#1E293B',
  borderActive: '#8B5CF6',
  
  categories: {
    Salud: {
      color: '#EF4444',
      bg: '#FEF2F2',
      darkBg: '#2D1616',
    },
    Mente: {
      color: '#3B82F6',
      bg: '#EFF6FF',
      darkBg: '#131E3A',
    },
    Ejercicio: {
      color: '#F59E0B',
      bg: '#FEF3C7',
      darkBg: '#2D1F10',
    },
    Trabajo: {
      color: '#10B981',
      bg: '#ECFDF5',
      darkBg: '#0F261C',
    },
    Otros: {
      color: '#EC4899',
      bg: '#FDF2F8',
      darkBg: '#2D1520',
    }
  }
};
