import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db/supabase.js';

const router = express.Router();

// GET /api/fd/rates - Get all bank FD rates
router.get('/rates', authenticateToken, async (req, res) => {
  try {
    const rates = await db.getAllRates();
    res.json(rates);
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ error: 'Failed to get FD rates' });
  }
});

// GET /api/fd/rates/:bankId - Get rates for specific bank
router.get('/rates/:bankId', authenticateToken, async (req, res) => {
  try {
    const { bankId } = req.params;
    const rate = await db.getRateByBankId(bankId);

    if (!rate) {
      return res.status(404).json({ error: 'Bank not found' });
    }

    res.json(rate);
  } catch (error) {
    console.error('Get bank rate error:', error);
    res.status(500).json({ error: 'Failed to get bank rate' });
  }
});

// GET /api/fd/compare?amount=10000&tenor=12 - Compare FDs
router.get('/compare', authenticateToken, async (req, res) => {
  try {
    const { amount, tenor, isSenior } = req.query;
    const amountNum = parseFloat(amount) || 10000;
    const tenorNum = parseInt(tenor) || 12;
    const seniorCitizen = isSenior === 'true';

    const allRates = await db.getAllRates();

    // Calculate maturity for each bank
    const comparisons = allRates.map(bank => {
      const rate = seniorCitizen ? bank.senior_citizen_rate : bank.interest_rate;
      const interest = (amountNum * rate * tenorNum) / (100 * 12);
      const maturityAmount = amountNum + interest;

      return {
        id: bank.id,
        bank_name: bank.bank_name,
        bank_logo_url: bank.bank_logo_url,
        interest_rate: rate,
        maturity_amount: Math.round(maturityAmount),
        interest_earned: Math.round(interest),
        min_amount: bank.min_amount,
        is_dicgc_insured: bank.is_dicgc_insured,
        senior_citizen_rate: bank.senior_citizen_rate
      };
    });

    // Sort by highest maturity amount
    comparisons.sort((a, b) => b.maturity_amount - a.maturity_amount);

    res.json({
      principal: amountNum,
      tenor_months: tenorNum,
      is_senior_citizen: seniorCitizen,
      banks: comparisons
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: 'Failed to compare FDs' });
  }
});

// POST /api/fd/calculate - Calculate FD maturity
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { principal, tenor, rate, type, isSenior } = req.body;

    if (!principal || !tenor || !rate) {
      return res.status(400).json({ error: 'Principal, tenor, and rate are required' });
    }

    const principalNum = parseFloat(principal);
    const tenorNum = parseInt(tenor);
    const rateNum = parseFloat(rate);
    const fdType = type || 'cumulative';
    const seniorCitizen = isSenior === true;

    let maturityAmount, interestEarned, monthlyPayout;

    if (fdType === 'cumulative') {
      // Compound interest calculation
      const adjustedRate = seniorCitizen ? rateNum + 0.5 : rateNum;
      const n = 4; // Quarterly compounding
      const t = tenorNum / 12; // Years
      maturityAmount = principalNum * Math.pow(1 + (adjustedRate / 100) / n, n * t);
      interestEarned = maturityAmount - principalNum;
      monthlyPayout = 0;
    } else {
      // Simple interest, monthly payout
      const adjustedRate = seniorCitizen ? rateNum + 0.5 : rateNum;
      interestEarned = (principalNum * adjustedRate * tenorNum) / (100 * 12);
      maturityAmount = principalNum; // Principal returned at end
      monthlyPayout = interestEarned / tenorNum;
    }

    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenorNum);

    res.json({
      principal: principalNum,
      tenor_months: tenorNum,
      interest_rate: seniorCitizen ? rateNum + 0.5 : rateNum,
      fd_type: fdType,
      maturity_amount: Math.round(maturityAmount),
      interest_earned: Math.round(interestEarned),
      monthly_payout: Math.round(monthlyPayout),
      maturity_date: maturityDate.toISOString(),
      is_senior_citizen: seniorCitizen
    });
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({ error: 'Failed to calculate FD' });
  }
});

export default router;
