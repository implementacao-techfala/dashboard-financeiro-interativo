
const LOG_KEY = 'dashboard_persistent_logs';
const MAX_LOG_ENTRIES = 100;

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: any;
}

const writeLog = (level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: any) => {
  try {
    const newEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? JSON.parse(JSON.stringify(context)) : undefined,
    };

    const consoleFunc = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.info;
    consoleFunc(`[${level}] ${message}`, context || '');

    const existingLogsRaw = localStorage.getItem(LOG_KEY);
    const existingLogs: LogEntry[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];

    existingLogs.push(newEntry);

    if (existingLogs.length > MAX_LOG_ENTRIES) {
      existingLogs.splice(0, existingLogs.length - MAX_LOG_ENTRIES);
    }

    localStorage.setItem(LOG_KEY, JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Failed to write persistent log:', error);
  }
};

export const logger = {
  info: (message: string, context?: any) => writeLog('INFO', message, context),
  warn: (message: string, context?: any) => writeLog('WARN', message, context),
  error: (message: string, context?: any) => writeLog('ERROR', message, context),
};
