const { prisma } = require("../utils/database")
const { logger } = require("../utils/logger")

class TransactionMannerService {
  // Create transaction manner
  static async createTransactionManner(mannerData, createdBy) {
    try {
      // Check if manner name already exists
      const existingManner = await prisma.transactionManner.findUnique({
        where: { mannerName: mannerData.mannerName },
      })

      if (existingManner) {
        throw new Error("Transaction manner already exists")
      }

      const manner = await prisma.transactionManner.create({
        data: {
          ...mannerData,
          createdBy,
        },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      logger.info("Transaction manner created", { mannerId: manner.id, createdBy })
      return manner
    } catch (error) {
      logger.error("Create transaction manner failed", { mannerData, error: error.message })
      throw error
    }
  }

  // Get transaction manners with pagination and filtering
  static async getTransactionManners(filters = {}, pagination = {}) {
    try {
      const { search, isActive } = filters
      const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination

      const skip = (page - 1) * limit

      // Build where clause
      const where = {}

      if (search) {
        where.OR = [
          { mannerName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      if (typeof isActive === "boolean") {
        where.isActive = isActive
      }

      const [manners, total] = await Promise.all([
        prisma.transactionManner.findMany({
          where,
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                strReports: true,
                ctrReports: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.transactionManner.count({ where }),
      ])

      return {
        manners,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Get transaction manners failed", { filters, pagination, error: error.message })
      throw error
    }
  }

  // Get transaction manner by ID
  static async getTransactionMannerById(id) {
    try {
      const manner = await prisma.transactionManner.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              strReports: true,
              ctrReports: true,
            },
          },
        },
      })

      if (!manner) {
        throw new Error("Transaction manner not found")
      }

      return manner
    } catch (error) {
      logger.error("Get transaction manner by ID failed", { id, error: error.message })
      throw error
    }
  }

  // Update transaction manner
  static async updateTransactionManner(id, updateData) {
    try {
      const existingManner = await prisma.transactionManner.findUnique({
        where: { id },
      })

      if (!existingManner) {
        throw new Error("Transaction manner not found")
      }

      // Check for name conflicts if updating name
      if (updateData.mannerName && updateData.mannerName !== existingManner.mannerName) {
        const conflictManner = await prisma.transactionManner.findUnique({
          where: { mannerName: updateData.mannerName },
        })

        if (conflictManner) {
          throw new Error("Transaction manner name already exists")
        }
      }

      const manner = await prisma.transactionManner.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      logger.info("Transaction manner updated", { mannerId: id })
      return manner
    } catch (error) {
      logger.error("Update transaction manner failed", { id, updateData, error: error.message })
      throw error
    }
  }

  // Delete transaction manner
  static async deleteTransactionManner(id) {
    try {
      const manner = await prisma.transactionManner.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              strReports: true,
              ctrReports: true,
            },
          },
        },
      })

      if (!manner) {
        throw new Error("Transaction manner not found")
      }

      // Check if manner is being used in reports
      if (manner._count.strReports > 0 || manner._count.ctrReports > 0) {
        throw new Error("Cannot delete transaction manner that is being used in reports")
      }

      await prisma.transactionManner.delete({
        where: { id },
      })

      logger.info("Transaction manner deleted", { mannerId: id })
      return { message: "Transaction manner deleted successfully" }
    } catch (error) {
      logger.error("Delete transaction manner failed", { id, error: error.message })
      throw error
    }
  }

  // Get transaction manners for dropdown
  static async getTransactionMannersDropdown() {
    try {
      const manners = await prisma.transactionManner.findMany({
        where: { isActive: true },
        select: {
          id: true,
          mannerName: true,
        },
        orderBy: { mannerName: "asc" },
      })

      return manners
    } catch (error) {
      logger.error("Get transaction manners dropdown failed", { error: error.message })
      throw error
    }
  }
}

module.exports = { TransactionMannerService }
