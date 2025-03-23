const express = require('express');
const veridaController = require('../controllers/veridaController');

const router = express.Router();

/**
 * @route   GET /api/verida/auth-url
 * @desc    Generate Verida auth URL
 * @access  Public
 */
router.get('/auth-url', veridaController.generateAuthUrl);

/**
 * @route   POST /api/verida/auth-callback
 * @desc    Handle Verida auth callback
 * @access  Public
 */
router.post('/auth-callback', veridaController.handleAuthCallback);

/**
 * @route   GET /api/verida/telegram/:userId
 * @desc    Get Telegram data
 * @access  Private
 */
router.get('/telegram/:userId', veridaController.getTelegramData);

/**
 * @route   GET /api/verida/telegram/counts/:userId
 * @desc    Get Telegram counts
 * @access  Private
 */
router.get('/telegram/counts/:userId', veridaController.getTelegramCounts);

module.exports = router; 