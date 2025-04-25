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
}
