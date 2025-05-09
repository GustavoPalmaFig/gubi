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
    const utcDate = new Date(date);
    return utcDate.toISOString().slice(0, 10);
  }

  /*
   * Formats a date string from 'YYYY-MM-DD' to 'DD-MM-YYYY' or 'YYYY-MM-DD' to Date object
   * @param obj - The object containing the date strings to be formatted
   * @returns The object with formatted date strings
   */
  static formatAllStrToDatePattern(obj: any): any {
    if (obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          const dateParts = obj[key].split('-');
          if (dateParts.length === 3) {
            const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            const formatedDate = dateParts[0].length === 4 ? new Date(obj[key]) : new Date(dateStr);
            obj[key] = this.dateToUTC(formatedDate);
          }
        }
      }
    }
    return obj;
  }

  static dateToUTC(date: Date | string): Date {
    const utcDate = new Date(date);
    utcDate.setMinutes(utcDate.getMinutes() + utcDate.getTimezoneOffset());
    return utcDate;
  }
}
