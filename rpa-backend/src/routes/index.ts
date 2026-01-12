import { Router } from 'express';
import { SiteMapController } from '../controllers/SiteMapController';
import { FlowController } from '../controllers/FlowController';

const router = Router();

// Site map routes
router.post('/site-maps', SiteMapController.createSiteMap);
router.get('/site-maps/:siteMapId', SiteMapController.getSiteMap);
router.get('/site-maps', SiteMapController.listSiteMaps);

// Flow routes
router.post('/flows', FlowController.saveFlow);
router.get('/flows/:flowId', FlowController.getFlow);
router.get('/flows', FlowController.listFlows);

// Execution routes
router.post('/executions', FlowController.executeFlow);
router.post('/executions/partial', FlowController.executeFlowPartial);
router.get('/executions/:executionId', FlowController.getExecutionReport);

export default router;
