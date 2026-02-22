import { Outlet, useLocation } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ModalController } from '@/components/shared/ModalController';

export function MainLayout() {
  const location = useLocation(); 

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 bg-cream-100 min-h-screen">
        <Header />
        <motion.main
          key={location.pathname} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
        >
          <Outlet />
        </motion.main>
      </div>
      <ModalController />
    </div>
  );
}