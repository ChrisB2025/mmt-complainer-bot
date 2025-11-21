import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get league table of worst offenders
router.get('/league-table', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { groupBy = 'presenter', limit = '50' } = req.query;

    if (groupBy === 'presenter') {
      // Get all incidents with complaints
      const incidents = await prisma.incident.findMany({
        where: {
          presenterName: { not: null },
          complaints: { some: {} }
        },
        include: {
          outlet: {
            select: { name: true, type: true }
          },
          complaints: {
            select: { severityRating: true }
          }
        }
      });

      // Group by presenter
      const presenterStats = new Map<string, {
        presenter: string;
        outlets: Set<string>;
        incidentCount: number;
        complaintCount: number;
        ratings: number[];
      }>();

      incidents.forEach(incident => {
        const presenter = incident.presenterName!;
        if (!presenterStats.has(presenter)) {
          presenterStats.set(presenter, {
            presenter,
            outlets: new Set(),
            incidentCount: 0,
            complaintCount: 0,
            ratings: []
          });
        }

        const stats = presenterStats.get(presenter)!;
        stats.outlets.add(incident.outlet.name);
        stats.incidentCount++;
        stats.complaintCount += incident.complaints.length;

        incident.complaints.forEach(c => {
          if (c.severityRating !== null) {
            stats.ratings.push(c.severityRating);
          }
        });
      });

      // Convert to array and calculate averages
      const leaderboard = Array.from(presenterStats.values()).map(stats => ({
        presenter: stats.presenter,
        outlets: Array.from(stats.outlets),
        incidentCount: stats.incidentCount,
        complaintCount: stats.complaintCount,
        avgSeverityRating: stats.ratings.length > 0
          ? Math.round((stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length) * 10) / 10
          : null
      }));

      // Sort by complaint count (descending), then by avg rating (descending)
      leaderboard.sort((a, b) => {
        if (b.complaintCount !== a.complaintCount) {
          return b.complaintCount - a.complaintCount;
        }
        return (b.avgSeverityRating || 0) - (a.avgSeverityRating || 0);
      });

      res.json({
        groupBy: 'presenter',
        leaderboard: leaderboard.slice(0, parseInt(limit as string))
      });

    } else if (groupBy === 'outlet') {
      // Get all outlets with incidents
      const outlets = await prisma.mediaOutlet.findMany({
        include: {
          incidents: {
            include: {
              complaints: {
                select: { severityRating: true }
              }
            }
          }
        }
      });

      const leaderboard = outlets
        .map(outlet => {
          const incidents = outlet.incidents;
          const complaintCount = incidents.reduce((sum, inc) => sum + inc.complaints.length, 0);

          if (complaintCount === 0) return null;

          const allRatings: number[] = [];
          incidents.forEach(inc => {
            inc.complaints.forEach(c => {
              if (c.severityRating !== null) {
                allRatings.push(c.severityRating);
              }
            });
          });

          return {
            outlet: outlet.name,
            outletType: outlet.type,
            incidentCount: incidents.length,
            complaintCount,
            avgSeverityRating: allRatings.length > 0
              ? Math.round((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length) * 10) / 10
              : null
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => {
          if (b.complaintCount !== a.complaintCount) {
            return b.complaintCount - a.complaintCount;
          }
          return (b.avgSeverityRating || 0) - (a.avgSeverityRating || 0);
        });

      res.json({
        groupBy: 'outlet',
        leaderboard: leaderboard.slice(0, parseInt(limit as string))
      });

    } else {
      return res.status(400).json({ message: 'Invalid groupBy parameter. Use "presenter" or "outlet"' });
    }

  } catch (error) {
    console.error('Get league table error:', error);
    res.status(500).json({ message: 'Error fetching league table' });
  }
});

// Get overall platform statistics
router.get('/overview', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalIncidents,
      totalComplaints,
      totalUsers,
      totalOutlets,
      sentComplaints
    ] = await Promise.all([
      prisma.incident.count(),
      prisma.complaint.count(),
      prisma.user.count(),
      prisma.mediaOutlet.count(),
      prisma.complaint.count({ where: { status: 'sent' } })
    ]);

    // Get average severity rating
    const allComplaints = await prisma.complaint.findMany({
      select: { severityRating: true }
    });

    const ratings = allComplaints
      .map(c => c.severityRating)
      .filter((r): r is number => r !== null);

    const avgSeverityRating = ratings.length > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
      : null;

    res.json({
      totalIncidents,
      totalComplaints,
      totalUsers,
      totalOutlets,
      sentComplaints,
      draftComplaints: totalComplaints - sentComplaints,
      avgSeverityRating
    });

  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ message: 'Error fetching overview statistics' });
  }
});

export default router;
