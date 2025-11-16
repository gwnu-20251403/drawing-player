import { HomePage } from './pages/HomePage.js';
import { JazzPage } from './pages/JazzPage.js';
import { LoFiPage } from './pages/LoFiPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

const routes = [
  { 
    path: '/',
    name: 'Home',
    component: HomePage,
    scene: 'home' 
  },
  {
    path: '/jazz',
    name: 'Jazz',
    component: JazzPage,
    scene: 'jazz' 
  },
  {
    path: '/lo-fi',
    name: 'Lo-Fi',
    component: LoFiPage,
    scene: 'lofi' 
  },
  {
    path: '*',
    name: 'NotFound',
    component: NotFoundPage,
    scene: 'default'
  }
];

export default routes;