'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import { uploadCustomersBatch } from '@/app/actions/customers';

// ====== ICÓNS SVGs (In-line para mantener integridad gráfica) ======
const CloudUploadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);
const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
// ====================================================================

// --- TYPES ---
type FlowStep = 'UPLOAD' | 'MAPPING' | 'REVIEW' | 'SUCCESS';
type HeaderMapping = {
  phone: string | null;
  firstName: string | null;
  lastName1: string | null;
  lastName2: string | null;
  billingCycle: string | null;
  nextPaymentDate: string | null;
};
interface PreviewRow {
  _id: string; // Internal id
  phoneRaw: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  billingCycleRaw: string;
  nextPaymentDateRaw: string;

  // Validation flags
  phoneE164: string;
  phoneIntl: string;
  isValid: boolean;
  edited: boolean;
  wasAutoFilled: boolean;
}

// Lista simple de países populares para la demostración (en producción podría venir de una lib).
const COMMON_COUNTRIES: { code: string, label: string }[] = [
  { code: 'MX', label: '🇲🇽 México (+52)' },
  { code: 'US', label: '🇺🇸 Estados Unidos (+1)' },
  { code: 'CO', label: '🇨🇴 Colombia (+57)' },
  { code: 'ES', label: '🇪🇸 España (+34)' },
  { code: 'CL', label: '🇨🇱 Chile (+56)' },
  { code: 'AR', label: '🇦🇷 Argentina (+54)' },
  { code: 'PE', label: '🇵🇪 Perú (+51)' },
];

