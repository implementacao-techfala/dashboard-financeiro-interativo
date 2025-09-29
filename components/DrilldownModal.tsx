import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DashboardData } from '../types';
import { XIcon, ArrowLeftIcon } from './icons';

interface DrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string | null;
  data: DashboardData[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // Don't render labels for tiny slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomPieTooltip = ({ active, payload, totalValue }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = totalValue > 0 ? (data.value / totalValue * 100).toFixed(1) : 0;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
        <p className="font-bold mb-1" style={{ color: data.payload.fill }}>{data.name}</p>
        <p className="text-gray-700">
          <span className="font-semibold">Valor:</span> {formatCurrency(data.value)}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Percentual:</span> {percentage}% do total
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800 text-sm">{label}</p>
      </div>
    );
  }
  return null;
};

const ColoredYAxisTick = (props: any) => {
    const { x, y, payload, index } = props;
    const color = COLORS[index % COLORS.length];
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={4} textAnchor="end" fill={color} fontSize={12} fontWeight="500">
                {payload.value}
            </text>
        </g>
    );
};


const DrilldownModal: React.FC<DrilldownModalProps> = ({ isOpen, onClose, categoryName, data }) => {
  const [drilldownLevel, setDrilldownLevel] = useState(0);
  const [selectedSpecificSubcategory, setSelectedSpecificSubcategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed from outside
      setTimeout(() => {
        setDrilldownLevel(0);
        setSelectedSpecificSubcategory(null);
      }, 200); // Delay to allow fade-out animation
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const { pieData, totalValue } = useMemo(() => {
    if (!categoryName) return { pieData: [], totalValue: 0 };

    const categoryData = data.filter(item => item['subcategoria ampla'] === categoryName);

    const aggregated = categoryData.reduce((acc, curr) => {
      const specificSubcat = curr['subcategoria especifica'] || 'Não especificado';
      const valor = typeof curr.valor === 'number' ? curr.valor : 0;
      if (valor > 0) {
        acc[specificSubcat] = (acc[specificSubcat] || 0) + valor;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'. By making the accumulator type explicit, we resolve ambiguity.
    const totalValue = Object.values(aggregated).reduce((sum: number, v) => sum + Number(v), 0);

    const pieData = Object.entries(aggregated)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(b.value) - Number(a.value));
      
    return { pieData, totalValue };

  }, [data, categoryName]);

  const { barData, barTotalValue } = useMemo(() => {
    if (drilldownLevel !== 1 || !selectedSpecificSubcategory || !categoryName) {
      return { barData: [], barTotalValue: 0 };
    }

    const filteredData = data.filter(item => 
        item['subcategoria ampla'] === categoryName && 
        item['subcategoria especifica'] === selectedSpecificSubcategory
    );

    const aggregated = filteredData.reduce((acc, curr) => {
        const competencia = curr['competencia / referencia'] || 'Não especificado';
        const valor = typeof curr.valor === 'number' ? curr.valor : 0;
        if (valor > 0) {
            acc[competencia] = (acc[competencia] || 0) + valor;
        }
        return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(aggregated)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => Number(b.value) - Number(a.value));

    const barTotalValue = barData.reduce((sum, item) => sum + Number(item.value), 0);

    return { barData, barTotalValue };
  }, [data, categoryName, selectedSpecificSubcategory, drilldownLevel]);
  
  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedSpecificSubcategory(data.name);
      setDrilldownLevel(1);
    }
  };

  const handleBack = () => {
    setDrilldownLevel(0);
    setSelectedSpecificSubcategory(null);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] p-6 relative animate-fade-in flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10">
          <XIcon className="h-6 w-6" />
        </button>
        
        {drilldownLevel === 0 && (
            <div className="flex flex-col h-full">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Detalhamento por Subcategoria Específica</h2>
                    <p className="text-accent font-semibold text-lg">{categoryName}</p>
                    <p className="text-gray-600 font-bold text-xl">{formatCurrency(totalValue)}</p>
                </div>
                {pieData.length > 0 ? (
                    <div className="flex-grow min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius="80%"
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    onClick={handlePieClick}
                                    cursor="pointer"
                                >
                                    {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip totalValue={totalValue} />} />
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    wrapperStyle={{ maxHeight: 'calc(100% - 40px)', overflow: 'auto', paddingLeft: '10px' }}
                                    formatter={(value, entry) => {
                                        const { color, payload } = entry as any;
                                        const numericValue = payload?.value || 0;
                                        const percentage = totalValue > 0 ? (numericValue / totalValue * 100).toFixed(1) : 0;
                                        return (
                                            <span style={{ color }} className="text-sm">
                                                {`${value}: `}
                                                <span className="font-semibold">{formatCurrency(numericValue)}</span>
                                                {` (${percentage}%)`}
                                            </span>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        Nenhum dado de subcategoria específica para exibir.
                    </div>
                )}
            </div>
        )}

        {drilldownLevel === 1 && (
             <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                    <button onClick={handleBack} className="p-1 rounded-full hover:bg-gray-200 mr-3 transition-colors">
                        <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
                    </button>
                    <div className="text-center flex-grow">
                        <h2 className="text-xl font-bold text-gray-800">Detalhamento por Competência / Referência</h2>
                        <p className="text-accent font-semibold">{selectedSpecificSubcategory}</p>
                        <p className="text-gray-600 font-bold">{formatCurrency(barTotalValue)}</p>
                    </div>
                    <div className="w-8"></div> {/* Spacer to balance the back button */}
                </div>
                {barData.length > 0 ? (
                    <div className="flex-grow min-h-0 overflow-y-auto pr-4">
                        <ResponsiveContainer width="100%" height={Math.max(400, barData.length * 50)}>
                            <BarChart 
                                data={barData} 
                                layout="vertical" 
                                margin={{ top: 5, right: 30, left: 10, bottom: 20 }}
                                barCategoryGap="30%"
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={250}
                                    tick={<ColoredYAxisTick />}
                                    interval={0}
                                />
                                <Tooltip content={<CustomBarTooltip />} cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} />
                                <Bar dataKey="value" name="Valor">
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                        Nenhum dado de competência/referência para exibir.
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default DrilldownModal;
