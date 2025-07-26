import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Ensure logs directory exists
const LOGS_DIR = path.join(__dirname, '../../logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const getLogFileName = () => {
  const date = new Date();
  return `requests_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
};

const writeLogToFile = (data: string) => {
  const logFile = path.join(LOGS_DIR, getLogFileName());

  fs.appendFile(logFile, data + '\n\n', (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestTime = new Date().toISOString();

  // Log request details
  const requestLog = [
    '--- Incoming Request ---',
    `[${requestTime}] ${req.method} ${req.path}`,
    'Headers: ' + JSON.stringify(req.headers, null, 2),
    'Query: ' + JSON.stringify(req.query, null, 2),
    'Body: ' + JSON.stringify(req.body, null, 2),
  ].join('\n');

  console.log(`${req.method} ${req.path}`);
  //   console.log(requestLog);
  writeLogToFile(requestLog);

  // Store original response function to intercept it
  const originalSend = res.send;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let responseBody: any;

  res.send = function (body): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Log response details when the request finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseTime = new Date().toISOString();

    const responseLog = [
      '--- Outgoing Response ---',
      `[${responseTime}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`,
      'Response Body: ' + JSON.stringify(responseBody, null, 2),
      '-----------------------',
    ].join('\n');

    // console.log(responseLog);
    writeLogToFile(responseLog);
  });

  next();
};
