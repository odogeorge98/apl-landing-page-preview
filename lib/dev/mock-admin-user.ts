import type { User } from '@/lib/interfaces/auth';

/** Local preview user for dashboard layout when auth bypass is active. */
export const MOCK_ADMIN_USER: User = {
  id: 'pepp-preview-admin',
  email: 'admin@peppcruise.com',
  role: 'SUPER_ADMIN',
  orgRole: 'OWNER',
  isVerified: true,
  isActive: true,
  organizationId: 'pepp-org-preview',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  organization: {
    id: 'pepp-org-preview',
    name: 'PEPP Cruise',
    type: 'PLATFORM',
    email: 'operations@peppcruise.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const MOCK_PREVIEW_TOKEN = 'pepp-dev-preview-token';
