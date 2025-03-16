/**
 * Format a number as Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a bill number
 */
export function generateBillNumber(
  type: 'GST' | 'NON-GST',
  count: number
): string {
  const prefix = type === 'GST' ? 'GST' : 'NON';
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${prefix}${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
}

/**
 * Convert date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Filter bills by date range
 */
export function filterBillsByDateRange(
  bills: any[],
  startDate: Date,
  endDate: Date
): any[] {
  return bills.filter((bill) => {
    const billDate = new Date(bill.createdAt);
    return billDate >= startDate && billDate <= endDate;
  });
}

/**
 * Group bills by category
 */
export function groupBillsByCategory(bills: any[]): { [key: string]: any[] } {
  return bills.reduce((groups, bill) => {
    const category = bill.billCategory;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(bill);
    return groups;
  }, {} as { [key: string]: any[] });
}

/**
 * Calculate total revenue from bills
 */
export function calculateTotalRevenue(bills: any[]): number {
  return bills.reduce((total, bill) => total + bill.total, 0);
}

/**
 * Check if a string is a valid Aadhar number (12 digits)
 */
export function isValidAadhar(aadhar: string): boolean {
  return /^\d{12}$/.test(aadhar);
}

/**
 * Check if a string is a valid phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}
