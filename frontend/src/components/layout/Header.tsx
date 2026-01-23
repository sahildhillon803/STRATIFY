import { Bell, Search, Plus, ChevronDown, FileText, Map, Lightbulb, BarChart3, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useSearchStore } from '@/stores/search.store';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, formatTimeAgo } from '@/services/notification.service';
import { debouncedSearch } from '@/services/search.service';
import type { SearchResult } from '@/types/search.types';

// Modal type mapping for action buttons
type ModalActionType = 'createScenario' | 'createIdea' | 'createRoadmap';

// Page configuration for titles, subtitles, tabs, and action buttons
const pageConfig: Record<string, {
  title: string;
  subtitle: string;
  tabs?: string[];
  actionButton?: { label: string; icon: React.ElementType; modalType: ModalActionType };
}> = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Overview of your startup metrics and insights',
    tabs: ['Overview', 'Analytics', 'Reports'],
  },
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Overview of your startup metrics and insights',
    tabs: ['Overview', 'Analytics', 'Reports'],
  },
  '/scenarios': {
    title: 'Scenarios',
    subtitle: 'Test financial impact of business decisions',
    actionButton: { label: 'New Scenario', icon: Plus, modalType: 'createScenario' },
  },
  '/ideation': {
    title: 'Ideation',
    subtitle: 'AI-powered pivot and growth ideas',
    actionButton: { label: 'Generate Ideas', icon: Plus, modalType: 'createIdea' },
  },
  '/roadmaps': {
    title: 'Roadmaps',
    subtitle: 'Execute your strategies with actionable plans',
    actionButton: { label: 'New Roadmap', icon: Plus, modalType: 'createRoadmap' },
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Manage your account and preferences',
  },
};

export function Header() {
  const { user } = useAuthStore();
  const { openModal, activeTab, setActiveTab } = useUiStore();
  const { notifications, getUnreadCount } = useNotificationStore();
  const { query, results, isOpen: isSearchOpen, setQuery, setResults, setIsOpen: setIsSearchOpen, clearSearch } = useSearchStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  
  const unreadCount = getUnreadCount();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsSearchOpen(true);
    
    if (value.trim().length >= 2) {
      debouncedSearch(value, (searchResults) => {
        setResults(searchResults);
      });
    } else {
      setResults([]);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    navigate(result.link);
    clearSearch();
    searchInputRef.current?.blur();
  };

  // Get icon for search result type
  const getSearchResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'scenario': return BarChart3;
      case 'roadmap': return Map;
      case 'idea': return Lightbulb;
      case 'report': return FileText;
      default: return FileText;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: { id: string; link?: string }) => {
    markNotificationAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsNotificationsOpen(false);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setIsSearchOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchOpen]);

  // Get current page config or default
  const currentPage = pageConfig[location.pathname] || {
    title: 'Page',
    subtitle: 'Welcome to Strata-AI',
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 bg-cream-100 px-6 py-4">
      {/* Top Row: Title, Search, Actions, Profile */}
      <div className="flex items-center justify-between mb-4">
        {/* Left: Page Title & Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentPage.title}</h1>
          <p className="text-sm text-gray-500">{currentPage.subtitle}</p>
        </div>

        {/* Right: Search, Action Button, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleSearchChange}
              onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
              placeholder="Search scenarios, roadmaps, reports..."
              className="w-72 rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {isSearchOpen && query.length >= 2 && (
              <div 
                id="search-dropdown"
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto"
              >
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No results found for "{query}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try searching for scenarios, roadmaps, or reports</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((result) => {
                      const ResultIcon = getSearchResultIcon(result.type);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                            <ResultIcon className="h-4 w-4 text-primary-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.description}</p>
                          </div>
                          <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Button (context-specific) */}
          {currentPage.actionButton && (
            <button 
              onClick={() => openModal(currentPage.actionButton!.modalType)}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <currentPage.actionButton.icon className="h-4 w-4" />
              {currentPage.actionButton.label}
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="relative rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
            >
              <Bell className="h-5 w-5" />
              {/* Notification indicator dot */}
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-primary-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            notification.type === 'warning' ? 'bg-warning' :
                            notification.type === 'error' ? 'bg-danger' :
                            notification.type === 'success' ? 'bg-success' : 'bg-primary-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                  {getInitials(user.fullName)}
                </div>
                {/* Name & Email */}
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    Profile Settings
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    Preferences
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Tabs */}
      {currentPage.tabs && (
        <div className="flex items-center">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            {currentPage.tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
