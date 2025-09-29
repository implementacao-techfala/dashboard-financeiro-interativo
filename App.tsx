import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Loader from './components/Loader';
import LogViewer from './components/LogViewer';
import { DocumentTextIcon } from './components/icons';
import { DashboardData } from './types';
import { fetchData } from './services/apiService';
import { logger } from './utils/logger';
import DashboardPage from './pages/DashboardPage';
import DetailsPage from './pages/DetailsPage';

const App: React.FC = () => {
    const [allData, setAllData] = useState<DashboardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
    const [page, setPage] = useState<'dashboard' | 'details'>('dashboard');

    const [activeFilters, setActiveFilters] = useState<{
        categoria: string | null;
        cidade: string | null;
        ano: number | null;
        mes: string | null;
    }>({
        categoria: null,
        cidade: null,
        ano: null,
        mes: null,
    });

    const fetchAndSetData = useCallback(async () => {
        logger.info('fetchAndSetData foi acionado.');
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData();
            setAllData(data);
            logger.info('Dados recebidos e definidos no estado `allData`.', { count: data.length });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(`Falha ao carregar os dados: ${errorMessage}. Verifique os logs para mais detalhes.`);
            logger.error('Erro capturado no componente App ao buscar dados.', { error: err });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAndSetData();
    }, [fetchAndSetData]);

    const filteredData = useMemo(() => {
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
        if (activeFilters.mes) {
            data = data.filter(item => item.mes?.toLowerCase() === activeFilters.mes.toLowerCase());
        }
        logger.info('Filtros aplicados. O estado `filteredData` foi atualizado.', { filter: activeFilters, filteredCount: data.length });
        return data;
    }, [allData, activeFilters]);

    const handleFilterChange = (filterType: 'categoria' | 'cidade' | 'ano' | 'mes', value: string | number | null) => {
        setActiveFilters(prev => ({ ...prev, [filterType]: value }));
    };
    
    const renderContent = () => {
        if (loading) {
            return <Loader />;
        }

        if (allData.length === 0) {
            return (
                <div className="text-center py-16 bg-white rounded-lg shadow-md mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700">Nenhum dado encontrado</h2>
                    <p className="text-gray-500 mt-2">A API pode estar offline ou não há registros para exibir. Tente atualizar.</p>
                </div>
            );
        }

        if (page === 'dashboard') {
            return <DashboardPage
                allData={allData}
                filteredData={filteredData}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
            />;
        }

        if (page === 'details') {
            return <DetailsPage
                data={allData}
            />;
        }

        return null;
    }


    return (
        <div className="min-h-screen bg-neutral">
            <Header
                onRefresh={fetchAndSetData}
                isLoading={loading}
                currentPage={page}
                onNavigate={setPage}
            />
            <main className="p-4 md:p-8">
                {error && <div className="bg-error text-white p-4 rounded-lg mb-4 text-center">{error}</div>}
                {renderContent()}
            </main>
            
            <div className="fixed bottom-4 right-4 z-50">
                <button
                  onClick={() => setIsLogViewerOpen(true)}
                  className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-secondary transition-transform transform hover:scale-110"
                  aria-label="Mostrar Logs"
                >
                  <DocumentTextIcon className="h-6 w-6" />
                </button>
            </div>
            <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />
        </div>
    );
};

export default App;