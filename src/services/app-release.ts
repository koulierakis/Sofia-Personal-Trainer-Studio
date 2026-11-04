export async function checkRelease(currentId: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  const response = await fetcher(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Δεν ήταν διαθέσιμος ο έλεγχος ενημέρωσης.');
  const version = await response.json();
  if (typeof version.id !== 'string' || !version.id) throw new Error('Μη έγκυρη πληροφορία έκδοσης.');
  return version.id !== currentId;
}
