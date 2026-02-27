import { addMonths, format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export const calculateEndDate = (startDate: Date, months: number): Date => {
  return addMonths(startDate, months);
};

export const calculatePassedValue = (closedValue: number, percentage: number): number => {
  return closedValue * (percentage / 100);
};

export const calculateProfitMargin = (closedValue: number, passedValue: number): number => {
  return closedValue - passedValue;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'dd/MM/yyyy');
};

export const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};
