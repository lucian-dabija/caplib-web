/**
 * Simple Vue adapter for CapAuth React component
 * This approach avoids Vue component complexity and just exports a function
 * that can be used to render the React component in a Vue application
 */

import { CapAuth as ReactCapAuth } from '../../react/components/CapAuth';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import type { User } from '../../types';

interface CapAuthOptions {
    config: any;
    onAuthenticated: (user: User) => void;
    onError?: (error: Error) => void;
}

/**
 * Mounts the CapAuth React component into a specified element
 */
function mountCapAuth(element: HTMLElement, options: CapAuthOptions): () => void {
    const root = createRoot(element);

    root.render(
        createElement(ReactCapAuth, {
            config: options.config,
            onAuthenticated: options.onAuthenticated,
            onError: options.onError
        })
    );

    // Return a cleanup function
    return () => {
        root.unmount();
    };
}

export default {
    /**
     * Mount CapAuth into an element
     */
    mount: mountCapAuth,

    /**
     * Vue directive (for use with v-capauth)
     */
    directive: {
        mounted(el: HTMLElement, binding: any) {
            const cleanup = mountCapAuth(el, binding.value);
            (el as any).__capauth_cleanup = cleanup;
        },
        unmounted(el: HTMLElement) {
            const cleanup = (el as any).__capauth_cleanup;
            if (typeof cleanup === 'function') {
                cleanup();
            }
        }
    }
};