export default function ClientsUploadPage() {
  const [step, setStep] = useState<FlowStep>('UPLOAD');
  const [processing, setProcessing] = useState(false);

  // Modos
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);

  // File Parsing State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');

  // Mapping State
  const [mapping, setMapping] = useState<HeaderMapping>({
    phone: null,
    firstName: null,
    lastName1: null,
    lastName2: null,
    billingCycle: null,
    nextPaymentDate: null
  });

  // Review State
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [defaultCountry, setDefaultCountry] = useState<CountryCode>('MX');
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });
  const [showAutoFillWarning, setShowAutoFillWarning] = useState(false);

  // Funciones de limpieza de números
  const cleanPhoneNumber = (raw: string) => {
    let c = String(raw).replace(/[^\d+]/g, '');
    
    // Fix viejas ladas mexicanas (+521 o 521)
    if (c.startsWith('+521') && c.length === 14) c = '+52' + c.slice(4);
    else if (c.startsWith('521') && c.length === 13) c = '52' + c.slice(3);
    
    // Fix doble 52 (mucha gente pone 5252 al importar)
    if (c.startsWith('+5252')) c = '+52' + c.slice(5);
    else if (c.startsWith('5252')) c = '52' + c.slice(4);

    // Forzar el + si claramente pusieron la lada (12 dígitos para MX)
    if (c.startsWith('52') && c.length === 12 && !c.startsWith('+')) c = '+' + c;

    return c;
  };

  // ====== PASO 1: UPLOAD (Drag & Drop) ======
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setProcessing(true);

    const performAutoMapping = (data: any[], headers: string[]) => {
      setCsvHeaders(headers);
      setCsvData(data);

      const autoMap = {
        phone: headers.find(h => /tel|phone|cel|número|numero/i.test(h)) || null,
        firstName: headers.find(h => /name|nombre/i.test(h) && !/last|apellido/i.test(h)) || null,
        lastName1: headers.find(h => /last|apellido/i.test(h) && !/2/i.test(h)) || null,
        lastName2: headers.find(h => /last|apellido.*2/i.test(h)) || null,
        billingCycle: headers.find(h => /ciclo|frecuencia|periodo|billing/i.test(h)) || null,
        nextPaymentDate: headers.find(h => /fecha|pago|vencimiento|date|siguiente/i.test(h)) || null,
      };

      setMapping(autoMap);
      setStep('MAPPING');
      setProcessing(false);
    };

    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (json.length > 0) {
            const headers = Object.keys(json[0] as object);
            performAutoMapping(json, headers);
          } else {
            alert("El archivo Excel está vacío o no contiene registros válidos.");
            setProcessing(false);
          }
        } catch (err) {
          console.error("Excel Parse Error:", err);
          alert("Hubo un error interpretando el archivo Excel.");
          setProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Es CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          performAutoMapping(results.data, headers);
        },
        error: (err) => {
          console.error("CSV Parse Error:", err);
          setProcessing(false);
          alert("Hubo un error interpretando el archivo CSV.");
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv', '.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  // ====== PASO 2: MAPPING (Emparejar Columnas) ======
  const handleProceedToReview = () => {
    setFormatError(null);
    if (!mapping.phone || !mapping.firstName) {
      setFormatError('El "Teléfono" y "Nombre (First Name)" son campos obligatorios de mapear.');
      return;
    }

    setProcessing(true);

    // Pre-validación de formatos incompatibles
    let localFormatError = null;
    for (let row of csvData) {
      const phoneVal = row[mapping.phone!];
      if (phoneVal && /[a-zA-Z]{4,}/.test(String(phoneVal))) {
        localFormatError = `La columna de Teléfono contiene demasiado texto ("${phoneVal}"). Edita tu archivo y asegúrate de que sean números validos.`;
        break;
      }
      if (mapping.nextPaymentDate && row[mapping.nextPaymentDate]) {
        const dateVal = row[mapping.nextPaymentDate];
        // Ignoramos si es instancía de fecha, pero si es texto con muchas letras (excluyendo meses) error.
        if (!(dateVal instanceof Date) && /[a-zA-Z]{4,}/.test(String(dateVal)) && !/ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic/i.test(String(dateVal))) {
          localFormatError = `La columna de Próx. Pago contiene texto ("${dateVal}"). Usa formatos de Fecha como YYYY-MM-DD o DD/MM/YYYY.`;
          break;
        }
      }
    }

    if (localFormatError) {
      setFormatError(localFormatError);
      setProcessing(false);
      return;
    }

    // Procesar rows usando libphonenumber
    let anyAutoFilled = false;

    const processedRows: PreviewRow[] = csvData.map((row, index) => {
      const phoneRawStr = String(row[mapping.phone!] || '');
      const cleaned = cleanPhoneNumber(phoneRawStr);
      let valid = false;
      let formattedPhoneE164 = '';
      let formattedPhoneIntl = '';
      let autoFilled = false;

      try {
        // Parseamos con el país por defecto seleccionado globalmente.
        const phoneNumber = parsePhoneNumber(cleaned, defaultCountry);
        if (phoneNumber && phoneNumber.isValid()) {
          valid = true;
          formattedPhoneE164 = phoneNumber.format('E.164');
          formattedPhoneIntl = phoneNumber.formatInternational();
          
          // Detectar inferencia
          if (!phoneRawStr.includes('+') && !cleaned.startsWith(String(phoneNumber.countryCallingCode))) {
             autoFilled = true;
             anyAutoFilled = true;
          }
        }
      } catch (e) {
        // Formatting err, valid=false
      }

      return {
        _id: `row-${index}`,
        phoneRaw: phoneRawStr,
        firstName: row[mapping.firstName!] || '',
        lastName1: mapping.lastName1 ? (row[mapping.lastName1] || '') : '',
        lastName2: mapping.lastName2 ? (row[mapping.lastName2] || '') : '',
        billingCycleRaw: mapping.billingCycle ? (row[mapping.billingCycle] || '') : '',
        nextPaymentDateRaw: mapping.nextPaymentDate ? (row[mapping.nextPaymentDate] || '') : '',
        isValid: valid,
        phoneE164: formattedPhoneE164,
        phoneIntl: formattedPhoneIntl,
        edited: false,
        wasAutoFilled: autoFilled
      };
    });

    if(anyAutoFilled) setShowAutoFillWarning(true);

    // Filtrar filas completadas vacías (donde nombre y teléfono están vacíos)
    const validContentRows = processedRows.filter(r => r.phoneRaw.trim() !== '' || r.firstName.trim() !== '');

    setRows(validContentRows);
    setStep('REVIEW');
    setProcessing(false);
  };

  // ====== PASO 3: REVIEW (Inline Editing y Limpieza) ======

  // Función para recalcular un solo teléfono al editar
  const handlePhoneEdit = (id: string, newRawValue: string) => {
    setRows(prevRows => prevRows.map(row => {
      if (row._id !== id) return row;

      const cleaned = cleanPhoneNumber(newRawValue);
      let valid = false;
      let formattedPhoneE164 = '';
      let formattedPhoneIntl = '';

      try {
        const phoneNumber = parsePhoneNumber(cleaned, defaultCountry);
        if (phoneNumber && phoneNumber.isValid()) {
          valid = true;
          formattedPhoneE164 = phoneNumber.format('E.164');
          formattedPhoneIntl = phoneNumber.formatInternational();
        }
      } catch (e) {
        // error = ignore
      }

      return {
        ...row,
        phoneRaw: newRawValue,
        isValid: valid,
        phoneE164: formattedPhoneE164,
        phoneIntl: formattedPhoneIntl,
        edited: true,
        wasAutoFilled: false // Al editar asume que él sabe el código
      };
    }));
  };

  const handleRemoveErrors = () => {
    setRows(prevRows => prevRows.filter(r => r.isValid));
  };

  const handleCountryChange = (newCountry: CountryCode) => {
    setDefaultCountry(newCountry);
    let anyAutoFilled = false;
    // Reprocesar todas las filas con el nuevo país
    setRows(prevRows => prevRows.map(row => {
      const cleaned = cleanPhoneNumber(row.phoneRaw);
      let valid = false;
      let formattedPhoneE164 = '';
      let formattedPhoneIntl = '';
      let autoFilled = false;
      try {
        const phoneNumber = parsePhoneNumber(cleaned, newCountry);
        if (phoneNumber && phoneNumber.isValid()) {
          valid = true;
          formattedPhoneE164 = phoneNumber.format('E.164');
          formattedPhoneIntl = phoneNumber.formatInternational();
          if (!row.phoneRaw.includes('+') && !cleaned.startsWith(String(phoneNumber.countryCallingCode))) {
             autoFilled = true;
             anyAutoFilled = true;
          }
        }
      } catch (e) { }
      return { ...row, isValid: valid, phoneE164: formattedPhoneE164, phoneIntl: formattedPhoneIntl, wasAutoFilled: autoFilled };
    }));
    setShowAutoFillWarning(anyAutoFilled);
  };

  const validCount = rows.filter(r => r.isValid).length;
  const errorCount = rows.length - validCount;

  // ====== PASO 4: IMPORTACIÓN ======
  const handleImport = async () => {
    const payloadToImport = rows.filter(r => r.isValid).map(r => ({
      phoneNumber: r.phoneE164,
      firstName: r.firstName,
      lastName1: r.lastName1,
      lastName2: r.lastName2,
      billingCycle: r.billingCycleRaw ? r.billingCycleRaw.trim() : null,
      nextPaymentDate: r.nextPaymentDateRaw && r.nextPaymentDateRaw.trim() !== '' ? r.nextPaymentDateRaw.trim() : null
    }));

    if (payloadToImport.length === 0) return;

    setProcessing(true);
    const result = await uploadCustomersBatch(payloadToImport, importMode);

    if (result.ok) {
      setImportStats({ success: result.count || 0, failed: 0 });
      setStep('SUCCESS');
    } else {
      alert("Error al importar: " + result.error);
    }
    setProcessing(false);
  };


  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header del Módulo */}
      <div className="mb-8">
        <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300 mb-4">
          Base de Clientes
        </span>
        <h1 className="text-3xl font-semibold text-white">Importación Masiva (CSV)</h1>
        <p className="mt-2 text-sm text-zinc-400">Sube tu lista de clientes y dales formato universal E.164 para interactuar vía WhatsApp.</p>
      </div>

      {/* Stepper Visual */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4">
        {['UPLOAD', 'MAPPING', 'REVIEW', 'SUCCESS'].map((s, index) => {
          const stepNum = index + 1;
          const isActive = step === s;
          const isPast = ['UPLOAD', 'MAPPING', 'REVIEW', 'SUCCESS'].indexOf(step) > index;

          return (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : isPast ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500 border border-white/5'}`}>
                {isPast ? <CheckIcon className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-white' : isPast ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {s === 'UPLOAD' ? 'Archivo' : s === 'MAPPING' ? 'Columnas' : s === 'REVIEW' ? 'Validación' : 'Éxito'}
              </span>
              {index < 3 && <ArrowRightIcon className="w-4 h-4 text-zinc-700 mx-2" />}
            </div>
          )
        })}
      </div>

      {/* --- CONTENIDO POR PASO --- */}
      <div className="rounded-[32px] border border-white/10 bg-[#0b0b0d] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] min-h-[400px]">

        {/* 1. UPLOAD */}
        {step === 'UPLOAD' && (
          <div className="space-y-6">
            <div className="flex gap-4 animate-in fade-in zoom-in-95 duration-500">
              <button
                onClick={() => setImportMode('append')}
                className={`flex-1 p-5 rounded-[24px] border-2 text-left transition-all ${importMode === 'append' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
              >
                <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                  Complementar / Actualizar
                  {importMode === 'append' && <CheckIcon className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-xs text-zinc-400 mt-2">Añade clientes nuevos o actualiza los datos que cambiaron en la lista sin tocar al resto de tu base de datos.</p>
              </button>
              <button
                onClick={() => setShowOverwriteWarning(true)}
                className={`flex-1 p-5 rounded-[24px] border-2 text-left transition-all relative overflow-hidden ${importMode === 'overwrite' ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-white/10 hover:border-red-500/30 hover:bg-red-500/5'}`}
              >
                <h4 className="text-red-400 font-semibold text-lg flex items-center gap-2">
                  Sobrescribir Completo
                  {importMode === 'overwrite' && <CheckIcon className="w-4 h-4 text-red-500" />}
                </h4>
                <p className="text-xs text-red-300/70 mt-2">Envía todos tus clientes actuales a la Papelera instantes previos a la importación masiva total.</p>
              </button>
            </div>

            <div
              {...getRootProps()}
              className={`w-full h-72 rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300
                            ${isDragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 bg-black/20 hover:border-emerald-500/30 hover:bg-black/40'}`}
            >
              <input {...getInputProps()} />
              <div className={`w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mb-6 transition-colors ${isDragActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/50 text-zinc-500'}`}>
                <CloudUploadIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {isDragActive ? 'Suelta tu archivo aquí' : 'Arrastra tu archivo CSV o Excel'}
              </h3>
              <p className="text-zinc-400 text-xs max-w-sm text-center">
                Se soportan archivos .csv, .xls y .xlsx.
              </p>
            </div>
          </div>
        )}

        {/* 2. MAPPING */}
        {step === 'MAPPING' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-medium text-white flex items-center gap-3">
                  <FileTextIcon className="w-5 h-5 text-emerald-400" />
                  {fileName}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">Empareja las columnas de tu archivo con nuestra base de datos.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold text-white">{csvData.length}</span>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Registros</p>
              </div>
            </div>

            {(mapping.phone || mapping.firstName || mapping.billingCycle) && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl mb-8">
                <h4 className="text-emerald-400 font-semibold mb-3">Mapeo Automático Sugerido</h4>
                <ul className="text-sm text-zinc-300 space-y-2 mb-4 leading-relaxed">
                  {mapping.phone && <li>He detectado que la columna <strong className="text-white px-1.5 py-0.5 bg-black/30 rounded border border-white/10">{mapping.phone}</strong> corresponde a <strong className="text-white">Teléfono Móvil</strong>.</li>}
                  {mapping.firstName && <li>He detectado que la columna <strong className="text-white px-1.5 py-0.5 bg-black/30 rounded border border-white/10">{mapping.firstName}</strong> corresponde a <strong className="text-white">Nombre</strong>.</li>}
                  {mapping.billingCycle && <li>He detectado que la columna <strong className="text-white px-1.5 py-0.5 bg-black/30 rounded border border-white/10">{mapping.billingCycle}</strong> corresponde a <strong className="text-white">Ciclo de Cobro</strong>.</li>}
                </ul>
                <p className="text-xs text-zinc-400 font-medium tracking-wide">— Por favor confirma o cambia las selecciones a continuación antes de revisar.</p>
              </div>
            )}

            {formatError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-start gap-4">
                <div className="mt-0.5 w-6 h-6 flex items-center justify-center text-red-500 bg-red-500/20 rounded-full">!</div>
                <div>
                  <h4 className="text-red-400 font-semibold text-sm mb-1">Error de Formato Previo</h4>
                  <p className="text-xs text-red-300/80 leading-relaxed">{formatError}</p>
                </div>
              </div>
            )}

            {(!mapping.billingCycle || !mapping.nextPaymentDate) && (
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-8 flex items-start gap-4 shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
                <div className="mt-0.5 w-6 h-6 flex items-center justify-center text-blue-400 bg-blue-500/20 rounded-full shrink-0">i</div>
                <div>
                   <h4 className="text-blue-400 font-semibold text-sm mb-1">Configuración de Recordatorios</h4>
                   <p className="text-xs text-blue-300/80 leading-relaxed">
                     Parece que no has mapeado el <strong>Ciclo de Cobro</strong> o la <strong>Fecha de Pago</strong>. 
                     Estos campos son fundamentales para que el sistema pueda programar y enviar recordatorios automáticos de pago a tus clientes. 
                     Si los dejas vacíos, tendrás que configurarlos manualmente después.
                   </p>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {[
                { key: 'firstName', label: 'Nombre (Required)*', req: true },
                { key: 'lastName1', label: 'Apellido Paterno', req: false },
                { key: 'lastName2', label: 'Apellido Materno', req: false },
                { key: 'phone', label: 'Teléfono Móvil (Required)*', req: true },
                { key: 'billingCycle', label: 'Ciclo (Mensual, Anual) Opcional', req: false },
                { key: 'nextPaymentDate', label: 'Fecha de Próx. Pago Opcional', req: false }
              ].map((f) => (
                <div key={f.key} className="grid sm:grid-cols-[200px_1fr] items-center gap-4">
                  <label className={`text-sm font-medium ${f.req ? 'text-white' : 'text-zinc-400'}`}>
                    {f.label}
                  </label>
                  <select
                    className="w-full sm:w-80 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                    value={(mapping as any)[f.key] || ''}
                    onChange={(e) => setMapping(p => ({ ...p, [f.key as keyof HeaderMapping]: e.target.value || null }))}
                  >
                    <option value="">-- Ignorar (No importar) --</option>
                    {csvHeaders.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-end">
              <button
                onClick={handleProceedToReview}
                disabled={processing}
                className="bg-emerald-500 text-black px-8 py-3 rounded-full font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing ? 'Procesando...' : 'Revisar Datos'}
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. REVIEW */}
        {step === 'REVIEW' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full min-h-[500px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">Validación de Números</h3>
                <p className="text-sm text-zinc-400 mt-1">Los números deben ajustarse a la normativa internacional de Meta.</p>
              </div>

              {/* Selector País por Defecto */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-4 pr-1 py-1">
                <span className="text-xs text-zinc-400">País base:</span>
                <select
                  className="bg-transparent text-sm text-white focus:outline-none appearance-none cursor-pointer pr-4"
                  value={defaultCountry}
                  onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                >
                  {COMMON_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* AutoFill Warning */}
            {showAutoFillWarning && (
              <div className="bg-[#1a1708] border border-yellow-500/30 p-5 rounded-2xl mb-6 flex items-start gap-4 animate-in slide-in-from-top-2 shadow-[0_10px_30px_rgba(234,179,8,0.1)]">
                <div className="mt-0.5 w-7 h-7 flex items-center justify-center text-yellow-500 bg-yellow-500/20 rounded-full shrink-0 font-bold border border-yellow-500/30">!</div>
                <div>
                  <h4 className="text-yellow-500 font-semibold text-sm mb-1.5">Códigos de País Inferidos</h4>
                  <p className="text-sm text-yellow-500/80 leading-relaxed font-medium">
                    Hemos detectado números "locales" en tu Excel que no tenían código internacional (como +52 o +1). 
                    El sistema ha utilizado el <strong>País Base seleccionado</strong> arriba para unificarlos.
                    Si algún número pertenece a otro país, asigńale su código local en la columna de revisión.
                  </p>
                </div>
                <button 
                  onClick={() => setShowAutoFillWarning(false)} 
                  className="ml-auto flex items-center shrink-0 justify-center text-yellow-600 hover:text-yellow-400 font-medium text-xs px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors border border-yellow-500/20"
                >
                  Entendido
                </button>
              </div>
            )}

            {/* Top Action Bar */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 mb-6">
              <div className="flex items-center gap-2 px-3 border-r border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-white font-medium">{validCount} válidos</span>
              </div>
              <div className="flex items-center gap-2 px-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-white font-medium">{errorCount} con error</span>
              </div>
              <div className="ml-auto">
                {errorCount > 0 && (
                  <button
                    onClick={handleRemoveErrors}
                    className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Descartar Erroneos
                  </button>
                )}
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto flex-1 border border-white/5 rounded-2xl bg-black/10">
              <table className="w-full text-left text-sm text-zinc-300 whitespace-nowrap">
                <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium">Nombre Completo</th>
                      <th className="px-6 py-4 font-medium border-l border-white/5 bg-white/[0.02]">
                        Teléfono Crudo (CSV)
                      </th>
                      <th className="px-6 py-4 font-medium border-l border-white/5">
                        E.164 (Sistema Meta)
                      </th>
                      <th className="px-6 py-4 font-medium border-l border-white/5 bg-white/[0.01]">
                        CICLO (FRECUENCIA)
                      </th>
                      <th className="px-6 py-4 font-medium border-l border-white/5 bg-white/[0.01]">
                        FECHA DE PAGO
                      </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                            <CheckIcon className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 animate-pulse">
                            ERROR
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {[row.firstName, row.lastName1, row.lastName2].filter(Boolean).join(' ')}
                      </td>
                      <td className={`px-6 py-3 border-l border-white/5 bg-white/[0.01] ${!row.isValid && 'bg-red-500/5'}`}>
                        {/* Inline Editor */}
                        <input
                          type="text"
                          value={row.phoneRaw}
                          onChange={(e) => handlePhoneEdit(row._id, e.target.value)}
                          className={`bg-transparent w-full border-b border-transparent focus:border-white/50 focus:outline-none transition-colors px-1 py-1 text-sm ${!row.isValid ? 'text-red-300 font-semibold' : 'text-zinc-300'}`}
                          placeholder="Número"
                        />
                      </td>
                      <td className="px-6 py-4 border-l border-white/5 font-mono text-xs">
                        {row.isValid ? (
                          <div className="flex items-center gap-2">
                            {row.wasAutoFilled && (
                               <span title="Código Inferido Automáticamente" className="w-2 h-2 rounded-full bg-yellow-500 shrink-0 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
                            )}
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-bold text-xs tracking-wide border border-emerald-500/20 shrink-0">
                              {row.phoneIntl.split(' ')[0]}
                            </span>
                            <span className="text-zinc-300 tracking-wider font-semibold text-sm">
                              {row.phoneIntl.split(' ').slice(1).join(' ')}
                            </span>
                          </div>
                        ) : <span className="text-zinc-600 font-sans">-</span>}
                      </td>
                      <td className="px-6 py-4 border-l border-white/5 text-sm text-zinc-300 font-medium">
                        {row.billingCycleRaw || (
                          <span className="text-zinc-600 italic">No detectado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-l border-white/5 text-sm text-zinc-300 font-medium">
                        {row.nextPaymentDateRaw || (
                          <span className="text-zinc-600 italic">No detectado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setStep('UPLOAD');
                  setRows([]);
                  setCsvData([]);
                  setMapping({
                    phone: null,
                    firstName: null,
                    lastName1: null,
                    lastName2: null,
                    billingCycle: null,
                    nextPaymentDate: null
                  });
                }}
                disabled={processing}
                className="px-8 py-3 rounded-full text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancelar y Salir
              </button>
              <button
                onClick={handleImport}
                disabled={processing || validCount === 0 || errorCount > 0}
                className="bg-emerald-500 text-black px-8 py-3 rounded-full font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing ? 'Cargando a BD...' : `Importar ${validCount} Clientes`}
                {!processing && <CloudUploadIcon className="w-4 h-4" />}
              </button>
            </div>
            {errorCount > 0 && !processing && (
              <p className="text-right text-xs text-red-400 mt-2">Atiende los errores o desházte de ellos para avanzar.</p>
            )}
          </div>
        )}

        {/* 4. SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="flex flex-col items-center justify-center h-[400px] text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <CheckIcon className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">¡Importación Exitosa!</h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              Se insertaron <strong>{importStats.success}</strong> clientes válidamente formateados en tu cuenta listos para mensajería.
            </p>
            <button
              onClick={() => {
                setStep('UPLOAD');
                setRows([]);
                setCsvData([]);
                setMapping({
                  phone: null,
                  firstName: null,
                  lastName1: null,
                  lastName2: null,
                  billingCycle: null,
                  nextPaymentDate: null
                });
              }}
              className="bg-white/10 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Subir otro archivo
            </button>
          </div>
        )}
      </div>

      {showOverwriteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 animate-in fade-in duration-200">
          <div className="bg-[#111] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full shadow-[0_30px_100px_rgba(239,68,68,0.2)]">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">¿Sobrescribir Base de Datos?</h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Al confirmar esta selección, <strong>se archivarán en la Papelera (Soft Delete) absolutamente todos tus contactos actuales activos</strong> previo a iniciar la importación del nuevo archivo.
              Solo hazlo si deseas limpiar tu cartera de clientes y basarte puramente en este documento nuevo.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
              <button
                onClick={() => setShowOverwriteWarning(false)}
                className="px-6 py-3 rounded-full text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setImportMode('overwrite');
                  setShowOverwriteWarning(false);
                }}
                className="px-6 py-3 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              >
                Sí, archivar actuales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
