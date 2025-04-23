<template>
    <div class="caplib-auth-container">
        <!-- Custom Vue Wrapper for CapAuth -->
        <div ref="authContainerRef"></div>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { createRoot } from 'react-dom/client';
import { CapAuth } from '../../react/components/CapAuth';

export default defineComponent({
    name: 'VueCapAuth',
    props: {
        config: {
            type: Object,
            required: true,
        },
        onAuthenticated: {
            type: Function,
            required: true,
        },
        onError: {
            type: Function,
            default: null,
        },
    },
    setup(props) {
        const authContainerRef = ref(null);
        let root = null;

        const renderReactComponent = () => {
            if (!authContainerRef.value) return;

            if (root) {
                root.unmount();
            }

            root = createRoot(authContainerRef.value);
            root.render(
                createElement(CapAuth, {
                    config: props.config,
                    onAuthenticated: props.onAuthenticated,
                    onError: props.onError,
                })
            );
        };

        onMounted(() => {
            renderReactComponent();
        });

        onUnmounted(() => {
            if (root) {
                root.unmount();
            }
        });

        watch(
            () => props.config,
            () => {
                renderReactComponent();
            },
            { deep: true }
        );

        return {
            authContainerRef,
        };
    },
});
</script>

<style scoped>
.caplib-auth-container {
    font-family: sans-serif;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
}
</style>