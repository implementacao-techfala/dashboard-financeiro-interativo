
import React, { useMemo } from 'react';
import { DashboardData } from '../types';
import { MESES } from '../constants';

interface FilterControlsProps {
  data: DashboardData[];
  onFilterChange: (filterType: 'categoria' | 'cidade' | 'ano' | 'mes', value: string | number | null) => void;
  activeFilters: { categoria: string | null; cidade: string | null; ano: number | null; mes: string | null };
}

const FilterButton: React.FC<{label: string | number, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
            isActive
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
);


const FilterControls: React.FC<FilterControlsProps> = ({ data, onFilterChange, activeFilters }) => {
  const filters = useMemo(() => {
    const categorias = [...new Set(data.map(item => item.categoria))].sort();
    const cidades = [...new Set(data.map(item => item.cidade))].sort();
    // FIX: Explicitly cast values to numbers in sort comparison to avoid TypeScript errors.
    const anos = [...new Set(data.map(item => item.ano))].sort((a, b) => Number(b) - Number(a));
    return { categorias, cidades, anos };
  }, [data]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Filtrar por Categoria:</h3>
        <div className="flex flex-wrap gap-2">
            <FilterButton label="Todas" isActive={!activeFilters.categoria} onClick={() => onFilterChange('categoria', null)} />
            {filters.categorias.map(cat => (
                <FilterButton key={cat} label={cat} isActive={activeFilters.categoria === cat} onClick={() => onFilterChange('categoria', cat)} />
            ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Filtrar por Cidade:</h3>
        <div className="flex flex-wrap gap-2">
            <FilterButton label="Todas" isActive={!activeFilters.cidade} onClick={() => onFilterChange('cidade', null)} />
            {filters.cidades.map(city => (
                <FilterButton key={city} label={city} isActive={activeFilters.cidade === city} onClick={() => onFilterChange('cidade', city)} />
            ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <h3 className="font-semibold text-gray-700 mb-2">Filtrar por Ano:</h3>
            <div className="flex flex-wrap gap-2">
                <FilterButton label="Todos" isActive={!activeFilters.ano} onClick={() => onFilterChange('ano', null)} />
                {filters.anos.map(year => (
                    <FilterButton key={year} label={year} isActive={activeFilters.ano === year} onClick={() => onFilterChange('ano', year)} />
                ))}
            </div>
        </div>
        <div>
            <h3 className="font-semibold text-gray-700 mb-2">Filtrar por Mês:</h3>
            <div className="flex flex-wrap gap-2">
                <FilterButton label="Todos" isActive={!activeFilters.mes} onClick={() => onFilterChange('mes', null)} />
                {MESES.map(mes => (
                    <FilterButton key={mes} label={mes.charAt(0).toUpperCase() + mes.slice(1)} isActive={activeFilters.mes === mes} onClick={() => onFilterChange('mes', mes)} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
