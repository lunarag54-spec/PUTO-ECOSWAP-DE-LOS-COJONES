import axios from 'axios';

type ApiErrorShape = {
  message?: string;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
