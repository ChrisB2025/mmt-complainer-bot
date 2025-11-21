import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// List all incidents (public)
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      outletId,
      presenterName,
      infractionType,
      startDate,
      endDate,
      page = '1',
      limit = '20'
    } = req.query;

    const where: any = {};

    if (outletId) where.outletId = outletId;
    if (presenterName) where.presenterName = { contains: presenterName as string, mode: 'insensitive' };
    if (infractionType) where.infractionType = infractionType;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          outlet: {
            select: { id: true, name: true, type: true }
          },
          _count: {
            select: { complaints: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.incident.count({ where })
    ]);

    res.json({
      incidents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ message: 'Error fetching incidents' });
  }
});

// Get single incident
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        outlet: true,
        createdBy: {
          select: { id: true, name: true }
        },
        complaints: {
          select: {
            id: true,
            status: true,
            sentAt: true,
            createdAt: true,
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ incident });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ message: 'Error fetching incident' });
  }
});

// Create incident (authenticated)
router.post(
  '/',
  authenticate,
  [
    body('outletId').notEmpty().isUUID(),
    body('date').notEmpty().isISO8601(),
    body('time').optional(),
    body('programName').optional().trim(),
    body('presenterName').optional().trim(),
    body('description').trim().isLength({ min: 10 }),
    body('mediaUrl').optional().isURL(),
    body('infractionType').optional().isIn(['household_analogy', 'debt_scare', 'insolvency_myth', 'other'])
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        outletId,
        date,
        time,
        programName,
        presenterName,
        description,
        mediaUrl,
        infractionType
      } = req.body;

      // Verify outlet exists
      const outlet = await prisma.mediaOutlet.findUnique({ where: { id: outletId } });
      if (!outlet) {
        return res.status(400).json({ message: 'Invalid outlet ID' });
      }

      const incident = await prisma.incident.create({
        data: {
          outletId,
          date: new Date(date),
          time,
          programName,
          presenterName,
          description,
          mediaUrl,
          infractionType,
          createdById: req.user!.id
        },
        include: {
          outlet: true
        }
      });

      res.status(201).json({ incident });
    } catch (error) {
      console.error('Create incident error:', error);
      res.status(500).json({ message: 'Error creating incident' });
    }
  }
);

// Update incident (only by creator)
router.put(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: req.params.id }
      });

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      if (incident.createdById !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to update this incident' });
      }

      const {
        date,
        time,
        programName,
        presenterName,
        description,
        mediaUrl,
        infractionType
      } = req.body;

      const updated = await prisma.incident.update({
        where: { id: req.params.id },
        data: {
          date: date ? new Date(date) : undefined,
          time,
          programName,
          presenterName,
          description,
          mediaUrl,
          infractionType
        },
        include: {
          outlet: true
        }
      });

      res.json({ incident: updated });
    } catch (error) {
      console.error('Update incident error:', error);
      res.status(500).json({ message: 'Error updating incident' });
    }
  }
);

// Delete incident (only by creator)
router.delete(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const incident = await prisma.incident.findUnique({
        where: { id: req.params.id }
      });

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      if (incident.createdById !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to delete this incident' });
      }

      await prisma.incident.delete({ where: { id: req.params.id } });

      res.json({ message: 'Incident deleted successfully' });
    } catch (error) {
      console.error('Delete incident error:', error);
      res.status(500).json({ message: 'Error deleting incident' });
    }
  }
);

export default router;
