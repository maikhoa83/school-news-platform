/**
 * React Hook for User Mutations (Role Assignment & Profile Updates)
 * School News Platform - Step 10.1 Users + RBAC Foundation
 *
 * Enforces:
 * - Current actor context injection for self-escalation prevention
 * - Safe mutation states (isLoading, error)
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { assignUserRoles, updateUserProfile } from '../services/userService';
import type { UserRecord, AssignRolesInput, UpdateUserProfileInput } from '../types/user';

export function useUserMutations() {
  const { user, roles } = useAuth();
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const assignRoles = useCallback(
    async (input: AssignRolesInput): Promise<UserRecord> => {
      if (!user?.id) {
        throw new Error('Bạn cần đăng nhập để thực hiện phân quyền.');
      }

      setIsAssigning(true);
      setMutationError(null);
      try {
        const result = await assignUserRoles(input, {
          id: user.id,
          roles: roles || [],
        });
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi phân quyền người dùng';
        setMutationError(msg);
        throw err;
      } finally {
        setIsAssigning(false);
      }
    },
    [user, roles]
  );

  const updateProfile = useCallback(
    async (userId: string, input: UpdateUserProfileInput): Promise<UserRecord> => {
      if (!user?.id) {
        throw new Error('Bạn cần đăng nhập để cập nhật hồ sơ người dùng.');
      }

      setIsUpdating(true);
      setMutationError(null);
      try {
        const result = await updateUserProfile(userId, input, {
          id: user.id,
          roles: roles || [],
        });
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật thông tin';
        setMutationError(msg);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [user, roles]
  );

  return {
    assignRoles,
    updateProfile,
    isAssigning,
    isUpdating,
    error: mutationError,
    clearError: () => setMutationError(null),
  };
}
