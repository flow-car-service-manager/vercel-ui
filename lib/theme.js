// Theme configuration for the application
// This allows easy customization of the color scheme across the entire app

export const theme = {
  // Primary colors (Blue)
  primary: {
    main: 'blue-600',
    light: 'blue-500',
    dark: 'blue-700',
    text: 'white'
  },
  
  // Secondary colors (Purple)
  secondary: {
    main: 'purple-600',
    light: 'purple-500',
    dark: 'purple-700',
    text: 'white'
  },
  
  // Entity-specific colors
  entities: {
    customer: {
      main: 'blue-600',
      light: 'blue-500',
      dark: 'blue-700',
      text: 'white'
    },
    vehicle: {
      main: 'green-600',
      light: 'green-500',
      dark: 'green-700',
      text: 'white'
    },
    technician: {
      main: 'orange-600',
      light: 'orange-500',
      dark: 'orange-700',
      text: 'white'
    },
    service: {
      main: 'red-600',
      light: 'red-500',
      dark: 'red-700',
      text: 'white'
    },
    component: {
      main: 'purple-600',
      light: 'purple-500',
      dark: 'purple-700',
      text: 'white'
    },
    company: {
      main: 'gray-600',
      light: 'gray-500',
      dark: 'gray-700',
      text: 'white'
    },
    report: {
      main: 'cyan-600',
      light: 'cyan-500',
      dark: 'cyan-700',
      text: 'white'
    }
  },
  
  // Status colors
  status: {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    in_progress: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    }
  },
  
  // Stock status colors
  stock: {
    inStock: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    lowStock: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    outOfStock: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    }
  }
}

// Helper functions for common use cases
export const themeHelpers = {
  // Get entity colors
  getEntityColor: (entityType) => theme.entities[entityType] || theme.entities.company,
  
  // Get status colors
  getStatusColor: (status) => theme.status[status] || theme.status.pending,
  
  // Get stock status colors
  getStockColor: (stockCount, reorderLevel = 0) => {
    if (stockCount === 0) return theme.stock.outOfStock
    if (stockCount <= reorderLevel) return theme.stock.lowStock
    return theme.stock.inStock
  },
  
  // Form field classes
  form: {
    input: (entityType = 'customer') => {
      const entity = themeHelpers.getEntityColor(entityType)
      return `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${entity.main} focus:border-${entity.main} text-gray-900`
    },
    select: (entityType = 'customer') => {
      const entity = themeHelpers.getEntityColor(entityType)
      return `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${entity.main} focus:border-${entity.main} text-gray-900`
    },
    textarea: (entityType = 'customer') => {
      const entity = themeHelpers.getEntityColor(entityType)
      return `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${entity.main} focus:border-${entity.main} text-gray-900`
    }
  },
  
  // Button classes
  button: {
    primary: (entityType = 'customer') => {
      const entity = themeHelpers.getEntityColor(entityType)
      return `bg-${entity.main} hover:bg-${entity.dark} text-${entity.text}`
    },
    secondary: (entityType = 'customer') => {
      const entity = themeHelpers.getEntityColor(entityType)
      return `bg-${entity.light} hover:bg-${entity.main} text-${entity.text}`
    },
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
  }
}

// Export default theme
export default theme
