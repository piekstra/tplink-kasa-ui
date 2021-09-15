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

const AUTHORIZATION_URL = `${ApiConfigService.ROOT_PATH}/user/token`;

export const config: ModuleOptions = {
  clientId: '',
  // NOTE With the client-oauth2 lib, refresh doesn't work if no secret is provided
  // so we give a dummy secret here. It's not more dangerous than having no authentication
  // scheme at all and didn't find a way to securely authenticate a public client with Hydra
  clientSecret: 'ignored?',
  accessTokenUri: AUTHORIZATION_URL,
  authorizationUri: '',
  redirectUri: '',
  scopes: ['user'],
};

export const authClient = new ClientOAuth2(config);
