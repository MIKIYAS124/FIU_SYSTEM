const { prisma } = require("../utils/database")
const { logger } = require("../utils/logger")

class CrimeTypeService {
  // Create crime type
  static async createCrimeType(crimeData, createdBy) {
    try {
      // Check if crime name already exists
      const existingCrime = await prisma.crimeType.findUnique({
        where: { crimeName: crimeData.crimeName },
      })

      if (existingCrime) {
        throw new Error("Crime type already exists")
      }

      const crime = await prisma.crimeType.create({
        data: {
          ...crimeData,
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

      logger.info("Crime type created", { crimeId: crime.id, createdBy })
      return crime
    } catch (error) {
      logger.error("Create crime type failed", { crimeData, error: error.message })
      throw error
    }
  }

  // Get crime types with pagination and filtering
  static async getCrimeTypes(filters = {}, pagination = {}) {
    try {
      const { search, severityLevel, isActive } = filters
      const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination

      const skip = (page - 1) * limit

      // Build where clause
      const where = {}

      if (search) {
        where.OR = [
          { crimeName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      if (severityLevel) {
        where.severityLevel = severityLevel
      }

      if (typeof isActive === "boolean") {
        where.isActive = isActive
      }

      const [crimes, total] = await Promise.all([
        prisma.crimeType.findMany({
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
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.crimeType.count({ where }),
      ])

      return {
        crimes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Get crime types failed", { filters, pagination, error: error.message })
      throw error
    }
  }

  // Get crime type by ID
  static async getCrimeTypeById(id) {
    try {
      const crime = await prisma.crimeType.findUnique({
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
            },
          },
        },
      })

      if (!crime) {
        throw new Error("Crime type not found")
      }

      return crime
    } catch (error) {
      logger.error("Get crime type by ID failed", { id, error: error.message })
      throw error
    }
  }

  // Update crime type
  static async updateCrimeType(id, updateData) {
    try {
      const existingCrime = await prisma.crimeType.findUnique({
        where: { id },
      })

      if (!existingCrime) {
        throw new Error("Crime type not found")
      }

      // Check for name conflicts if updating name
      if (updateData.crimeName && updateData.crimeName !== existingCrime.crimeName) {
        const conflictCrime = await prisma.crimeType.findUnique({
          where: { crimeName: updateData.crimeName },
        })

        if (conflictCrime) {
          throw new Error("Crime type name already exists")
        }
      }

      const crime = await prisma.crimeType.update({
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

      logger.info("Crime type updated", { crimeId: id })
      return crime
    } catch (error) {
      logger.error("Update crime type failed", { id, updateData, error: error.message })
      throw error
    }
  }

  // Delete crime type
  static async deleteCrimeType(id) {
    try {
      const crime = await prisma.crimeType.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              strReports: true,
            },
          },
        },
      })

      if (!crime) {
        throw new Error("Crime type not found")
      }

      // Check if crime type is being used in reports
      if (crime._count.strReports > 0) {
        throw new Error("Cannot delete crime type that is being used in reports")
      }

      await prisma.crimeType.delete({
        where: { id },
      })

      logger.info("Crime type deleted", { crimeId: id })
      return { message: "Crime type deleted successfully" }
    } catch (error) {
      logger.error("Delete crime type failed", { id, error: error.message })
      throw error
    }
  }

  // Get crime types for dropdown
  static async getCrimeTypesDropdown() {
    try {
      const crimes = await prisma.crimeType.findMany({
        where: { isActive: true },
        select: {
          id: true,
          crimeName: true,
          severityLevel: true,
        },
        orderBy: { crimeName: "asc" },
      })

      return crimes
    } catch (error) {
      logger.error("Get crime types dropdown failed", { error: error.message })
      throw error
    }
  }

  // Get crime type statistics
  static async getCrimeTypeStatistics() {
    try {
      const stats = await prisma.crimeType.findMany({
        select: {
          id: true,
          crimeName: true,
          severityLevel: true,
          _count: {
            select: {
              strReports: true,
            },
          },
        },
        orderBy: {
          strReports: {
            _count: "desc",
          },
        },
      })

      return stats
    } catch (error) {
      logger.error("Get crime type statistics failed", { error: error.message })
      throw error
    }
  }
}

module.exports = { CrimeTypeService }
