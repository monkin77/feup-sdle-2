import { writable } from 'svelte/store';

export const timeline = writable([]);
export const following = writable([]);
export const snackbarError = writable(null);
