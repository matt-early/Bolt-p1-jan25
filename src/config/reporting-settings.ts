// Locked reporting settings - do not modify without explicit approval
export const REPORTING_SETTINGS = {
  // Time periods
  PERIODS: {
    MTD: 'mtd',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
    CUSTOM: 'custom'
  },

  // Metrics configuration
  METRICS: {
    SALES: {
      ID: 'sales',
      LABEL: 'Sales',
      FORMAT: 'currency',
      AGGREGATION: 'sum'
    },
    MARGIN: {
      ID: 'margin', 
      LABEL: 'Margin',
      FORMAT: 'currency',
      AGGREGATION: 'sum'
    },
    ATTACHMENT_RATE: {
      ID: 'attachment',
      LABEL: 'Attachment Rate',
      FORMAT: 'percentage',
      AGGREGATION: 'average'
    }
  },

  // Performance thresholds
  THRESHOLDS: {
    ATTACHMENT_RATE: {
      LOW: 150,
      MEDIUM: 170,
      HIGH: 200
    },
    MARGIN_RATE: {
      LOW: 20,
      MEDIUM: 25,
      HIGH: 30
    }
  },

  // Cache settings
  CACHE: {
    TTL_MINUTES: 5,
    MAX_ENTRIES: 100
  }
} as const;