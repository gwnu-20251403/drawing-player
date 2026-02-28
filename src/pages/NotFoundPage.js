import { Component } from "../core/Component.js";

export class NotFoundPage extends Component {
  render() {
    const root = document.createElement('div');
    root.className = 'page page--not-found';

    // 상단 타이틀
    const title = document.createElement('h1');
    title.textContent = '404 - 페이지를 찾을 수 없습니다';
    title.className = 'page-title';
  }

  afterMount() {
    
  }

  beforeUnmount() {
    
  }
}