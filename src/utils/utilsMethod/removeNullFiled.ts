export const  removeNullAndUndefinedFields = (obj:any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  );
}
  