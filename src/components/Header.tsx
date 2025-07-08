import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Plus, List, Film } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Movie & TV Tracker</span>
          </Link>
          
          <nav className="flex items-center space-x-1">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              asChild
              size="sm"
            >
              <Link to="/">Dashboard</Link>
            </Button>
            <Button
              variant={isActive('/entries') ? 'default' : 'ghost'}
              asChild
              size="sm"
            >
              <Link to="/entries">
                <List className="h-4 w-4 mr-2" />
                All Entries
              </Link>
            </Button>
            <Button
              variant={isActive('/entries/new') ? 'default' : 'ghost'}
              asChild
              size="sm"
            >
              <Link to="/entries/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
