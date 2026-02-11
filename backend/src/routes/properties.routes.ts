import { Router } from 'express';
import { listProperties, listDistricts, getProperty } from '../controllers/properties.controller';

const router = Router();

router.get('/', listProperties);
router.get('/districts', listDistricts);
router.get('/:slug', getProperty);

export default router;