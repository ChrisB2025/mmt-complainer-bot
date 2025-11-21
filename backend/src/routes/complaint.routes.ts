import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { sendComplaintEmail } from '../services/email.service';

const router = Router();

// Get user's complaints
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { userId: req.user!.id },
      include: {
        incident: {
          include: {
            outlet: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Get single complaint
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await prisma.complaint.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        incident: {
          include: {
            outlet: true
          }
        }
      }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Error fetching complaint' });
  }
});

// Update complaint (edit letter)
router.put(
  '/:id',
  authenticate,
  [body('letterContent').trim().isLength({ min: 50 })],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const complaint = await prisma.complaint.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.id
        }
      });

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.status === 'sent') {
        return res.status(400).json({ message: 'Cannot edit a sent complaint' });
      }

      const updated = await prisma.complaint.update({
        where: { id: req.params.id },
        data: { letterContent: req.body.letterContent },
        include: {
          incident: {
            include: { outlet: true }
          }
        }
      });

      res.json({ complaint: updated });
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ message: 'Error updating complaint' });
    }
  }
);

// Send complaint
router.post(
  '/:id/send',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const complaint = await prisma.complaint.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.id
        },
        include: {
          incident: {
            include: { outlet: true }
          },
          user: true
        }
      });

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.status === 'sent') {
        return res.status(400).json({ message: 'Complaint already sent' });
      }

      const outlet = complaint.incident.outlet;
      if (!outlet.complaintEmail) {
        return res.status(400).json({
          message: 'No complaint email configured for this outlet',
          complaintUrl: outlet.complaintUrl
        });
      }

      // Send the email
      await sendComplaintEmail({
        to: outlet.complaintEmail,
        from: complaint.user.email,
        subject: `Complaint: ${complaint.incident.programName || 'Broadcast'} - ${complaint.incident.date.toISOString().split('T')[0]}`,
        content: complaint.letterContent,
        replyTo: complaint.user.email
      });

      // Update complaint status
      const updated = await prisma.complaint.update({
        where: { id: req.params.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          sentTo: outlet.complaintEmail
        }
      });

      res.json({
        message: 'Complaint sent successfully',
        complaint: updated
      });
    } catch (error) {
      console.error('Send complaint error:', error);
      res.status(500).json({ message: 'Error sending complaint' });
    }
  }
);

// Delete complaint (only drafts)
router.delete(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const complaint = await prisma.complaint.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.id
        }
      });

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.status === 'sent') {
        return res.status(400).json({ message: 'Cannot delete a sent complaint' });
      }

      await prisma.complaint.delete({ where: { id: req.params.id } });

      res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
      console.error('Delete complaint error:', error);
      res.status(500).json({ message: 'Error deleting complaint' });
    }
  }
);

export default router;
