import { HomePage } from './pages/HomePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { PlayPage } from './pages/PlayPage.js';

const routes = [
  { 
    path: '/',
    name: 'Home',
    component: HomePage,
    scene: 'home' 
  },
  { 
    path: '/play', 
    name: 'Play', 
    component: PlayPage, 
    scene: 'default' 
  },
  {
    path: '*',
    name: 'NotFound',
    component: NotFoundPage,
    scene: 'default'
  }
];

export default routes;