import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Fuel, 
  Info, 
  TrendingDown, 
  TrendingUp, 
  Settings2, 
  Car, 
  Wrench, 
  Euro, 
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from './lib/utils';

interface CarData {
  name: string;
  consumption: number; // kWh/100km or L/100km
  maintenance: number;
  type: 'electric' | 'combustion';
  image: string;
  logo: string;
}

const DEFAULT_ELECTRIC: CarData = {
  name: 'Tesla Model 3 (RWD)',
  consumption: 15.5,
  maintenance: 300,
  type: 'electric',
  image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png'
};

const DEFAULT_COMBUSTION: CarData = {
  name: 'BMW 320i',
  consumption: 7.2,
  maintenance: 800,
  type: 'combustion',
  image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg'
};

export default function App() {
  // Global Inputs
  const [annualKm, setAnnualKm] = useState(15000);
  const [electricityPrice, setElectricityPrice] = useState(0.20); // Home price
  const [publicChargingPrice, setPublicChargingPrice] = useState(0.45);
  const [homeChargingPercent, setHomeChargingPercent] = useState(80);
  const [fuelPrice, setFuelPrice] = useState(1.70);

  // Car Data
  const [electricCar, setElectricCar] = useState<CarData>(DEFAULT_ELECTRIC);
  const [combustionCar, setCombustionCar] = useState<CarData>(DEFAULT_COMBUSTION);

  // UI State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingCarType, setEditingCarType] = useState<'electric' | 'combustion' | null>(null);

  // Calculations
  const effectiveElectricityPrice = useMemo(() => {
    return (electricityPrice * (homeChargingPercent / 100)) + (publicChargingPrice * ((100 - homeChargingPercent) / 100));
  }, [electricityPrice, publicChargingPrice, homeChargingPercent]);

  const electricResults = useMemo(() => {
    const costPer100 = electricCar.consumption * effectiveElectricityPrice;
    const annualFuelCost = (costPer100 * annualKm) / 100;
    const totalAnnual = annualFuelCost + electricCar.maintenance;
    const total5Years = totalAnnual * 5;
    return { costPer100, annualFuelCost, totalAnnual, total5Years };
  }, [electricCar, effectiveElectricityPrice, annualKm]);

  const combustionResults = useMemo(() => {
    const costPer100 = combustionCar.consumption * fuelPrice;
    const annualFuelCost = (costPer100 * annualKm) / 100;
    const totalAnnual = annualFuelCost + combustionCar.maintenance;
    const total5Years = totalAnnual * 5;
    return { costPer100, annualFuelCost, totalAnnual, total5Years };
  }, [combustionCar, fuelPrice, annualKm]);

  const diffAnnual = Math.abs(electricResults.totalAnnual - combustionResults.totalAnnual);
  const diff5Years = Math.abs(electricResults.total5Years - combustionResults.total5Years);
  const isElectricCheaper = electricResults.totalAnnual < combustionResults.totalAnnual;

  const chartData = [
    { name: 'Eléctrico', cost: Math.round(electricResults.totalAnnual), fill: '#10b981' },
    { name: 'Combustión', cost: Math.round(combustionResults.totalAnnual), fill: '#ef4444' }
  ];

  const handleCustomCarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const consumption = parseFloat(formData.get('consumption') as string);
    const maintenance = parseFloat(formData.get('maintenance') as string);

    if (editingCarType === 'electric') {
      setElectricCar({ ...electricCar, name, consumption, maintenance });
    } else if (editingCarType === 'combustion') {
      setCombustionCar({ ...combustionCar, name, consumption, maintenance });
    }
    setShowCustomModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <TrendingDown className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">CostePorKm</h1>
          </div>
          <p className="text-sm text-gray-500 hidden sm:block italic">
            "Lo que realmente vas a pagar, no lo que dice el catálogo"
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        
        {/* Main Comparison Area */}
        <div className="space-y-8">
          
          {/* Summary Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border shadow-sm",
              isElectricCheaper ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                isElectricCheaper ? "bg-emerald-500" : "bg-red-500"
              )}>
                {isElectricCheaper ? <TrendingDown className="text-white" /> : <TrendingUp className="text-white" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  El {isElectricCheaper ? 'Eléctrico' : 'Combustión'} es más rentable
                </h3>
                <p className="text-sm text-gray-600">
                  Ahorras <span className="font-bold text-gray-900">{diffAnnual.toLocaleString()} €</span> al año
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Ahorro a 5 años</p>
              <p className={cn(
                "text-3xl font-black",
                isElectricCheaper ? "text-emerald-600" : "text-red-600"
              )}>
                {diff5Years.toLocaleString()} €
              </p>
            </div>
          </motion.div>

          {/* Car Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Electric Car */}
            <CarCard 
              car={electricCar} 
              results={electricResults} 
              isCheaper={isElectricCheaper}
              onEdit={() => { setEditingCarType('electric'); setShowCustomModal(true); }}
            />
            
            {/* Combustion Car */}
            <CarCard 
              car={combustionCar} 
              results={combustionResults} 
              isCheaper={!isElectricCheaper}
              onEdit={() => { setEditingCarType('combustion'); setShowCustomModal(true); }}
            />
          </div>

          {/* Chart Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              Comparativa de Coste Anual Total
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 shadow-xl border border-gray-100 rounded-lg">
                            <p className="text-sm font-bold">{payload[0].value} € / año</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="cost" radius={[0, 8, 8, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex justify-center gap-8 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Eléctrico
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Combustión
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-8">
            <Settings2 className="w-6 h-6 text-emerald-500" />
            <h2 className="font-bold text-xl">Personaliza tu comparativa</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Annual KM */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  Kilómetros anuales
                  <TooltipIcon text="Distancia total que recorres en un año medio." />
                </label>
                <span className="text-emerald-600 font-bold">{annualKm.toLocaleString()} km</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max="50000" 
                step="1000"
                value={annualKm}
                onChange={(e) => setAnnualKm(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Fuel Price */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  Precio Combustible (€/L)
                  <TooltipIcon text="Precio medio de la gasolina o diésel en tu zona." />
                </label>
                <span className="text-red-600 font-bold">{fuelPrice.toFixed(2)} €</span>
              </div>
              <input 
                type="range" 
                min="1.00" 
                max="2.50" 
                step="0.01"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Electricity Price */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  Precio Luz Casa (€/kWh)
                  <TooltipIcon text="Tu tarifa doméstica (media entre punta/valle)." />
                </label>
                <span className="text-emerald-600 font-bold">{electricityPrice.toFixed(2)} €</span>
              </div>
              <input 
                type="range" 
                min="0.05" 
                max="0.40" 
                step="0.01"
                value={electricityPrice}
                onChange={(e) => setElectricityPrice(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Home Charging % */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  % Carga en casa
                  <TooltipIcon text="Qué porcentaje de las cargas haces en casa vs cargadores públicos." />
                </label>
                <span className="text-emerald-600 font-bold">{homeChargingPercent}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={homeChargingPercent}
                onChange={(e) => setHomeChargingPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                <span>Todo Público</span>
                <span>Todo Casa</span>
              </div>
            </div>

            {/* Public Price */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  Precio Carga Pública (€/kWh)
                  <TooltipIcon text="Precio medio en cargadores rápidos o de calle." />
                </label>
                <span className="text-emerald-600 font-bold">{publicChargingPrice.toFixed(2)} €</span>
              </div>
              <input 
                type="range" 
                min="0.30" 
                max="0.80" 
                step="0.01"
                value={publicChargingPrice}
                onChange={(e) => setPublicChargingPrice(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Effective Price Result */}
            <div className="flex items-center">
              <div className="bg-emerald-50 p-4 rounded-xl w-full">
                <div className="flex items-center gap-2 mb-1">
                  <Euro className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Precio Luz Efectivo</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{effectiveElectricityPrice.toFixed(3)} €/kWh</p>
                <p className="text-[10px] text-emerald-600 mt-1">Ponderado según % de carga en casa</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => { setEditingCarType('electric'); setShowCustomModal(true); }}
              className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Configurar mis propios coches
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
          <p>© 2026 CostePorKm - Datos basados en consumos reales medios.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Aviso Legal</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Metodología</a>
          </div>
        </div>
      </footer>

      {/* Custom Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl"
            >
              <button 
                onClick={() => setShowCustomModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <h2 className="text-2xl font-bold mb-2">Configurar Vehículo</h2>
              <p className="text-gray-500 text-sm mb-8">Personaliza los datos para el coche {editingCarType === 'electric' ? 'eléctrico' : 'de combustión'}.</p>

              <form onSubmit={handleCustomCarSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nombre del modelo</label>
                  <input 
                    name="name"
                    required
                    defaultValue={editingCarType === 'electric' ? electricCar.name : combustionCar.name}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej: Hyundai Ioniq 5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Consumo Real ({editingCarType === 'electric' ? 'kWh/100km' : 'L/100km'})
                  </label>
                  <input 
                    name="consumption"
                    type="number"
                    step="0.1"
                    required
                    defaultValue={editingCarType === 'electric' ? electricCar.consumption : combustionCar.consumption}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Mantenimiento Anual (€)</label>
                  <input 
                    name="maintenance"
                    type="number"
                    required
                    defaultValue={editingCarType === 'electric' ? electricCar.maintenance : combustionCar.maintenance}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CarCard({ car, results, isCheaper, onEdit }: { 
  car: CarData, 
  results: any, 
  isCheaper: boolean,
  onEdit: () => void
}) {
  const isElectric = car.type === 'electric';

  return (
    <div className={cn(
      "bg-white rounded-3xl overflow-hidden shadow-sm border transition-all duration-500 group relative",
      isCheaper ? "ring-2 ring-emerald-500 border-transparent" : "border-gray-100"
    )}>
      {isCheaper && (
        <div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
          Más Rentable
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={car.image} 
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg shadow-md">
            <img src={car.logo} alt="Logo" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
          </div>
          <h4 className="text-white font-bold text-lg">{car.name}</h4>
        </div>
        <button 
          onClick={onEdit}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-8 space-y-6">
        {/* Main Stat */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Coste por 100 km</p>
            <p className={cn(
              "text-3xl font-black",
              isCheaper ? "text-emerald-600" : "text-gray-900"
            )}>
              {results.costPer100.toFixed(2)} €
            </p>
          </div>
          <div className="text-right">
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase",
              isElectric ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}>
              {isElectric ? <Zap className="w-3 h-3" /> : <Fuel className="w-3 h-3" />}
              {car.consumption} {isElectric ? 'kWh' : 'L'} / 100km
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">
              <Euro className="w-4 h-4 text-gray-300" />
              Gasto Energía Anual
            </span>
            <span className="font-bold">{Math.round(results.annualFuelCost).toLocaleString()} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-300" />
              Mantenimiento
            </span>
            <span className="font-bold">{car.maintenance.toLocaleString()} €</span>
          </div>
        </div>

        {/* Total Highlight */}
        <div className={cn(
          "p-4 rounded-2xl mt-4",
          isCheaper ? "bg-emerald-50" : "bg-gray-50"
        )}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Total Anual</span>
            <span className={cn(
              "text-xl font-black",
              isCheaper ? "text-emerald-700" : "text-gray-900"
            )}>
              {Math.round(results.totalAnnual).toLocaleString()} €
            </span>
          </div>
        </div>

        <button 
          onClick={onEdit}
          className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors group/btn"
        >
          Editar especificaciones
          <ChevronRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function TooltipIcon({ text }: { text: string }) {
  return (
    <div className="group relative inline-block">
      <Info className="w-3.5 h-3.5 text-gray-300 cursor-help hover:text-gray-400 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}
