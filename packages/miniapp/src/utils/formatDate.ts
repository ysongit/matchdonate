export const formatDate = (unixSeconds?: bigint): string =>  {
  const newDate = new Date(Number(unixSeconds) * 1000);
  return newDate.toLocaleDateString();
}
