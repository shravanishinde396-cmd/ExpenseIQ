const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth.middleware');

router.use(verifyJWT);

const reportController = require('../controllers/report.controller');

router.get('/pdf', reportController.generatePDFReport);
router.get('/excel', reportController.generateExcelReport);

module.exports = router;
