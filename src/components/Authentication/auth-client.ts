import ClientOAuth2 from 'client-oauth2';
import ApiConfigService from 'src/services/ApiConfigService';

interface ModuleOptions {
  clientId: string | undefined;
  clientSecret: string | undefined;
  accessTokenUri: string;
  authorizationUri: string;
  redirectUri: string;
  scopes: string[];
}
// https://www.npmjs.com/package/client-oauth2

const AUTHORIZATION_URL = `${ApiConfigService.ROOT_PATH}/api/v1/user/token`;
// const REDIRECT_URL = `${ApiConfigService.ROOT_PATH}`;
// const id = process.env.OAUTH_CLIENT_ID || '';
//  const secret = process.env.CLIENT_SECRET || '';
//  const tokenHost = process.env.OAUTH_HOST || '';
//  const tokenPath = process.env.OAUTH_TOKEN_PATH || '';
//  const revokePath = process.env.OAUTH_REVOKE_PATH || '';
//  const authorizationPath = process.env.OAUTH_AUTORIZE_PATH || '';

export const config: ModuleOptions = {
  clientId: process.env.OAUTH_CLIENT_ID,
  // NOTE With the client-oauth2 lib, refresh doesn't work if no secret is provided
  // so we give a dummy secret here. It's not more dangerous than having no authentication
  // scheme at all and didn't find a way to securely authenticate a public client with Hydra
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  accessTokenUri: AUTHORIZATION_URL,
  authorizationUri: AUTHORIZATION_URL,
  redirectUri: '/',
  scopes: ['login'], // TODO scopes
};

export const authClient = new ClientOAuth2(config);
