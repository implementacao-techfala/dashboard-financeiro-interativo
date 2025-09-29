import React, { useMemo } from 'react';
import { DashboardData } from '../types';
import { MESES } from '../constants';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from './icons';

interface Trend {
  name: string;
  change: number;
  value1: number;
  value2: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const calculateTrends = (data: DashboardData[]) => {
    const monthlyData: Record<string, Record<string, number>> = data.reduce((acc, item) => {
        const key = `${item.ano}-${item.mes?.toLowerCase()}`;
        const subcat = item['subcategoria ampla'];
        const valor = typeof item.valor === 'number' ? item.valor : 0;
        
        if (!subcat || valor <= 0 || !item.mes || !item.ano) return acc;

        if (!acc[key]) acc[key] = {};
        acc[key][subcat] = (acc[key][subcat] || 0) + valor;
        return acc;
    }, {} as Record<string, Record<string, number>>);

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const [yearA, monthA] = a.split('-');
        const [yearB, monthB] = b.split('-');
        const dateA = new Date(Number(yearA), MESES.indexOf(monthA));
        const dateB = new Date(Number(yearB), MESES.indexOf(monthB));
        return dateB.getTime() - dateA.getTime();
    });

    if (sortedMonths.length < 2) return { growing: [], declining: [], period1: null, period2: null };

    const lastMonthKey = sortedMonths[0];
    const prevMonthKey = sortedMonths[1];
    const lastMonthData = monthlyData[lastMonthKey];
    const prevMonthData = monthlyData[prevMonthKey];

    const allSubcats = new Set([...Object.keys(lastMonthData), ...Object.keys(prevMonthData)]);
    const changes: Trend[] = [];

    allSubcats.forEach(subcat => {
        const val2 = lastMonthData[subcat] || 0;
        const val1 = prevMonthData[subcat] || 0;

        if (val1 === 0 && val2 > 0) {
            changes.push({ name: subcat, change: Infinity, value1: val1, value2: val2 });
        } else if (val1 > 0 && val2 > 0) {
            const change = ((val2 - val1) / val1) * 100;
            if (change !== 0) {
              changes.push({ name: subcat, change, value1: val1, value2: val2 });
            }
        } else if (val1 > 0 && val2 === 0) {
             changes.push({ name: subcat, change: -100, value1: val1, value2: val2 });
        }
    });

    changes.sort((a, b) => b.change - a.change);
    const growing = changes.filter(c => c.change > 0).slice(0, 5);
    const declining = changes.filter(c => c.change < 0).sort((a, b) => a.change - b.change).slice(0, 5);
    
    const formatPeriod = (periodKey: string) => {
      const [year, month] = periodKey.split('-');
      return `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`;
    }

    return { growing, declining, period1: formatPeriod(prevMonthKey), period2: formatPeriod(lastMonthKey) };
};

const TrendList: React.FC<{title: string, data: Trend[], icon: React.ReactNode, colorClass: string}> = ({ title, data, icon, colorClass}) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800 ml-2">{title}</h3>
        </div>
        {data.length > 0 ? (
            <ul className="space-y-3">
                {data.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                        <div className="flex-1 truncate pr-2">
                           <span className="font-semibold text-gray-700">{index + 1}. {item.name}</span>
                           <p className="text-xs text-gray-500">{formatCurrency(item.value1)} → {formatCurrency(item.value2)}</p>
                        </div>
                        <span className={`font-bold px-2 py-1 rounded-md text-xs ${colorClass}`}>
                           {item.change === Infinity ? 'Novo' : `${item.change.toFixed(0)}%`}
                        </span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-center text-gray-500 py-4">Nenhuma tendência significativa encontrada.</p>
        )}
    </div>
);

const TrendRankings: React.FC<{ data: DashboardData[] }> = ({ data }) => {
    const { growing, declining, period1, period2 } = useMemo(() => calculateTrends(data), [data]);
    
    if(!period1 || !period2) {
        return (
            <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex items-center justify-center text-gray-500">
                Dados insuficientes para calcular tendências (necessário pelo menos 2 meses de dados).
            </div>
        )
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tendências de Despesas por Subcategoria</h2>
            <p className="text-sm text-gray-600 mb-4">Comparando {period1} com {period2}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TrendList 
                    title="Top 5 em Crescimento"
                    data={growing}
                    icon={<ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />}
                    colorClass="bg-green-100 text-green-800"
                />
                <TrendList 
                    title="Top 5 em Queda"
                    data={declining}
                    icon={<ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />}
                    colorClass="bg-red-100 text-red-800"
                />
            </div>
        </div>
    );
};

export default TrendRankings;
