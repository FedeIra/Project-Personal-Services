import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkError(error) ||
      [500, 502, 503, 504].includes(error.response?.status ?? 0)
    );
  },
});

axios.defaults.timeout = 15000;

export const axiosConfiguration = axios;
