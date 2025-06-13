import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import https from 'https';
import { AssetsConfig } from './AssetsConfig';
import { ApiLoginResponse, TokenResponse } from './interfaces/Response/Service';

export class AssetsServerBase {
  protected readonly config: AssetsConfig;
  private tokenResponse: TokenResponse = {};
  private readonly tokenValidity: number;
  private readonly axiosInstance: AxiosInstance;

  // Replacement policies
  public static readonly FOLDER_REPLACE_POLICY_AUTO_RENAME = 'AUTO_RENAME';
  public static readonly FOLDER_REPLACE_POLICY_MERGE = 'MERGE';
  public static readonly FOLDER_REPLACE_POLICY_THROW_EXCEPTION = 'THROW_EXCEPTION';

  public static readonly FILE_REPLACE_POLICY_AUTO_RENAME = 'AUTO_RENAME';
  public static readonly FILE_REPLACE_POLICY_OVERWRITE = 'OVERWRITE';
  public static readonly FILE_REPLACE_POLICY_OVERWRITE_IF_NEWER = 'OVERWRITE_IF_NEWER';
  public static readonly FILE_REPLACE_POLICY_REMOVE_SOURCE = 'REMOVE_SOURCE';
  public static readonly FILE_REPLACE_POLICY_THROW_EXCEPTION = 'THROW_EXCEPTION';
  public static readonly FILE_REPLACE_POLICY_DO_NOTHING = 'DO_NOTHING';

  constructor(config: AssetsConfig) {
    this.config = config;
    this.tokenValidity = (config.tokenValidityInMinutes ?? 30) * 60 * 1000;

    this.axiosInstance = axios.create({
      baseURL: config.serverUrl,
      httpsAgent: new https.Agent({ rejectUnauthorized: config.rejectUnauthorized }),
    });
  }

  // Generic verbs
  public get(service: string, params: Record<string, any> = {}) {
    return this.call(service, 'GET', { params });
  }

  public post(service: string, data: Record<string, any> = {}, sendAsJson = false) {
    return this.call(service, 'POST', { data }, sendAsJson);
  }

  public put(service: string, data: Record<string, any> = {}, sendAsJson = false) {
    return this.call(service, 'PUT', { data }, sendAsJson);
  }

  public delete(service: string, params: Record<string, any> = {}) {
    return this.call(service, 'DELETE', { params });
  }

  public download(service: string, filePath: string) {
    return this.downloadFile(service, filePath);
  }

  public setToken(TokenResponse: TokenResponse): void {
    this.tokenResponse = TokenResponse;
  }

  public getToken(): TokenResponse {
    return this.tokenResponse;
  }

  public isTokenValid(): boolean {
    return (
      !!this.tokenResponse.authToken &&
      !!this.tokenResponse.authTimestamp &&
      Date.now() - this.tokenResponse.authTimestamp < this.tokenValidity
    );
  }

  // Main wrapper
  private async call(service: string, method: Method, options: AxiosRequestConfig, sendAsJson = true): Promise<any> {
    if (!this.isTokenValid()) {
      this.tokenResponse = {};
    }

    if (!this.tokenResponse.authToken) {
      await this.authenticate();
    }

    try {
      return await this.callWithAuth(service, method, options, sendAsJson);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await this.authenticate();
        return await this.callWithAuth(service, method, options, sendAsJson);
      }
      throw err;
    }
  }

  // Request builder with auth
  private async callWithAuth(
    service: string,
    method: Method,
    options: AxiosRequestConfig,
    sendAsJson: boolean,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      method,
      url: service,
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${this.tokenResponse.authToken ?? 'placeholder'}`,
      },
    };

    // Handle multipart/form-data if needed
    if (!sendAsJson && (method === 'POST' || method === 'PUT') && config.data) {
      const formData = new FormData();
      for (const key in config.data) {
        formData.append(key, config.data[key]);
      }
      config.data = formData;
      config.headers = {
        ...config.headers,
        ...formData.getHeaders(),
      };
    }

    const response = await this.axiosInstance.request(config);
    const data = response.data;

    if (data && typeof data === 'object' && 'errorcode' in data) {
      const error = new Error(data.message || 'Unknown error from Assets Server');
      (error as any).errorcode = data.errorcode;
      (error as any).errorname = data.errorname;
      throw error;
    }

    return data;
  }

  // Token handshake
  public async authenticate(): Promise<TokenResponse> {
    const form = new FormData();
    form.append('username', this.config.username);
    form.append('password', this.config.password);
    const response = await this.axiosInstance.post<ApiLoginResponse>('/services/apilogin', form, {
      headers: form.getHeaders(),
    });

    if (response.data.loginSuccess) {
      this.tokenResponse.authToken = response.data.authToken;
      this.tokenResponse.authTimestamp = Date.now();
      return this.tokenResponse;
    } else {
      throw new Error(response.data.loginFaultMessage || 'Login failed');
    }
  }

  // For file streams (download)
  private async downloadFile(service: string, filePath: string): Promise<string> {
    // Ensure authentication is valid
    if (!this.isTokenValid()) {
      this.tokenResponse = {};
    }

    if (!this.tokenResponse.authToken) {
      await this.authenticate();
    }

    try {
      return await this.downloadFileWithAuth(service, filePath);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await this.authenticate();
        return await this.downloadFileWithAuth(service, filePath);
      }
      throw err;
    }
  }

  private async downloadFileWithAuth(service: string, filePath: string): Promise<string> {
    const response = await this.axiosInstance.get(service, {
      headers: { Authorization: `Bearer ${this.tokenResponse.authToken ?? 'placeholder'}` },
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  }
}
