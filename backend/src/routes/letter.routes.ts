import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { generateComplaintLetter } from '../services/claude.service';

const router = Router();

// Generate letter for an incident
router.post(
  '/',
  authenticate,
  [body('incidentId').notEmpty().isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { incidentId } = req.body;

      // Check if user already has a complaint for this incident
      const existingComplaint = await prisma.complaint.findFirst({
        where: {
          incidentId,
          userId: req.user!.id
        }
      });

      if (existingComplaint) {
        return res.status(400).json({
          message: 'You already have a complaint for this incident',
          complaint: existingComplaint
        });
      }

      // Get incident details
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId },
        include: { outlet: true }
      });

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Count existing complaints for this incident (for variation)
      const existingComplaintsCount = await prisma.complaint.count({
        where: { incidentId }
      });

      // Generate the letter using Claude
      const letterContent = await generateComplaintLetter(
        incident,
        user,
        existingComplaintsCount
      );

      // Create the complaint record
      const complaint = await prisma.complaint.create({
        data: {
          incidentId,
          userId: req.user!.id,
          letterContent,
          status: 'draft'
        },
        include: {
          incident: {
            include: { outlet: true }
          }
        }
      });

      res.status(201).json({
        message: 'Letter generated successfully',
        complaint,
        outlet: incident.outlet
      });
    } catch (error) {
      console.error('Generate letter error:', error);
      res.status(500).json({ message: 'Error generating letter' });
    }
  }
);

// Regenerate letter for existing complaint
router.post(
  '/regenerate/:complaintId',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const complaint = await prisma.complaint.findFirst({
        where: {
          id: req.params.complaintId,
          userId: req.user!.id
        },
        include: {
          incident: {
            include: { outlet: true }
          }
        }
      });

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      if (complaint.status === 'sent') {
        return res.status(400).json({ message: 'Cannot regenerate a sent complaint' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Use a higher count to ensure different variation
      const existingComplaintsCount = await prisma.complaint.count({
        where: { incidentId: complaint.incidentId }
      });

      const letterContent = await generateComplaintLetter(
        complaint.incident,
        user,
        existingComplaintsCount + 10 // Offset to get different variation
      );

      const updated = await prisma.complaint.update({
        where: { id: complaint.id },
        data: { letterContent },
        include: {
          incident: {
            include: { outlet: true }
          }
        }
      });

      res.json({
        message: 'Letter regenerated successfully',
        complaint: updated
      });
    } catch (error) {
      console.error('Regenerate letter error:', error);
      res.status(500).json({ message: 'Error regenerating letter' });
    }
  }
);

export default router;
