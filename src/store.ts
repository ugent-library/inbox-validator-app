import { writable } from 'svelte/store';
import { type Notification } from './inbox';
export const appData = writable<Notification | null>(null);