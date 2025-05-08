export default class Utils {
  static handleErrorMessage(error: unknown): string {
    if (!error) return '';

    if (typeof error === 'string') {
      return error;
    } else if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  }

  static adjustDateByMonths(date: Date | string, months: number): Date {
    const refDate = new Date(date);
    return new Date(refDate.getUTCFullYear(), refDate.getUTCMonth() + months, refDate.getUTCDate());
  }

  static addOneWeekToDate(date: Date): Date {
    const refDate = new Date(date);
    return new Date(refDate.getUTCFullYear(), refDate.getUTCMonth(), refDate.getUTCDate() + 7);
  }

  static formatToDateOnly(date: Date | string): string {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().slice(0, 10);
  }
}
