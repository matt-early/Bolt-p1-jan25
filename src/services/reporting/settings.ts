import { REPORTING_SETTINGS } from '../../config/reporting-settings';

// Validate reporting settings are locked
const validateSettings = () => {
  // Attempt to modify settings (will fail in TypeScript)
  try {
    // @ts-expect-error - This should fail compilation
    REPORTING_SETTINGS.METRICS.SALES.ID = 'something-else';
    console.error('ERROR: Reporting settings are not properly locked!');
  } catch {
    // Expected behavior - settings are locked
  }
};

validateSettings();

// Export settings as read-only
export const getReportingSettings = () => ({ ...REPORTING_SETTINGS });