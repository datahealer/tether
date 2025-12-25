import { Router, Request, Response } from 'express';
import { logStore } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get all API logs
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of logs to return
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [GET, POST, PUT, PATCH, DELETE]
 *         description: Filter logs by HTTP method
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Filter logs by status code
 *     responses:
 *       200:
 *         description: List of logs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogsResponse'
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const method = req.query.method as string;
    const status = req.query.status ? parseInt(req.query.status as string, 10) : undefined;

    let logs = logStore.getLogs(limit);

    if (method) {
      logs = logs.filter(log => log.method === method.toUpperCase());
    }

    if (status) {
      logs = logs.filter(log => log.statusCode === status);
    }

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch logs',
    });
  }
});

/**
 * @swagger
 * /api/logs/clear:
 *   delete:
 *     summary: Clear all logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Logs cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete('/clear', (req: Request, res: Response) => {
  try {
    logStore.clearLogs();
    res.json({
      success: true,
      message: 'Logs cleared successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear logs',
    });
  }
});

export default router;
