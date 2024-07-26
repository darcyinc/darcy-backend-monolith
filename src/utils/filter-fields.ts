export const filterFields = (allowedFields: [string, string][], data: Record<string, unknown> | unknown) => {
  const filtered = {} as Record<string, unknown>;

  for (const [key, value] of allowedFields) {
    filtered[key] = (data as Record<string, unknown>)[value];
  }

  return filtered;
};
