/**
 * @description Salesforce Platform Data SDK Bridge for Multi-Framework React App (GA)
 * Uses @salesforce/platform-sdk/data createDataSDK() for authenticated API calls.
 * Falls back to mock mode during local dev / test when the SDK is unavailable.
 */
import { createDataSDK } from '@salesforce/platform-sdk/data';

let sdkInstance: any = null;
let sdkInitPromise: Promise<any> | null = null;
let _isLiveConnected = false;

export async function getSDK(): Promise<any> {
  if (sdkInstance) return sdkInstance;
  if (sdkInitPromise) return sdkInitPromise;

  sdkInitPromise = (async () => {
    try {
      const sdk = await createDataSDK();
      if (sdk && (typeof sdk.fetch === 'function' || sdk.graphql)) {
        sdkInstance = sdk;
        _isLiveConnected = true;
        return sdk;
      }
    } catch (e) {
      console.warn('[WhatChanged] Failed to initialize Data SDK:', e);
    }
    _isLiveConnected = false;
    return null;
  })();

  return sdkInitPromise;
}

export function isSalesforceEnvironment(): boolean {
  return _isLiveConnected;
}

export function isDemoMode(): boolean {
  return !_isLiveConnected;
}

export async function initSalesforceClient(): Promise<void> {
  await getSDK();
}

export async function sfdcFetch(url: string, options?: RequestInit): Promise<Response> {
  const sdk = await getSDK();
  if (sdk?.fetch) {
    return sdk.fetch(url, options);
  }
  return fetch(url, options);
}

export function getClientConnectionStatus(): {
  isLive: boolean;
  environmentLabel: string;
} {
  return {
    isLive: _isLiveConnected,
    environmentLabel: _isLiveConnected ? 'Production' : 'Demo Data',
  };
}
