import React, { useMemo, useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { PRODUCTS } from '../data/catalog';

export interface QuoteItem {
  productId: string;
  quantity: number;
}

interface QuoteDrawerProps {
  open: boolean;
  onClose: () => void;
  items: QuoteItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearItems: () => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearItems,
}) => {
  const [includeInstallation, setIncludeInstallation] = useState(true);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [propertyType, setPropertyType] = useState<'residencial' | 'empresarial'>('residencial');
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<{
    code: string;
    total: number;
    email: string;
  } | null>(null);

  const detailedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          return product ? { ...item, product } : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [items]
  );

  const subtotal = useMemo(
    () => detailedItems.reduce((sum, entry) => sum + entry.product.priceUsd * entry.quantity, 0),
    [detailedItems]
  );

  const installationFee = includeInstallation && subtotal > 0 ? Math.round(subtotal * 0.12) : 0;
  const total = subtotal + installationFee;

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientName.trim() || clientName.trim().length < 2) {
      setError('Ingresa tu nombre completo para generar la propuesta.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (clientPhone.trim().replace(/\D/g, '').length < 7) {
      setError('Ingresa un teléfono de contacto válido.');
      return;
    }

    const orderCode = `BLD-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrder({
      code: orderCode,
      total,
      email: clientEmail.trim(),
    });
    onClearItems();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Cotización y resumen de equipos BlinD"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-slate-800 bg-[#0A1018] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Cotización de sistema BlinD</h2>
            <p className="text-xs text-slate-400">
              Hardware perimetral, domótica y puesta en marcha
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar cotización"
            className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:border-slate-600 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {confirmedOrder ? (
            <div className="rounded-xl border border-sky-500/35 bg-sky-500/10 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-sky-300" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Solicitud #{confirmedOrder.code} confirmada
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Hemos enviado el desglose técnico a{' '}
                <strong className="text-white">{confirmedOrder.email}</strong>. Un ingeniero de
                seguridad perimetral se comunicará contigo en menos de 2 horas hábiles.
              </p>
              {confirmedOrder.total > 0 && (
                <p className="mt-4 font-mono text-lg font-semibold text-sky-200 tabular-nums">
                  Estimado referencial: ${confirmedOrder.total.toLocaleString('en-US')} USD
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setClientName('');
                  setClientEmail('');
                  setClientPhone('');
                  onClose();
                }}
                className="mt-6 rounded-lg bg-[#28A9E0] px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-300 cursor-pointer"
              >
                Volver a la plataforma
              </button>
            </div>
          ) : (
            <>
              {/* Itemized Hardware List */}
              {detailedItems.length === 0 ? (
                <div className="rounded-xl border border-slate-800/90 bg-[#0D141D] p-6 text-center">
                  <ShoppingBag className="mx-auto h-7 w-7 text-slate-500" />
                  <p className="mt-3 text-sm font-medium text-white">
                    Aún no has agregado equipos a tu cotización
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Puedes seleccionar cámaras y sensores desde el catálogo o el mapa interactivo, o
                    solicitar directamente una asesoría personalizada abajo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detailedItems.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3.5 rounded-xl border border-slate-800/90 bg-[#0D141D] p-3.5"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-14 w-16 rounded-lg object-cover bg-[#070B10] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{product.name}</p>
                        <p className="mt-0.5 font-mono text-xs text-sky-300 tabular-nums">
                          ${(product.priceUsd * quantity).toLocaleString('en-US')} USD
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, -1)}
                          aria-label={`Disminuir cantidad de ${product.name}`}
                          className="rounded border border-slate-700 p-1.5 text-slate-300 hover:border-slate-500 hover:text-white cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs text-white tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, 1)}
                          aria-label={`Aumentar cantidad de ${product.name}`}
                          className="rounded border border-slate-700 p-1.5 text-slate-300 hover:border-slate-500 hover:text-white cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label={`Eliminar ${product.name}`}
                          className="ml-1 rounded p-1.5 text-slate-500 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Optional Engineering Installation Toggle */}
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#0D141D] px-4 py-3 text-xs cursor-pointer">
                    <div>
                      <span className="font-medium text-slate-100 block">
                        Instalación certificada y configuración domótica (12%)
                      </span>
                      <span className="text-slate-400">
                        Incluye cableado oculto, calibración LiDAR y escenas de alerta
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeInstallation}
                      onChange={(e) => setIncludeInstallation(e.target.checked)}
                      className="h-4 w-4 accent-[#28A9E0]"
                    />
                  </label>

                  {/* Pricing Summary */}
                  <div className="rounded-xl border border-slate-800/90 bg-[#0D141D] p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal hardware</span>
                      <span className="font-mono tabular-nums text-slate-200">
                        ${subtotal.toLocaleString('en-US')} USD
                      </span>
                    </div>
                    {includeInstallation && (
                      <div className="flex justify-between text-slate-400">
                        <span>Ingeniería e instalación certificada</span>
                        <span className="font-mono tabular-nums text-slate-200">
                          ${installationFee.toLocaleString('en-US')} USD
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-800 pt-2.5 text-sm font-semibold text-white">
                      <span>Total estimado</span>
                      <span className="font-mono tabular-nums text-sky-300">
                        ${total.toLocaleString('en-US')} USD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lead Submission Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-slate-800 pt-6">
                <h3 className="text-sm font-semibold text-white">
                  Datos para envío de propuesta formal
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPropertyType('residencial')}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      propertyType === 'residencial'
                        ? 'border-sky-400 bg-sky-500/15 text-white'
                        : 'border-slate-800 bg-[#0D141D] text-slate-400 hover:text-white'
                    }`}
                  >
                    Proyecto Residencial
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyType('empresarial')}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      propertyType === 'empresarial'
                        ? 'border-sky-400 bg-sky-500/15 text-white'
                        : 'border-slate-800 bg-[#0D141D] text-slate-400 hover:text-white'
                    }`}
                  >
                    Proyecto Empresarial
                  </button>
                </div>

                <div>
                  <label htmlFor="quote-name" className="block text-xs text-slate-400 mb-1">
                    Nombre completo
                  </label>
                  <input
                    id="quote-name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full rounded-lg border border-slate-700 bg-[#0D141D] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quote-email" className="block text-xs text-slate-400 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="w-full rounded-lg border border-slate-700 bg-[#0D141D] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-phone" className="block text-xs text-slate-400 mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+51 999 000 000"
                      className="w-full rounded-lg border border-slate-700 bg-[#0D141D] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-medium text-red-300" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#28A9E0] px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 cursor-pointer"
                >
                  {total > 0
                    ? `Solicitar cotización formal ($${total.toLocaleString('en-US')} USD)`
                    : 'Solicitar evaluación perimetral'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
