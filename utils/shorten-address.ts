export function shortenAddress(address?: string): string {
  if (!address) return "";
  const firstPart = address.substring(0, 8);
  const lastPart = address.substring(address.length - 9, address.length - 1);

  return `${firstPart}...${lastPart}`;
}
