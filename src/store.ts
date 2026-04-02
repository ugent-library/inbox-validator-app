import { writable } from 'svelte/store';
import { type Notification, type Agent } from './inbox';
import { THIS_ACTOR, THIS_ORIGIN } from './globals';

function createPersistentStore<T>(key: string, startValue: T) {
    // 1. Get initial value from localStorage or use the default
    const saved = localStorage.getItem(key);
    const initial = saved ? JSON.parse(saved) : startValue;

    const store = writable<T>(initial);

    // 2. Subscribe to changes and save to localStorage
    store.subscribe(value => {
        localStorage.setItem(key, JSON.stringify(value));
    });

    return store;
}

export const notificationData = writable<Notification | null>(null);
export const defaultActor = createPersistentStore<Agent>('actor_config',THIS_ACTOR);
export const defaultOrigin = createPersistentStore<Agent>('origin_config',THIS_ORIGIN);