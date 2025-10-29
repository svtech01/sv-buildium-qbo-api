import { Request, Response } from 'express';
import axios from 'axios';
import dayjs from 'dayjs';
import { PrismaClient } from '@prisma/client';
import { AuthorizationCode } from 'simple-oauth2';

const prisma = new PrismaClient();

let oauthClient: AuthorizationCode;

export async function initOAuth() {
  const client = {
    id: process.env.QBO_CLIENT_ID!,
    secret: process.env.QBO_CLIENT_SECRET!
  };
  const tokenHost = 'https://oauth.platform.intuit.com';
  oauthClient = new AuthorizationCode({
    client,
    auth: {
      tokenHost,
      authorizePath: '/connect/oauth2',
      tokenPath: '/oauth2/v1/tokens/bearer'
    }
  });
}

export function qboAuthRedirect(_req: Request, res: Response) {
  const authorizeUrl = 'https://appcenter.intuit.com/connect/oauth2';
  const params = new URLSearchParams({
    client_id: process.env.QBO_CLIENT_ID!,
    scope: 'com.intuit.quickbooks.accounting',
    response_type: 'code',
    redirect_uri: process.env.QBO_REDIRECT_URI!,
    state: 'svdevops'
  });
  res.redirect(`${authorizeUrl}?${params.toString()}`);
}

export async function qboAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  const realmId = req.query.realmId as string;
  try {
    const tokenConfig = {
      code,
      redirect_uri: process.env.QBO_REDIRECT_URI!,
      scope: 'com.intuit.quickbooks.accounting'
    };
    const result = await oauthClient.getToken(tokenConfig);
    // @ts-ignore
    const token = result.token;
    const expiresAt = dayjs().add(Number(token.expires_in), 'second').toDate();

    await prisma.oAuthToken.create({
      data: {
        provider: 'qbo',
        accessToken: (token as any).access_token as string,
        refreshToken: (token as any).refresh_token as string,
        expiresAt,
        realmId
      }
    });

    res.send('QBO OAuth success. You can close this window.');
  } catch (err: any) {
    res.status(500).send('OAuth failed: ' + (err.message || 'unknown'));
  }
}

async function getValidToken() {
  const t = await prisma.oAuthToken.findFirst({ where: { provider: 'qbo' }, orderBy: { id: 'desc' }});
  if (!t) throw new Error('No QBO token found. Authorize first.');
  if (dayjs(t.expiresAt).isAfter(dayjs().add(60, 'second'))) return t.accessToken;

  // refresh
  const tokenHost = 'https://oauth.platform.intuit.com';
  const basic = Buffer.from(`${process.env.QBO_CLIENT_ID}:${process.env.QBO_CLIENT_SECRET}`).toString('base64');
  const resp = await axios.post(`${tokenHost}/oauth2/v1/tokens/bearer`, new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: t.refreshToken
  }), { headers: { 'Authorization': `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' }});

  const expiresAt = dayjs().add(resp.data.expires_in, 'second').toDate();
  await prisma.oAuthToken.update({ where: { id: t.id }, data: {
    accessToken: resp.data.access_token,
    refreshToken: resp.data.refresh_token || t.refreshToken,
    expiresAt
  }});
  return resp.data.access_token;
}

export async function testListCustomers(_req: Request, res: Response) {
  try {
    const token = await getValidToken();
    const realm = process.env.QBO_REALM_ID || (await prisma.oAuthToken.findFirst({ where: { provider: 'qbo' }, orderBy: { id: 'desc' }}))?.realmId;
    if (!realm) throw new Error('Missing QBO_REALM_ID');
    const base = process.env.QBO_ENV === 'production' ? 'https://quickbooks.api.intuit.com' : 'https://sandbox-quickbooks.api.intuit.com';
    const url = `${base}/v3/company/${realm}/query`;
    const query = "select * from Customer maxresults 5";
    const r = await axios.post(url, query, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/text'
      },
      params: { minorversion: 73 }
    });
    res.json(r.data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function replayDLQ(req: Request, res: Response) {
  const id = Number(req.params.id);
  // TODO: load DLQ row and re-enqueue
  res.json({ ok: true, replayed: id });
}
