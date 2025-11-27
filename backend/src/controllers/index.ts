import { Request, Response } from 'express';

export default class IndexController {
    public async handleHome(req: Request, res: Response): Promise<void> {
        try {
            res.status(200).json({ message: 'Home endpoint' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    public async handleEndpoint1(req: Request, res: Response): Promise<void> {
        try {
            res.status(200).json({ message: 'Endpoint 1 response' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving data' });
        }
    }

    public async handleEndpoint2(req: Request, res: Response): Promise<void> {
        try {
            res.status(201).json({ message: 'Endpoint 2 response' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while creating data' });
        }
    }
}