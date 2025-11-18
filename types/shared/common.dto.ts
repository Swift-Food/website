/**
 * Shared DTOs used across the application
 */

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AddressDto {
  street: string;
  city: string;
  postcode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface ValidationErrorDto {
  field: string;
  message: string;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}
