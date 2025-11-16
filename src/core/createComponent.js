export function createComponent({ template, setup }) {
    return function mount(rootEl, props = {}) {
        rootEl.innerHTML = template(props);
        const ctx = setup({ rootEl, props }) || {};
        return {
            destroy() {
                ctx.destroy?.();
                rootEl.innerHTML = '';
            }
        }
    }
}