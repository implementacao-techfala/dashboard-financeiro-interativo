import React, { useState, useMemo } from 'react';
import { DashboardData } from '../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from './icons';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const renderCell = (value: string | number | undefined | null) => {
    if (value === null || value === undefined || value === '') {
        return <span className="text-gray-400 italic">Não informado</span>;
    }
    return value;
};

interface DataTableProps {
  data: DashboardData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Indicador</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? paginatedData.map((item) => (
              <tr key={item.row_number} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{renderCell(item.categoria)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderCell(item['subcategoria especifica'])}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(typeof item.valor === 'number' ? item.valor : 0)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderCell(item.cidade)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderCell(item.data)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'mes bloqueado' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{renderCell(item.status)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {item.indicador === '+' && <ArrowUpCircleIcon className="h-6 w-6 text-green-500 mx-auto" />}
                    {item.indicador === '-' && <ArrowDownCircleIcon className="h-6 w-6 text-red-500 mx-auto" />}
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">Nenhum registro encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
       {totalPages > 1 && (
        <div className="py-4 flex items-center justify-between">
            <button onClick={handlePrevPage} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50">Anterior</button>
            <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
            <button onClick={handleNextPage} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50">Próxima</button>
        </div>
      )}
    </div>
  );
};

export default DataTable;