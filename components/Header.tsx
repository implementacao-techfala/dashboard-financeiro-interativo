import React from 'react';
import { ChartPieIcon, TableCellsIcon } from './icons';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  currentPage: 'dashboard' | 'details';
  onNavigate: (page: 'dashboard' | 'details') => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-200'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span>{label}</span>
  </button>
);


const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, currentPage, onNavigate }) => {
  return (
    <header className="bg-base-100 shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-800 hidden md:block">Dashboard Financeiro</h1>
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <NavButton
            label="Dashboard"
            icon={<ChartPieIcon className="h-5 w-5" />}
            isActive={currentPage === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
          <NavButton
            label="Registros"
            icon={<TableCellsIcon className="h-5 w-5" />}
            isActive={currentPage === 'details'}
            onClick={() => onNavigate('details')}
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            aria-label="Atualizar dados"
        >
            <span>Atualizar</span>
            <span className={isLoading ? 'animate-spin inline-block' : 'inline-block'}>🔄</span>
        </button>
      </div>
    </header>
  );
};

export default Header;