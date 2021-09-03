import { ResourceOwnerPassword, ModuleOptions } from 'simple-oauth2';
import ApiConfigService from 'src/services/ApiConfigService';

// https://www.npmjs.com/package/simple-oauth2
// https://github.com/lelylan/simple-oauth2/blob/HEAD/API.md#options

const SITE_URL = process.env.REACT_APP_WEBSITE_URL || ('http://localhost:3000' as string);

/* Auth values */
// const USER_PROFILE_URL = `${ApiConfigService.ROOT_PATH}/api/v1/user`;
const AUTHORIZATION_URL = `${ApiConfigService.ROOT_PATH}/login`;
export const REDIRECT_URL = `${SITE_URL}/.netlify/functions/netlify-auth-callback`;
//  const id = process.env.CLIENT_ID || '';
//  const secret = process.env.CLIENT_SECRET || '';
//  const tokenHost = process.env.OAUTH_HOST || '';
//  const tokenPath = process.env.OAUTH_TOKEN_PATH || '';
//  const revokePath = process.env.OAUTH_REVOKE_PATH || '';
//  const authorizationPath = process.env.OAUTH_AUTORIZE_PATH || '';
// const config = {
//   profilePath: USER_PROFILE_URL,
//   /* redirect_uri is the callback url after successful signin */
//   redirect_uri: REDIRECT_URL,
// }

export const config: ModuleOptions = {
  client: {
    id: process.env.OAUTH_CLIENT_ID as string,
    secret: '',
  },
  auth: {
    tokenHost: AUTHORIZATION_URL,
  },
  options: {
    authorizationMethod: 'body',
  },
};

export const ResourceOwnerClient = new ResourceOwnerPassword(config);
