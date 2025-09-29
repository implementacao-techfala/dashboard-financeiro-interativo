import React, { useState, useMemo } from 'react';
import { DashboardData } from '../types';
import DataTable from '../components/DataTable';
import { MagnifyingGlassIcon } from '../components/icons';

interface DetailsPageProps {
  data: DashboardData[];
}

const DetailsPage: React.FC<DetailsPageProps> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const searchedData = useMemo(() => {
        if (!searchTerm) return data;
        
        const lowercasedTerm = searchTerm.toLowerCase();
        
        return data.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(lowercasedTerm)
            )
        );
    }, [data, searchTerm]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Registros Detalhados</h2>
                <div className="relative w-full md:max-w-md">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar em todos os campos..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Caixa de pesquisa"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>
            <DataTable data={searchedData} />
        </div>
    );
};

export default DetailsPage;