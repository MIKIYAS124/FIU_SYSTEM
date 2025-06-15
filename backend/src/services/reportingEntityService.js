const { prisma } = require("../utils/database")
const { logger } = require("../utils/logger")

class ReportingEntityService {
  // Create reporting entity
  static async createReportingEntity(entityData, createdBy) {
    try {
      // Check if tax ID or registration number already exists
      const existingEntity = await prisma.reportingEntity.findFirst({
        where: {
          OR: [{ taxId: entityData.taxId }, { registrationNumber: entityData.registrationNumber }],
        },
      })

      if (existingEntity) {
        throw new Error("Tax ID or Registration Number already exists")
      }

      const entity = await prisma.reportingEntity.create({
        data: {
          ...entityData,
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

      logger.info("Reporting entity created", { entityId: entity.id, createdBy })
      return entity
    } catch (error) {
      logger.error("Create reporting entity failed", { entityData, error: error.message })
      throw error
    }
  }

  // Get reporting entities with pagination and filtering
  static async getReportingEntities(filters = {}, pagination = {}) {
    try {
      const { search, status, country, businessType } = filters
      const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination

      const skip = (page - 1) * limit

      // Build where clause
      const where = {}

      if (search) {
        where.OR = [
          { entityName: { contains: search, mode: "insensitive" } },
          { taxId: { contains: search, mode: "insensitive" } },
          { businessType: { contains: search, mode: "insensitive" } },
          { registrationNumber: { contains: search, mode: "insensitive" } },
        ]
      }

      if (status) {
        where.status = status
      }

      if (country) {
        where.country = country
      }

      if (businessType) {
        where.businessType = { contains: businessType, mode: "insensitive" }
      }

      const [entities, total] = await Promise.all([
        prisma.reportingEntity.findMany({
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
                branches: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.reportingEntity.count({ where }),
      ])

      return {
        entities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Get reporting entities failed", { filters, pagination, error: error.message })
      throw error
    }
  }

  // Get reporting entity by ID
  static async getReportingEntityById(id) {
    try {
      const entity = await prisma.reportingEntity.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          branches: {
            select: {
              id: true,
              branchName: true,
              branchCode: true,
              isActive: true,
            },
          },
        },
      })

      if (!entity) {
        throw new Error("Reporting entity not found")
      }

      return entity
    } catch (error) {
      logger.error("Get reporting entity by ID failed", { id, error: error.message })
      throw error
    }
  }

  // Update reporting entity
  static async updateReportingEntity(id, updateData) {
    try {
      const existingEntity = await prisma.reportingEntity.findUnique({
        where: { id },
      })

      if (!existingEntity) {
        throw new Error("Reporting entity not found")
      }

      // Check for conflicts if updating tax ID or registration number
      if (updateData.taxId || updateData.registrationNumber) {
        const conflictEntity = await prisma.reportingEntity.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  updateData.taxId ? { taxId: updateData.taxId } : {},
                  updateData.registrationNumber ? { registrationNumber: updateData.registrationNumber } : {},
                ].filter((obj) => Object.keys(obj).length > 0),
              },
            ],
          },
        })

        if (conflictEntity) {
          throw new Error("Tax ID or Registration Number already exists")
        }
      }

      const entity = await prisma.reportingEntity.update({
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

      logger.info("Reporting entity updated", { entityId: id })
      return entity
    } catch (error) {
      logger.error("Update reporting entity failed", { id, updateData, error: error.message })
      throw error
    }
  }

  // Delete reporting entity
  static async deleteReportingEntity(id) {
    try {
      const entity = await prisma.reportingEntity.findUnique({
        where: { id },
        include: {
          branches: true,
        },
      })

      if (!entity) {
        throw new Error("Reporting entity not found")
      }

      // Check if entity has branches
      if (entity.branches.length > 0) {
        throw new Error("Cannot delete reporting entity with existing branches")
      }

      await prisma.reportingEntity.delete({
        where: { id },
      })

      logger.info("Reporting entity deleted", { entityId: id })
      return { message: "Reporting entity deleted successfully" }
    } catch (error) {
      logger.error("Delete reporting entity failed", { id, error: error.message })
      throw error
    }
  }

  // Get reporting entities for dropdown
  static async getReportingEntitiesDropdown() {
    try {
      const entities = await prisma.reportingEntity.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          entityName: true,
          businessType: true,
        },
        orderBy: { entityName: "asc" },
      })

      return entities
    } catch (error) {
      logger.error("Get reporting entities dropdown failed", { error: error.message })
      throw error
    }
  }
}

module.exports = { ReportingEntityService }
