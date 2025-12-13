import { NextResponse } from 'next/server';

type TurnstileSiteKeyResponse = {
  siteKey: string | null;
};

export async function GET() {
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
    process.env.TURNSTILE_SITE_KEY ??
    null;

  const body: TurnstileSiteKeyResponse = { siteKey };

  return NextResponse.json(body, {
    headers: {
      'cache-control': 'no-store',
    },
  });
}

