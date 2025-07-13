import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { createServerSideClient } from '@/lib/supabase/server';

export async function requireAuth(request: NextRequest) {
  try {
    const supabase = await createServerSideClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export async function requireAdmin(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email || ''))
      .limit(1);

    if (dbUser.length === 0 || !dbUser[0].isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return { user, dbUser: dbUser[0] };
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
