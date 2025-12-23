import { Request, Response } from 'express';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  ip?: string;
  userAgent?: string;
}

class LogStore {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  addLog(log: LogEntry): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(limit?: number): LogEntry[] {
    if (limit) {
      return this.logs.slice(0, limit);
    }
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogsByMethod(method: string): LogEntry[] {
    return this.logs.filter(log => log.method === method.toUpperCase());
  }

  getLogsByStatus(statusCode: number): LogEntry[] {
    return this.logs.filter(log => log.statusCode === statusCode);
  }
}

export const logStore = new LogStore();

export const morganFormat = (tokens: any, req: Request, res: Response): string => {
  const method = tokens.method(req, res) || '';
  const url = tokens.url(req, res) || '';
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);
  const ip = tokens['remote-addr'](req, res);
  const userAgent = tokens['user-agent'](req, res);

  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    method,
    url,
    statusCode: status ? parseInt(status, 10) : undefined,
    responseTime: responseTime ? parseFloat(responseTime) : undefined,
    ip: ip || undefined,
    userAgent: userAgent || undefined,
  };

  logStore.addLog(log);

  return [
    method,
    url,
    status,
    tokens.res(req, res, 'content-length'),
    '-',
    responseTime,
    'ms',
  ].join(' ');
};
