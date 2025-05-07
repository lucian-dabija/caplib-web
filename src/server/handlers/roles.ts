import { NextRequest, NextResponse } from 'next/server';
import { getAvailableRoles, getDefaultRole } from '../utils/roles';

export async function GET(_req: NextRequest) {
  try {
    const roles = getAvailableRoles();
    const defaultRole = getDefaultRole();
    
    return NextResponse.json({
      roles,
      defaultRole
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch roles',
        roles: ['User', 'Administrator', 'Developer'],
        defaultRole: 'User'
      },
      { status: 500 }
    );
  }
}