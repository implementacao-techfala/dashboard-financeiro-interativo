import React, { useState, useEffect } from 'react';
import { XIcon, DownloadIcon } from './icons';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context?: any;
}

const LOG_KEY = 'dashboard_persistent_logs';

const getLevelColor = (level: string) => {
    switch (level) {
        case 'ERROR': return 'text-red-500';
        case 'WARN': return 'text-yellow-500';
        case 'INFO': return 'text-blue-500';
        default: return 'text-gray-500';
    }
}

const LogViewer: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const loadLogs = () => {
    const storedLogs = localStorage.getItem(LOG_KEY);
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs).reverse()); // Show most recent first
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const clearLogs = () => {
    localStorage.removeItem(LOG_KEY);
    setLogs([]);
  };

  const handleDownload = () => {
    const storedLogs = localStorage.getItem(LOG_KEY);
    if (!storedLogs) {
        alert('Nenhum log para baixar.');
        return;
    }

    const logsToDownload: LogEntry[] = JSON.parse(storedLogs);

    let logContent = 'Dashboard Financeiro - Logs\n';
    logContent += `Gerado em: ${new Date().toLocaleString()}\n`;
    logContent += '========================================\n\n';

    logsToDownload.forEach(log => {
        logContent += `[${log.timestamp}] [${log.level}] ${log.message}\n`;
        if (log.context) {
            logContent += `Contexto: ${JSON.stringify(log.context, null, 2)}\n`;
        }
        logContent += '----------------------------------------\n';
    });

    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    link.download = `dashboard-logs-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
            <h2 className="text-xl font-bold">Visualizador de Logs</h2>
            <div className="flex items-center gap-2">
                <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1 bg-green-600 rounded hover:bg-green-500 text-sm">
                  <DownloadIcon className="h-4 w-4" />
                  <span>Baixar</span>
                </button>
                <button onClick={loadLogs} className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 text-sm">Atualizar</button>
                <button onClick={clearLogs} className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 text-sm">Limpar Logs</button>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
            </div>
        </div>
        <div className="overflow-auto flex-grow pr-2">
            {logs.length > 0 ? logs.map((log, index) => (
                <div key={index} className="border-b border-gray-700 py-2 font-mono text-sm">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-bold ${getLevelColor(log.level)}`}>[{log.level}]</span>
                        <span>{log.message}</span>
                    </div>
                    {log.context && (
                        <pre className="bg-gray-900 p-2 rounded mt-2 text-xs overflow-x-auto text-yellow-300">
                            {JSON.stringify(log.context, null, 2)}
                        </pre>
                    )}
                </div>
            )) : (
                <p className="text-gray-400 text-center mt-8">Nenhum log registrado.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default LogViewer;