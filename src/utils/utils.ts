import { Configuration } from '../api/openapi/configuration';
import AppSetting from '../../appsettings.json';

export function getDefaultApiConfig(useToken = true) {
  const config = new Configuration();
  const token = localStorage.getItem('authToken'); // Synchronously getting the token

  console.log(token);

  if (useToken && token) {
    config.accessToken = token;
  }

  config.basePath = removeTrailingSlash(AppSetting.BaseUrl);
  return config;
}

export function removeTrailingSlash(str: string) {
  return str.replace(/\/+$/, '');
}