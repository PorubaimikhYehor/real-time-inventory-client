import { Container } from '@app/shared/models/container';
import { Lot } from '@app/shared/models/lot';

/**
 * Factory functions to create test data
 * Provides realistic mock data for testing
 */

/**
 * Create a mock Container
 */
export function createMockContainer(overrides: Partial<Container> = {}): Container {
  return new Container({
    name: 'TEST-CONTAINER-001',
    properties: [
      { name: 'location', value: 'Warehouse A' },
      { name: 'zone', value: 'Zone 1' }
    ],
    ...overrides
  });
}

/**
 * Create multiple mock Containers
 */
export function createMockContainers(count: number = 3): Container[] {
  return Array.from({ length: count }, (_, i) => createMockContainer({
    name: `TEST-CONTAINER-${String(i + 1).padStart(3, '0')}`,
    properties: [
      { name: 'location', value: `Warehouse ${String.fromCharCode(65 + i)}` },
      { name: 'zone', value: `Zone ${i + 1}` }
    ]
  }));
}

/**
 * Create a mock Lot
 */
export function createMockLot(overrides: Partial<Lot> = {}): Lot {
  return new Lot({
    name: 'TEST-LOT-001',
    properties: [
      { name: 'batch', value: 'BATCH-2024-001' },
      { name: 'expiry', value: '2025-12-31' }
    ],
    ...overrides
  });
}

/**
 * Create multiple mock Lots
 */
export function createMockLots(count: number = 3): Lot[] {
  return Array.from({ length: count }, (_, i) => createMockLot({
    name: `TEST-LOT-${String(i + 1).padStart(3, '0')}`,
    properties: [
      { name: 'batch', value: `BATCH-2024-${String(i + 1).padStart(3, '0')}` },
      { name: 'expiry', value: `2025-${String(i + 1).padStart(2, '0')}-28` }
    ]
  }));
}

/**
 * Create mock property definition
 */
export function createMockPropertyDefinition(overrides: any = {}) {
  return {
    name: 'test-property',
    description: 'Test property description',
    type: 0, // String
    ...overrides
  };
}

/**
 * Create multiple mock property definitions
 */
export function createMockPropertyDefinitions(count: number = 3) {
  return Array.from({ length: count }, (_, i) => createMockPropertyDefinition({
    name: `property-${i + 1}`,
    description: `Property ${i + 1} description`,
    type: i % 3 // Vary types
  }));
}

/**
 * Create mock user
 */
export function createMockUser(overrides: any = {}) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'User',
    ...overrides
  };
}

/**
 * Create multiple mock users
 */
export function createMockUsers(count: number = 3) {
  return Array.from({ length: count }, (_, i) => createMockUser({
    id: `123e4567-e89b-12d3-a456-42661417400${i}`,
    email: `user${i + 1}@example.com`,
    firstName: `User`,
    lastName: `${i + 1}`,
    role: i === 0 ? 'Admin' : 'User'
  }));
}

/**
 * Create mock HTTP error response
 */
export function createMockHttpError(status: number = 500, message: string = 'Internal Server Error') {
  return {
    status,
    statusText: message,
    error: { message },
    ok: false,
    headers: new Headers(),
    type: 'error' as const,
    url: 'http://localhost:3000/api/test'
  };
}

/**
 * Create mock pagination response
 */
export function createMockPaginationResponse<T>(items: T[], total?: number) {
  return {
    items,
    totalCount: total ?? items.length,
    page: 1,
    pageSize: items.length
  };
}
