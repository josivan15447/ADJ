const ACTOR_STORAGE_KEY = 'adj_jeruel_actor_name';

export function getActorName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ACTOR_STORAGE_KEY) || 'Tesouraria ADJ';
}

export function setActorName(name: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem(ACTOR_STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(ACTOR_STORAGE_KEY);
  }
}

export function hasActorName(): boolean {
  return getActorName().length > 0;
}
