import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { userIds } = await req.json();
  if (!Array.isArray(userIds)) {
    return NextResponse.json({ error: 'userIds must be an array' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all users (up to 1000 for simplicity)
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const emailMap: Record<string, string> = {};
  data.users.forEach(user => {
    if (userIds.includes(user.id)) {
      emailMap[user.id] = user.email || user.id;
    }
  });

  return NextResponse.json({ emails: emailMap });
} 