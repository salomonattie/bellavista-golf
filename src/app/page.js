'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [slugBuscar, setSlugBuscar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toSlug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
  }

  async function crearLiga() {
    if (!nombre.trim()) return;
    setLoading(true); setError('');
    const s = toSlug(nombre);
    const { data: existing } = await supabase.from('ligas').select('id').eq('slug', s).single();
    if (existing) { setError('Ya existe una liga con ese nombre. Elige otro.'); setLoading(false); return; }
    const { error: err } = await supabase.from('ligas').insert({ slug: s, nombre: nombre.trim() });
    if (err) { setError('Error al crear la liga. Intenta de nuevo.'); setLoading(false); return; }
    router.push(`/liga/${s}`);
  }

  async function buscarLiga() {
    if (!slugBuscar.trim()) return;
    setLoading(true); setError('');
    const s = toSlug(slugBuscar);
    const { data } = await supabase.from('ligas').select('slug').eq('slug', s).single();
    if (!data) { setError('No encontramos esa liga. Verifica el nombre.'); setLoading(false); return; }
    router.push(`/liga/${s}`);
  }

  if (!mode) return (
    <div className="app-shell">
      <div className="welcome">
        <div className="welcome-logo">🏌️</div>
        <div className="welcome-title">Bellavista Golf</div>
        <div className="welcome-sub">La app de apuestas del Club de Golf Bellavista CDMX.<br />Crea tu liga o únete a una existente.</div>
        <div className="welcome-input-group">
          <button className="btn btn-primary" onClick={() => setMode('create')}>Crear nueva liga</button>
          <button className="btn" onClick={() => setMode('join')}>Entrar a mi liga</button>
        </div>
        <p className="text-muted" style={{fontSize:12,lineHeight:1.6}}>Cada liga es independiente.<br />Comparte tu link solo con tu grupo.</p>
      </div>
    </div>
  );

  if (mode === 'create') return (
    <div className="app-shell">
      <div className="header"><h1>Nueva liga</h1></div>
      <div className="screen">
        <div className="card">
          <p className="text-muted" style={{marginBottom:12}}>Dale un nombre a tu grupo. Este nombre será parte del link que compartes.</p>
          <label>Nombre de tu grupo</label>
          <input
            value={nombre}
            onChange={e => { setNombre(e.target.value); setSlug(toSlug(e.target.value)); }}
            placeholder="Ej: Los Martes del Bellavista"
            autoFocus
          />
          {slug && <p style={{fontSize:12,color:'#1a5c2e',marginTop:6}}>🔗 Tu link: bellavistagolf.vercel.app/liga/<strong>{slug}</strong></p>}
          {error && <p style={{fontSize:13,color:'#c62828',marginTop:8}}>{error}</p>}
        </div>
        <button className="btn btn-primary" onClick={crearLiga} disabled={loading || !nombre.trim()}>
          {loading ? 'Creando...' : 'Crear liga →'}
        </button>
        <button className="btn" onClick={() => { setMode(null); setError(''); }}>← Atrás</button>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <div className="header"><h1>Entrar a mi liga</h1></div>
      <div className="screen">
        <div className="card">
          <p className="text-muted" style={{marginBottom:12}}>Escribe el nombre de tu liga o pega el link que te compartieron.</p>
          <label>Nombre de la liga</label>
          <input
            value={slugBuscar}
            onChange={e => setSlugBuscar(e.target.value)}
            placeholder="Ej: los-martes-del-bellavista"
            onKeyDown={e => e.key==='Enter' && buscarLiga()}
            autoFocus
          />
          {error && <p style={{fontSize:13,color:'#c62828',marginTop:8}}>{error}</p>}
        </div>
        <button className="btn btn-primary" onClick={buscarLiga} disabled={loading || !slugBuscar.trim()}>
          {loading ? 'Buscando...' : 'Entrar →'}
        </button>
        <button className="btn" onClick={() => { setMode(null); setError(''); }}>← Atrás</button>
      </div>
    </div>
  );
}
