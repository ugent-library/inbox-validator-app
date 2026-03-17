import Inbox from './routes/Inbox.svelte';
import Notification from './routes/Notification.svelte';
import NotFound from './routes/NotFound.svelte';

export default {
    '/': Inbox,
    '/notification/:name': Notification,
    // The catch-all route must always be last
    '*': NotFound
};
