import React, { useState } from 'react';
import { DashboardData } from '../types';
import { XIcon } from './icons';
import { CATEGORIAS, SUBCATEGORIAS_AMP, SUBCATEGORIAS_ESP, RESPONSAVEIS, STATUS_OPTIONS, MESES, INDICADOR_OPTIONS } from '../constants';

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Partial<DashboardData>) => Promise<void>;
}

const getInitialFormData = (): Partial<DashboardData> => ({
    categoria: '',
    'subcategoria ampla': '',
    'subcategoria especifica': '',
    responsavel: '',
    'competencia / referencia': '',
    valor: undefined,
    indicador: '',
    cidade: '',
    ano: new Date().getFullYear(),
    mes: MESES[new Date().getMonth()],
    data: '',
    status: 'liberado para lançamento',
});

const SelectInput: React.FC<{
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
  placeholder: string;
  required?: boolean;
}> = ({ name, value, onChange, options, placeholder, required }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-600">{placeholder}</label>
    <select id={name} name={name} value={value} onChange={onChange} className="w-full p-2 border rounded bg-white" required={required}>
      <option value="">Selecione...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const TextInput: React.FC<{
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  step?: string;
}> = ({ name, value, onChange, placeholder, type = 'text', required, step}) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={name} className="text-sm font-medium text-gray-600">{placeholder}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} step={step} className="w-full p-2 border rounded" required={required} />
    </div>
);


const AddDataModal: React.FC<AddDataModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<DashboardData>>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'valor' || name === 'ano' ? (value === '' ? undefined : parseFloat(value)) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAdd(formData);
    setIsSubmitting(false);
    setFormData(getInitialFormData());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">Adicionar Novo Registro</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-3">
            <SelectInput name="categoria" value={formData.categoria || ''} onChange={handleChange} options={CATEGORIAS} placeholder="Categoria" required />
            <SelectInput name="subcategoria ampla" value={formData['subcategoria ampla'] || ''} onChange={handleChange} options={SUBCATEGORIAS_AMP} placeholder="Subcategoria Ampla" />
            <SelectInput name="subcategoria especifica" value={formData['subcategoria especifica'] || ''} onChange={handleChange} options={SUBCATEGORIAS_ESP} placeholder="Subcategoria Específica" />
            <TextInput name="competencia / referencia" value={formData['competencia / referencia'] || ''} onChange={handleChange} placeholder="Competência / Referência" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput name="valor" type="number" step="0.01" value={formData.valor ?? ''} onChange={handleChange} placeholder="Valor" required />
                <SelectInput name="responsavel" value={formData.responsavel || ''} onChange={handleChange} options={RESPONSAVEIS} placeholder="Responsável" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput name="cidade" value={formData.cidade || ''} onChange={handleChange} placeholder="Cidade" />
                <TextInput name="data" value={formData.data || ''} onChange={handleChange} placeholder="Data (DD/MM/AA)" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput name="ano" type="number" value={formData.ano ?? ''} onChange={handleChange} placeholder="Ano" />
                <SelectInput name="mes" value={formData.mes || ''} onChange={handleChange} options={MESES} placeholder="Mês" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectInput name="status" value={formData.status || ''} onChange={handleChange} options={STATUS_OPTIONS} placeholder="Status" />
                <SelectInput name="indicador" value={formData.indicador || ''} onChange={handleChange} options={INDICADOR_OPTIONS} placeholder="Indicador (+/-)" />
            </div>
          
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary disabled:bg-gray-400">
                {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddDataModal;