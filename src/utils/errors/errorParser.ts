export const errorParser = (
  error: Record<string, unknown>,
): string | unknown => {
  switch (typeof error) {
    case 'object': {
      if (error.message) {
        return error.message;
      }
      return JSON.stringify(error);
    }
    case 'string': {
      return error;
    }
    default:
      return error;
  }
};
