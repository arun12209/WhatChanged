export const APP_NAME = 'WhatChanged';
export const APP_TAGLINE = 'Your Salesforce org, explained.';
export const APP_SUBTITLE = 'Salesforce Change Intelligence';

export const DEFAULT_PAGE_SIZE = 50;
export const AUTO_REFRESH_INTERVAL_MS = 60000; // 60 seconds

export const API_ENDPOINTS = {
  SUMMARY: '/services/apexrest/what-changed/v1/summary',
  EVENTS: '/services/apexrest/what-changed/v1/events',
  PEOPLE: '/services/apexrest/what-changed/v1/people',
  INSIGHTS: '/services/apexrest/what-changed/v1/insights',
};
