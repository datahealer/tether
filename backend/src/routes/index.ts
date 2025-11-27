import { Router, Application } from 'express';
import IndexController from '../controllers/index';

const router = Router();
const indexController = new IndexController();

export const setRoutes = (app: Application): void => {
    app.use('/api', router);

    router.get('/', indexController.handleHome.bind(indexController));
    router.get('/endpoint1', indexController.handleEndpoint1.bind(indexController));
    router.post('/endpoint2', indexController.handleEndpoint2.bind(indexController));
};