export class Component {
  constructor(props = {}) {
    this.props = props;
    this.el = null;
  }

  render() {
    const div = document.createElement('div');
    div.textContent = 'Default Component';
    return div;
  }

  mount(container) {
    this.el = this.render();
    container.appendChild(this.el);
    this.afterMount();
  }

  afterMount() {}

  beforeUnmount() {}

  unmount() {
    this.beforeUnmount();
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  }
}