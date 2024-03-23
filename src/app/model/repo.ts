export interface Repo {
  id: number;
  name: string;
  volumeLocation: string;
  latestPush: Date | null;
  latestFetch: Date | null;
  isProtecting: boolean | null;
}
