import React, { useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import FilterControls from '../components/FilterControls';
import Charts from '../components/Charts';
import TrendRankings from '../components/TrendRankings';
import { DashboardData } from '../types';
import DrilldownModal from '../components/DrilldownModal';

interface DashboardPageProps {
  allData: DashboardData[];
  filteredData: DashboardData[];
  activeFilters: {
    categoria: string | null;
    cidade: string | null;
    ano: number | null;
    mes: string | null;
  };
  onFilterChange: (filterType: 'categoria' | 'cidade' | 'ano' | 'mes', value: string | number | null) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ allData, filteredData, activeFilters, onFilterChange }) => {
    const [selectedBroadSubcategory, setSelectedBroadSubcategory] = useState<string | null>(null);

    const stats = useMemo(() => {
        const totalValue = filteredData.reduce((acc, item) => acc + (typeof item.valor === 'number' ? item.valor : 0), 0);
        const totalRecords = filteredData.length;
        const uniqueCategories = new Set(filteredData.map(item => item.categoria)).size;

        return { totalValue, totalRecords, uniqueCategories };
    }, [filteredData]);

    const trendData = useMemo(() => {
        let data = allData;
        if (activeFilters.categoria) {
            data = data.filter(item => item.categoria === activeFilters.categoria);
        }
        if (activeFilters.cidade) {
            data = data.filter(item => item.cidade === activeFilters.cidade);
        }
        if (activeFilters.ano) {
            data = data.filter(item => item.ano === activeFilters.ano);
        }
        return data;
    }, [allData, activeFilters.categoria, activeFilters.cidade, activeFilters.ano]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    const handleBarClick = (categoryName: string) => {
        setSelectedBroadSubcategory(categoryName);
    };

    const handleCloseModal = () => {
        setSelectedBroadSubcategory(null);
    };


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Valor Total" value={formatCurrency(stats.totalValue)} icon={<span className="font-bold text-xl">R$</span>} />
                <StatCard title="Total de Registros" value={stats.totalRecords.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
                <StatCard title="Categorias Únicas" value={stats.uniqueCategories.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
            </div>
            
            <FilterControls data={allData} onFilterChange={onFilterChange} activeFilters={activeFilters} />
            
            <TrendRankings data={trendData} />
            
            <Charts data={filteredData} onBarClick={handleBarClick} />

            <DrilldownModal
                isOpen={!!selectedBroadSubcategory}
                onClose={handleCloseModal}
                categoryName={selectedBroadSubcategory}
                data={filteredData}
            />
        </div>
    );
};

export default DashboardPage;