const { prisma } = require("../utils/database")
const { AuthUtils } = require("../utils/auth")
const { logger } = require("../utils/logger")

class UserService {
  // Create user
  static async createUser(userData, createdBy) {
    try {
      // Check if username or email already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username: userData.username }, { email: userData.email }],
        },
      })

      if (existingUser) {
        throw new Error("Username or email already exists")
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(userData.password)

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          middleName: userData.middleName,
          lastName: userData.lastName,
          role: userData.role,
          createdBy,
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      })

      logger.info("User created", { userId: user.id, createdBy })
      return user
    } catch (error) {
      logger.error("Create user failed", { userData: { ...userData, password: "[REDACTED]" }, error: error.message })
      throw error
    }
  }

  // Get users with pagination and filtering
  static async getUsers(filters = {}, pagination = {}) {
    try {
      const { search, role, isActive, createdBy } = filters

      const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination

      const skip = (page - 1) * limit

      // Build where clause
      const where = {}

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ]
      }

      if (role) {
        where.role = role
      }

      if (typeof isActive === "boolean") {
        where.isActive = isActive
      }

      if (createdBy) {
        where.createdBy = createdBy
      }

      // Get users
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            creator: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ])

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      logger.error("Get users failed", { filters, pagination, error: error.message })
      throw error
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      if (!user) {
        throw new Error("User not found")
      }

      return user
    } catch (error) {
      logger.error("Get user by ID failed", { id, error: error.message })
      throw error
    }
  }

  // Update user
  static async updateUser(id, updateData, updatedBy) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        throw new Error("User not found")
      }

      // Check for username/email conflicts
      if (updateData.username || updateData.email) {
        const conflictUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  updateData.username ? { username: updateData.username } : {},
                  updateData.email ? { email: updateData.email } : {},
                ].filter((obj) => Object.keys(obj).length > 0),
              },
            ],
          },
        })

        if (conflictUser) {
          throw new Error("Username or email already exists")
        }
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          middleName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      logger.info("User updated", { userId: id, updatedBy })
      return user
    } catch (error) {
      logger.error("Update user failed", { id, updateData, error: error.message })
      throw error
    }
  }

  // Delete user (soft delete by deactivating)
  static async deleteUser(id, deletedBy) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Deactivate user instead of hard delete
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      })

      // Invalidate all sessions
      await prisma.userSession.updateMany({
        where: { userId: id },
        data: { isActive: false },
      })

      logger.info("User deleted (deactivated)", { userId: id, deletedBy })
      return { message: "User deactivated successfully" }
    } catch (error) {
      logger.error("Delete user failed", { id, error: error.message })
      throw error
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Verify current password
      const isValidPassword = await AuthUtils.comparePassword(currentPassword, user.passwordHash)

      if (!isValidPassword) {
        throw new Error("Current password is incorrect")
      }

      // Hash new password
      const hashedPassword = await AuthUtils.hashPassword(newPassword)

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      })

      // Invalidate all sessions except current one
      await prisma.userSession.updateMany({
        where: {
          userId,
          // Keep current session active if provided
        },
        data: { isActive: false },
      })

      logger.info("Password changed", { userId })
      return { message: "Password changed successfully" }
    } catch (error) {
      logger.error("Change password failed", { userId, error: error.message })
      throw error
    }
  }
}

module.exports = { UserService }
