
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { DashboardData } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-primary">{`Valor: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const ChartContainer: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-[400px] flex flex-col">
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 text-center italic mt-1">{subtitle}</p>}
        </div>
        <div className="flex-grow mt-4">
            {children}
        </div>
    </div>
);

const BroadSubcategoryChart: React.FC<{data: DashboardData[], onBarClick: (category: string) => void}> = ({data, onBarClick}) => {
    const chartData = useMemo(() => {
        const aggregated = data.reduce((acc, curr) => {
            const subcat = curr['subcategoria ampla'];
            const valor = typeof curr.valor === 'number' ? curr.valor : 0;
            if (valor > 0 && subcat) {
                 acc[subcat] = (acc[subcat] || 0) + valor;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(aggregated)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => Number(b.value) - Number(a.value))
            .slice(0, 10);
    }, [data]);
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={80} />
                <YAxis tickFormatter={(tick) => formatCurrency(tick)} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Valor" fill="#3b82f6" cursor="pointer" onClick={(data) => onBarClick(data.name)} />
            </BarChart>
        </ResponsiveContainer>
    );
}

const MonthlyTrendChart: React.FC<{data: DashboardData[]}> = ({data}) => {
    const chartData = useMemo(() => {
        const aggregated = data.reduce((acc, curr) => {
            const valor = typeof curr.valor === 'number' ? curr.valor : 0;
            const month = curr.mes?.toLowerCase();
            if (valor > 0 && month) {
                acc[month] = (acc[month] || 0) + valor;
            }
            return acc;
        }, {} as Record<string, number>);

        const monthOrder = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        
        return monthOrder.map(month => ({
            name: month.charAt(0).toUpperCase() + month.slice(1, 3),
            Valor: aggregated[month] || 0,
        }));

    }, [data]);
    
    if (!chartData.some(d => d.Valor > 0)) {
        return <div className="flex items-center justify-center h-full text-gray-500">Sem dados para exibir o gráfico de tendência.</div>
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(tick) => formatCurrency(tick)} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Valor" stroke="#1e40af" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}


const Charts: React.FC<{data: DashboardData[], onBarClick: (category: string) => void}> = ({ data, onBarClick }) => {
    if (!data.length) {
        return (
             <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-lg shadow-md h-[400px] flex items-center justify-center text-gray-500">
                Nenhum dado para exibir nos gráficos.
            </div>
        )
    }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <ChartContainer 
            title="Top 10 Subcategorias Amplas por Valor"
            subtitle="Clique em uma barra para ver o detalhamento."
        >
            <BroadSubcategoryChart data={data} onBarClick={onBarClick} />
        </ChartContainer>
        <ChartContainer title="Tendência Mensal de Despesas">
            <MonthlyTrendChart data={data} />
        </ChartContainer>
    </div>
  );
};

export default Charts;