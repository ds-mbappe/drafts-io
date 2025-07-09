export const setLocalStorageWithExpiry = ({ key, value, ttl = 10 * 24 * 60 * 60 * 1000 }: { key: string, value: any, ttl?: number }) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getLocalStorageWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  
  if (!itemStr) {
    return null;
  }
  
  const item = JSON.parse(itemStr);
  const now = new Date();
  
  // Check if expired
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
};

export const clearLocalStorageKey = (key: string) => {
  localStorage.removeItem(key);
}