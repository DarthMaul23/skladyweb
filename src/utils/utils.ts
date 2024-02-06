import { Configuration } from '../api/openapi/configuration';
import AppSetting from '../../appsettings.json';

export async function getTokenOrRedirectToLogin(): Promise<string> {
  const token = localStorage.getItem('token');

  return token!;
}

export function getDefaultApiConfig(useToken = true) {
  const config = new Configuration();

  if (useToken) {
    config.accessToken = getTokenOrRedirectToLogin;
  }

  config.basePath = removeTrailingSlash(AppSetting.BaseUrl);

  return config;
}

export function removeTrailingSlash(str: string) {
  return str.replace(/\/+$/, '');
}