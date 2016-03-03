import express from 'express';

const router = express.Router();

import updateHandler from './controllers/update-handler.js';

router.use('/', updateHandler);

export default router;
