const { prisma } = require("../utils/database")
const { logger } = require("../utils/logger")

class DashboardService {
  // Get super admin dashboard statistics
  static async getSuperAdminStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalReportingEntities,
        activeReportingEntities,
        totalTransactionManners,
        activeTransactionManners,
        totalCrimeTypes,
        activeCrimeTypes,
        totalStrReports,
        totalCtrReports,
        recentActivities,
      ] = await Promise.all([
        // User statistics
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),

        // Reporting entity statistics
        prisma.reportingEntity.count(),
        prisma.reportingEntity.count({ where: { status: "ACTIVE" } }),

        // Transaction manner statistics
        prisma.transactionManner.count(),
        prisma.transactionManner.count({ where: { isActive: true } }),

        // Crime type statistics
        prisma.crimeType.count(),
        prisma.crimeType.count({ where: { isActive: true } }),

        // Report statistics
        prisma.strReport.count(),
        prisma.ctrReport.count(),

        // Recent activities (audit logs)
        prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
      ])

      // Monthly report statistics
      const monthlyStats = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          'STR' as report_type,
          COUNT(*) as count
        FROM str_reports
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        UNION ALL
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          'CTR' as report_type,
          COUNT(*) as count
        FROM ctr_reports
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `

      return {
        overview: {
          totalUsers,
          activeUsers,
          totalReportingEntities,
          activeReportingEntities,
          totalTransactionManners,
          activeTransactionManners,
          totalCrimeTypes,
          activeCrimeTypes,
          totalStrReports,
          totalCtrReports,
        },
        recentActivities,
        monthlyStats,
      }
    } catch (error) {
      logger.error("Get super admin stats failed", { error: error.message })
      throw error
    }
  }

  // Get intermediate admin dashboard statistics
  static async getIntermediateAdminStats(userId) {
    try {
      // Get user's reporting entity (assuming intermediate admin belongs to one entity)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          // This would need to be adjusted based on your data model
          // For now, we'll get all branches they created
        },
      })

      const [
        totalBranches,
        activeBranches,
        totalDataEncoders,
        activeDataEncoders,
        totalStrReports,
        totalCtrReports,
        recentActivities,
      ] = await Promise.all([
        // Branch statistics (created by this user)
        prisma.branch.count({ where: { createdBy: userId } }),
        prisma.branch.count({ where: { createdBy: userId, isActive: true } }),

        // Data encoder statistics (created by this user)
        prisma.user.count({ where: { createdBy: userId, role: "DATA_ENCODER" } }),
        prisma.user.count({ where: { createdBy: userId, role: "DATA_ENCODER", isActive: true } }),

        // Report statistics from branches created by this user
        prisma.strReport.count({
          where: {
            transactionBranch: {
              createdBy: userId,
            },
          },
        }),
        prisma.ctrReport.count({
          where: {
            transactionBranch: {
              createdBy: userId,
            },
          },
        }),

        // Recent activities
        prisma.auditLog.findMany({
          where: { userId },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
      ])

      return {
        overview: {
          totalBranches,
          activeBranches,
          totalDataEncoders,
          activeDataEncoders,
          totalStrReports,
          totalCtrReports,
        },
        recentActivities,
      }
    } catch (error) {
      logger.error("Get intermediate admin stats failed", { userId, error: error.message })
      throw error
    }
  }

  // Get data encoder dashboard statistics
  static async getDataEncoderStats(userId) {
    try {
      const [
        totalStrReports,
        submittedStrReports,
        draftStrReports,
        totalCtrReports,
        submittedCtrReports,
        totalAttachments,
        recentReports,
      ] = await Promise.all([
        // STR report statistics
        prisma.strReport.count({ where: { createdBy: userId } }),
        prisma.strReport.count({ where: { createdBy: userId, status: "SUBMITTED" } }),
        prisma.strReport.count({ where: { createdBy: userId, status: "DRAFT" } }),

        // CTR report statistics
        prisma.ctrReport.count({ where: { createdBy: userId } }),
        prisma.ctrReport.count({ where: { createdBy: userId, status: "SUBMITTED" } }),

        // Attachment statistics
        prisma.reportAttachment.count({ where: { uploadedBy: userId } }),

        // Recent reports
        prisma.strReport.findMany({
          where: { createdBy: userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            reportNumber: true,
            status: true,
            createdAt: true,
            fundAmountBirr: true,
          },
        }),
      ])

      return {
        overview: {
          totalStrReports,
          submittedStrReports,
          draftStrReports,
          totalCtrReports,
          submittedCtrReports,
          totalAttachments,
        },
        recentReports,
      }
    } catch (error) {
      logger.error("Get data encoder stats failed", { userId, error: error.message })
      throw error
    }
  }

  // Get system health status
  static async getSystemHealth() {
    try {
      const [databaseStatus, activeSessionsCount, recentErrorsCount, systemSettings] = await Promise.all([
        // Database health check
        prisma.$queryRaw`SELECT 1 as status`
          .then(() => "healthy")
          .catch(() => "unhealthy"),

        // Active sessions
        prisma.userSession.count({
          where: {
            isActive: true,
            expiresAt: { gt: new Date() },
          },
        }),

        // Recent errors (last 24 hours)
        prisma.auditLog.count({
          where: {
            action: "ERROR",
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),

        // System settings
        prisma.systemSetting.findMany({
          where: { isPublic: true },
          select: {
            settingKey: true,
            settingValue: true,
          },
        }),
      ])

      return {
        database: databaseStatus,
        activeSessions: activeSessionsCount,
        recentErrors: recentErrorsCount,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        settings: systemSettings.reduce((acc, setting) => {
          acc[setting.settingKey] = setting.settingValue
          return acc
        }, {}),
      }
    } catch (error) {
      logger.error("Get system health failed", { error: error.message })
      throw error
    }
  }
}

module.exports = { DashboardService }
