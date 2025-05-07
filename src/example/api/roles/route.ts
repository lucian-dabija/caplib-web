import { NextRequest, NextResponse } from 'next/server';
import { getAvailableRoles, getDefaultRole } from '../../../server/utils/roles';

/**
 * GET handler for retrieving available user roles
 * This endpoint returns all configured user roles from environment variables
 * and the default role to be used when no role is specified.
 * 
 * NOTE: This is an example file. When implementing in your own project,
 * import from 'caplib/server' instead of using relative imports.
 */
export async function GET(_req: NextRequest) {
  try {
    // Get roles and default role from the utility functions
    const roles = getAvailableRoles();
    const defaultRole = getDefaultRole();
    
    // Return the roles as JSON
    return NextResponse.json({
      roles,
      defaultRole
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    
    // Provide sensible defaults if something goes wrong
    return NextResponse.json(
      { 
        error: 'Failed to fetch roles',
        roles: ['User', 'Administrator'],
        defaultRole: 'User'
      },
      { status: 500 }
    );
  }
}