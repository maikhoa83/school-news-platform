/**
 * Public Service Layer Facade for Users & RBAC
 * Re-exports domain functions from src/modules/users/services/userService
 */

export * from '../modules/users/services/userService';
export {
  listUsers,
  getUserById,
  listRoles,
  listPermissions,
  getUserStats,
  assignUserRoles,
  updateUserProfile,
  countActiveSuperAdmins,
  UserServiceError,
} from '../modules/users/services/userService';
export type { UserServiceErrorCode } from '../modules/users/services/userService';
