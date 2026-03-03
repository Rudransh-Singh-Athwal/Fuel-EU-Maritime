import { describe, it, expect, vi } from 'vitest';
import { RouteService } from './RouteService';

describe('RouteService', () => {
  it('should fetch all routes correctly', async () => {
    const mockRepo = { findAll: vi.fn().mockResolvedValue([{ id: 1, routeId: 'R001' }]) };
    const service = new RouteService(mockRepo as any);

    const result = await service.getAllRoutes();
    expect(result).toHaveLength(1);
    expect(result[0].routeId).toBe('R001');
  });
});
