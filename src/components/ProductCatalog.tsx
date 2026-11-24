import React, { useMemo, useState } from 'react';
import { Check, Crosshair, Plus, Shield, X } from 'lucide-react';
import {
  DeployableSensorType,
  Product,
  ProductCategory,
  PRODUCTS,
} from '../data/catalog';

interface ProductCatalogProps {
  onAddToQuote: (productId: string) => void;
  onDeployOnMap: (type: DeployableSensorType) => void;
  cartCount: number;
  onOpenQuoteDrawer: () => void;
}

const FILTER_TABS: { id: 'todos' | ProductCategory; label: string }[] = [
  { id: 'todos', label: 'Todos los equipos' },
  { id: 'camaras', label: 'Cámaras IA' },
  { id: 'sensores', label: 'Sensores de Movimiento' },
  { id: 'domotica', label: 'Domótica' },
  { id: 'kits', label: 'Kits Completos' },
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onAddToQuote,
  onDeployOnMap,
  cartCount,
  onOpenQuoteDrawer,
}) => {
  const [activeFilter, setActiveFilter] = useState<'todos' | ProductCategory>('todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'todos') return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  const handleAdd = (productId: string) => {
    onAddToQuote(productId);
    setRecentlyAddedId(productId);
    window.setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === productId ? null : curr));
    }, 1400);
  };

  return (
    <section
      id="catalogo"
      aria-label="Catálogo de hardware de seguridad perimetral y domótica"
      className="mx-auto max-w-[1280px] border-t border-slate-800/70 px-5 sm:px-8 py-20"
    >
      {/* Header & Interactive Filter Controls */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-sky-400">
            Hardware de grado perimetral · Garantía estructural de 5 años
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight text-white text-balance">
            Cámaras térmicas, sensores de movimiento y domótica de alta gama
          </h2>
        </div>

        {cartCount > 0 && (
          <button
            type="button"
            onClick={onOpenQuoteDrawer}
            className="inline-flex items-center gap-2 self-start lg:self-auto rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-500/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Ver cotización activa ({cartCount})</span>
          </button>
        )}
      </div>

      {/* Segmented Category Filter Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-800/90 bg-[#0D141D] p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-[#28A9E0] text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Uniform 3-Column Product Grid */}
      <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const isAdded = recentlyAddedId === product.id;
          const imgFailed = failedImages[product.id];

          return (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-800/90 bg-[#0D141D] transition-transform duration-200 hover:-translate-y-0.5"
            >
              {/* Uniform 4:3 Studio Hardware Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0F16]">
                {!imgFailed ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [product.id]: true }))
                    }
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0D1824] to-[#070B10] p-6 text-center">
                    <Shield className="h-10 w-10 text-sky-400/70" />
                    <span className="mt-3 text-sm font-medium text-slate-300">
                      {product.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Clean Card Body — consistent field order & zero pill clutter */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-sky-400 font-medium">{product.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{product.specs.proteccion}</span>
                </div>

                <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
                  {product.name}
                </h3>

                <p className="mt-2 text-sm text-slate-400 leading-relaxed flex-1">
                  {product.tagline}
                </p>

                <div className="mt-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span>Alcance</span>
                    <span className="text-slate-200 font-medium truncate">{product.specs.alcance}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Analítica</span>
                    <span className="text-slate-200 font-medium truncate">{product.specs.deteccion}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 pt-2">
                  <div>
                    <span className="block text-[11px] text-slate-500">Precio unitario</span>
                    <span className="font-mono text-lg font-semibold text-white tabular-nums">
                      ${product.priceUsd.toLocaleString('en-US')} USD
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Detalles
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdd(product.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-[#28A9E0] text-slate-950 hover:bg-sky-300'
                      }`}
                    >
                      {isAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>{isAdded ? 'Agregado' : 'Cotizar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Product Detail Specification Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Especificaciones de ${selectedProduct.name}`}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0D141D] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Cerrar especificaciones"
              className="absolute right-4 top-4 z-10 rounded-lg border border-slate-700 bg-[#070B10]/90 p-2 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-5 bg-[#080C12]">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover min-h-[240px]"
                />
              </div>

              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-sky-400">
                    {selectedProduct.categoryLabel} · {selectedProduct.specs.proteccion}
                  </p>
                  <h3 className="mt-1.5 text-2xl font-semibold text-white">
                    {selectedProduct.name}
                  </h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-xs">
                    <div>
                      <dt className="text-slate-500">Alcance operativo</dt>
                      <dd className="mt-0.5 font-medium text-slate-100">{selectedProduct.specs.alcance}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Detección IA</dt>
                      <dd className="mt-0.5 font-medium text-slate-100">{selectedProduct.specs.deteccion}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Grado de protección</dt>
                      <dd className="mt-0.5 font-medium text-slate-100">{selectedProduct.specs.proteccion}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Protocolos e integración</dt>
                      <dd className="mt-0.5 font-medium text-slate-100">{selectedProduct.specs.integracion}</dd>
                    </div>
                  </dl>

                  <ul className="mt-4 space-y-1.5 border-t border-slate-800 pt-4 text-xs text-slate-300">
                    {selectedProduct.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
                  <span className="font-mono text-xl font-semibold text-white tabular-nums">
                    ${selectedProduct.priceUsd.toLocaleString('en-US')} USD
                  </span>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {selectedProduct.deployType && (
                      <button
                        type="button"
                        onClick={() => {
                          const dt = selectedProduct.deployType!;
                          setSelectedProduct(null);
                          onDeployOnMap(dt);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/10 px-3.5 py-2.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20 whitespace-nowrap cursor-pointer"
                      >
                        <Crosshair className="h-3.5 w-3.5" />
                        <span>Probar en mapa</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        handleAdd(selectedProduct.id);
                        setSelectedProduct(null);
                      }}
                      className="rounded-lg bg-[#28A9E0] px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-300 whitespace-nowrap cursor-pointer"
                    >
                      Agregar a cotización
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
