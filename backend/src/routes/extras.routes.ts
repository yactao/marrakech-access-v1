import { Router } from 'express';
import { listExtras, getExtra } from '../controllers/extras.controller';

const router = Router();

router.get('/', listExtras);
router.get('/:id', getExtra);

export default router;