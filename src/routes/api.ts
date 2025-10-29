import { Router } from 'express';
import { 
  qboAuthRedirect,
  qboAuthCallback,
  testListCustomers,
  replayDLQ
} from '../services/qboClient.js';
// import { qboAuthRedirect, qboAuthCallback, testListCustomers, replayDLQ } from '../services/qboClient';

export const router = Router();

// OAuth
router.get('/oauth/qbo', qboAuthRedirect);
router.get('/oauth/qbo/callback', qboAuthCallback);

// Test call
router.get('/qbo/test-list-customers', testListCustomers);

// Replay
router.post('/replay/:id', replayDLQ);