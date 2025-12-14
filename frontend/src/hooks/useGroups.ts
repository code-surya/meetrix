import { useState, useCallback } from 'react';
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const useGroups = (eventId: number | string | null) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(API_ENDPOINTS.GROUPS.LIST, {
        params: { event_id: eventId },
      });

      if (response.data.success) {
        setGroups(response.data.data?.groups || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch groups');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const createGroup = useCallback(
    async (groupData: { eventId: number; name: string; maxMembers: number }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post(API_ENDPOINTS.GROUPS.CREATE, {
          group: {
            event_id: groupData.eventId,
            name: groupData.name,
            max_members: groupData.maxMembers,
          },
        });

        if (response.data.success) {
          const newGroup = response.data.data?.group;
          setGroups((prev) => [...prev, newGroup]);
          return { success: true, group: newGroup };
        }

        return { success: false, error: 'Failed to create group' };
      } catch (err: any) {
        const errorMsg = err.response?.data?.error?.message || 'Failed to create group';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const joinGroup = useCallback(async (groupId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(API_ENDPOINTS.GROUPS.JOIN(groupId), {
        invite_code: '', // Will be handled by backend if needed
      });

      if (response.data.success) {
        await fetchGroups(); // Refresh groups list
        return { success: true };
      }

      return { success: false, error: 'Failed to join group' };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to join group';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup,
    joinGroup,
  };
};

