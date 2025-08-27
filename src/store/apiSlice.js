import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fairly-whole-hawk.ngrok-free.app',
    prepareHeaders: (headers) => {
      // Add the ngrok header to bypass browser warnings
      headers.set('ngrok-skip-browser-warning', 'true');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    searchData: builder.query({
      query: (params) => {
        // Add validation to ensure params is not empty
        if (!params || params.trim() === '') {
          console.warn('Search params are empty');
          return '/search'; // Return base search endpoint if no params
        }
        console.log('Final URL will be:', `/search?${params}`);
        return `/search?${params}`;
      },
      // Add error handling
      transformErrorResponse: (response, meta, arg) => {
        console.error('API Error:', response);
        console.error('Request URL:', meta?.request?.url);
        return response.data || response;
      },
    }),
  }),
});

// Export the auto-generated hook for the `searchData` query
export const { useLazySearchDataQuery } = api;