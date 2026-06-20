const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/summary', analyticsController.getSummary);
router.get('/income-expense', analyticsController.getIncomeVsExpense);
router.get('/expense-distribution', analyticsController.getExpenseDistribution);
router.get('/monthly-trend', analyticsController.getMonthlyTrend);
router.get('/savings-growth', analyticsController.getSavingsGrowth);
router.get('/category-analysis', analyticsController.getCategoryAnalysis);
router.get('/insights', analyticsController.getInsights);

module.exports = router;
