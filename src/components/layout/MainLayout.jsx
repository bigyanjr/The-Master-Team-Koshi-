import { Outlet } from 'react-router-dom';
import LandingNav from '../landing/LandingNav';
import LandingFooter from '../landing/LandingFooter';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1 pt-28 sm:pt-32">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
}
