// ==============================================================================
// BHARAT LOOMTEX – Permission & Task Assignment Rights Engine
// Hierarchy:
// 1. Mr. Sumeet Khungar (MD) -> Can assign tasks to everyone.
// 2. Meenakshi Khungar -> Can assign tasks ONLY to:
//    - Chandan Goswami (Production, HR & Design Head)
//    - Marketing Head (Position Unfulfilled)
//    - Accounts Head
// ==============================================================================

export const CORE_USER_IDS = {
  SUMEET_KHUNGAR: '00000000-0000-0000-0000-000000000001',
  MEENAKSHI_KHUNGAR: '00000000-0000-0000-0000-000000000002',
  CHANDAN_GOSWAMI: '00000000-0000-0000-0000-000000000011',
  MARKETING_HEAD: '00000000-0000-0000-0000-000000000012',
  ACCOUNTS_HEAD: '00000000-0000-0000-0000-000000000013',
};

// The 3 department heads that Meenakshi Khungar has rights to assign tasks to
export const MEENAKSHI_ASSIGNABLE_IDS = [
  CORE_USER_IDS.CHANDAN_GOSWAMI,
  CORE_USER_IDS.MARKETING_HEAD,
  CORE_USER_IDS.ACCOUNTS_HEAD,
];

export interface AssignmentPermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether an assigner has organizational rights to assign a task to an assignee.
 */
export function validateTaskAssignmentRights(
  assigner: { id: string; role: string; full_name?: string },
  assigneeId: string
): AssignmentPermissionResult {
  // 1. Mr. Sumeet Khungar (MD / Admin) can assign tasks to EVERYONE
  if (assigner.id === CORE_USER_IDS.SUMEET_KHUNGAR || assigner.role === 'admin') {
    return { allowed: true };
  }

  // 2. Meenakshi Khungar can assign tasks ONLY to Chandan Goswami, Marketing Head, and Accounts Head
  if (assigner.id === CORE_USER_IDS.MEENAKSHI_KHUNGAR || assigner.role === 'manager') {
    if (MEENAKSHI_ASSIGNABLE_IDS.includes(assigneeId)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason:
        'Policy Restriction: Meenakshi Khungar is authorized to assign tasks only to: 1. Chandan Goswami (Production, HR & Design Head), 2. Marketing Head, 3. Accounts Head.',
    };
  }

  // 3. Department Heads / Employees cannot assign tasks upwards or laterally unless authorized
  return {
    allowed: false,
    reason: 'Policy Restriction: You do not have permissions to assign tasks. Only MD Mr. Sumeet Khungar and Director Meenakshi Khungar can assign tasks.',
  };
}

/**
 * Returns the list of profile IDs a user is authorized to assign tasks to.
 * Returns 'all' if the user is Mr. Sumeet Khungar (MD / Admin).
 */
export function getAuthorizedAssigneeIds(assigner: { id: string; role: string }): string[] | 'all' {
  if (assigner.id === CORE_USER_IDS.SUMEET_KHUNGAR || assigner.role === 'admin') {
    return 'all';
  }
  if (assigner.id === CORE_USER_IDS.MEENAKSHI_KHUNGAR || assigner.role === 'manager') {
    return [...MEENAKSHI_ASSIGNABLE_IDS];
  }
  return [];
}
