import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';

const router = Router();

// Submit outlet suggestion
router.post(
  '/',
  [
    body('outletName').trim().notEmpty().withMessage('Outlet name is required'),
    body('outletType').optional().isIn(['tv', 'radio', 'print', 'online', 'other']),
    body('websiteUrl').optional().isURL().withMessage('Please provide a valid URL'),
    body('suggestedBy').optional().trim(),
    body('additionalInfo').optional().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { outletName, outletType, websiteUrl, suggestedBy, additionalInfo } = req.body;

      const suggestion = await prisma.outletSuggestion.create({
        data: {
          outletName,
          outletType,
          websiteUrl,
          suggestedBy,
          additionalInfo
        }
      });

      res.status(201).json({
        message: 'Thank you for your suggestion! We will review it and add the outlet if appropriate.',
        suggestion
      });
    } catch (error) {
      console.error('Create suggestion error:', error);
      res.status(500).json({ message: 'Error submitting suggestion' });
    }
  }
);

// Get all suggestions (for admin use)
router.get('/', async (req: Request, res: Response) => {
  try {
    const suggestions = await prisma.outletSuggestion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
});

export default router;
