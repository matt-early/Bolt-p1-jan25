import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Map, 
  BarChart, 
  Upload,
  UserPlus,
  Settings,
  LogOut 
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { useAuthRequestCount } from '../../hooks/useAuthRequestCount';
import { Badge } from '../common/Badge';

interface AdminSidebarProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
  portalTitle: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  userProfile,
  onSignOut,
  portalTitle
}) => {
  const { count: requestCount } = useAuthRequestCount();
  const [navItems, setNavItems] = useState<Array<{
    icon: any;
    label: string;
    path: string;
    badge?: number;
    subItems?: Array<{ label: string; path: string; }>;
  }>>([]);

  useEffect(() => {
    if (!userProfile) return;
    
    const items = [];

    // Admin-only items
    if (userProfile?.role === 'admin') {
      items.push(
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Settings, label: 'User Management', path: '/admin/users' },
        { 
          icon: UserPlus, 
          label: 'Auth Requests', 
          path: '/admin/auth-requests',
          badge: requestCount
        },
        { icon: Upload, label: 'Import Data', path: '/admin/import' },
      );
    }

    // Admin and Regional items
    if (['admin', 'regional'].includes(userProfile?.role || '')) {
      items.push(
        { icon: Users, label: 'Team Members', path: '/salespeople' },
        { icon: Store, label: 'Stores', path: '/stores' },
        { icon: Map, label: 'Regions', path: '/regions' },
      );
    }

    // Metrics items - available to all but with different views
    if (userProfile?.role === 'team_member') {
      items.push({
        icon: BarChart,
        label: 'My Performance',
        path: '/dashboard'
      });
    } else {
      items.push({
        icon: BarChart,
        label: 'Metrics',
        path: '/metrics/regions',
        subItems: [
          { label: 'By Region', path: '/metrics/regions' },
          { label: 'By Team Member', path: '/metrics/salespeople' }
        ]
      });
    }

    setNavItems(items);
  }, [userProfile?.role, requestCount, userProfile]);

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-gray-800">{portalTitle}</h1>
        </div>
        
        {userProfile && (
          <div className="px-4 py-3 border-b">
            <div className="text-sm font-medium text-gray-900">{userProfile.name}</div>
            <div className="text-xs text-gray-500">{userProfile.role}</div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </div>
                    {item.badge > 0 && (
                      <Badge count={item.badge} className="ml-2" />
                    )}
                  </div>
                </NavLink>
                {item.subItems && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.path}>
                        <NavLink
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block px-4 py-1.5 text-sm rounded-lg transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`
                          }
                        >
                          {subItem.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="border-t p-4">
          <button
            onClick={onSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};