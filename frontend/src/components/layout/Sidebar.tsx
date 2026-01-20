import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  BrainCircuit, 
  GanttChart, 
  Settings,
  HelpCircle,
  LogOut,
  BookOpen,
  MessageCircle,
  Send
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';
import logoSvg from '@/assets/logo.svg';

// Menu section items
const menuItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scenarios', icon: BarChart3, label: 'Scenarios' },
  { to: '/ideation', icon: BrainCircuit, label: 'Ideation' },
  { to: '/roadmaps', icon: GanttChart, label: 'Roadmaps' },
];

// General section items
const generalItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/help', icon: HelpCircle, label: 'Help' },
];

const sidebarVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <motion.div variants={navItemVariants}>
      <Link
        to={to}
        className={`
          flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
          ${isActive 
            ? 'bg-primary-50 text-primary-500 border-l-3 border-primary-500' 
            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
          }
        `}
      >
        <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'}`} />
        {label}
      </Link>
    </motion.div>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-gray-200 bg-white sm:flex">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <img src={logoSvg} alt="Strata-AI Logo" className="h-10 w-10" />
        <span className="text-lg font-bold text-gray-900">Strata-AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6">
        {/* Menu Section */}
        <div className="mb-6">
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>
          <motion.div
            className="flex flex-col gap-1"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            {menuItems.map((item) => (
              <NavItem
                key={item.label}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.to}
              />
            ))}
          </motion.div>
        </div>

        {/* General Section */}
        <div className="mb-6">
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            General
          </p>
          <motion.div
            className="flex flex-col gap-1"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            {generalItems.map((item) => (
              <NavItem
                key={item.label}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.to}
              />
            ))}
            {/* Logout Button */}
            <motion.div variants={navItemVariants}>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 text-gray-400" />
                Logout
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Help & Support Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-4 border border-primary-200">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-5 w-5 text-primary-500" />
            <h4 className="font-semibold text-gray-900">Help & Support</h4>
          </div>
          <div className="space-y-2">
            <a 
              href="/docs" 
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Documentation
            </a>
            <a 
              href="/support" 
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </a>
            <a 
              href="/feedback" 
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Send className="h-4 w-4" />
              Send Feedback
            </a>
          </div>
        </div>
      </nav>
    </aside>
  );
}
