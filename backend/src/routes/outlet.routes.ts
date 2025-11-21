import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all outlets
router.get('/', async (req: Request, res: Response) => {
  try {
    const outlets = await prisma.mediaOutlet.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ outlets });
  } catch (error) {
    console.error('Get outlets error:', error);
    res.status(500).json({ message: 'Error fetching outlets' });
  }
});

// Get single outlet
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const outlet = await prisma.mediaOutlet.findUnique({
      where: { id: req.params.id },
      include: {
        incidents: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found' });
    }

    res.json({ outlet });
  } catch (error) {
    console.error('Get outlet error:', error);
    res.status(500).json({ message: 'Error fetching outlet' });
  }
});

// Create outlet (authenticated)
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('type').optional().isIn(['tv', 'radio', 'print', 'online']),
    body('complaintEmail').optional().isEmail(),
    body('complaintUrl').optional().isURL()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, type, complaintEmail, complaintUrl, notes } = req.body;

      const outlet = await prisma.mediaOutlet.create({
        data: {
          name,
          type,
          complaintEmail,
          complaintUrl,
          notes
        }
      });

      res.status(201).json({ outlet });
    } catch (error) {
      console.error('Create outlet error:', error);
      res.status(500).json({ message: 'Error creating outlet' });
    }
  }
);

// Get outlet contact info
router.get('/:id/contact', async (req: Request, res: Response) => {
  try {
    const outlet = await prisma.mediaOutlet.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        complaintEmail: true,
        complaintUrl: true,
        notes: true
      }
    });

    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found' });
    }

    res.json({ contact: outlet });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Error fetching contact info' });
  }
});

export default router;
