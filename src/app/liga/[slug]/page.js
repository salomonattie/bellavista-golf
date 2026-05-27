'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BELLAVISTA, TEE_COLORS, TEE_LABELS, ALL_APUESTAS, UNIDADES_LIST, getHolePar, getTotalPar } from '@/lib/bellavista';

export default function LigaPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [liga, setLiga] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [strokesMap, setStrokesMap] = useState({});
  const [apuestasConfig, setApuestasConfig] = useState({});
  const [unidadesConfig, setUnidadesConfig] = useState({});
  const [rondas, setRondas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inicio');
  const [rondaActiva, setRondaActiva] = useState(null);
  const [scores, setScores] = useState({});
  const [extras, setExtras] = useState({});
  const [currentHole, setCurrentHole] = useState(1);
  const [scoreTab, setScoreTab] = useState('score');

  const loadData = useCallback(async () => {
    const { data: ligaData } = await supabase.from('ligas').select('*').eq('slug', slug).single();
    if (!ligaData) { router.push('/'); return; }
    setLiga(ligaData);

    const { data: jugsData } = await supabase.from('jugadores').select('*').eq('liga_id', ligaData.id).order('created_at');
    setJugadores(jugsData || []);

    const { data: stData } = await supabase.from('strokes').select('*').eq('liga_id', ligaData.id);
    const sm = {};
    (stData || []).forEach(s => { sm[`${s.de_jugador_id}_${s.a_jugador_id}`] = s.strokes; });
    setStrokesMap(sm);

    const { data: apData } = await supabase.from('apuestas_config').select('*').eq('liga_id', ligaData.id).single();
    if (apData) {
      setApuestasConfig(apData.config?.apuestas || {});
      setUnidadesConfig(apData.config?.unidades || {});
    }

    const { data: rondasData } = await supabase.from('rondas').select('*').eq('liga_id', ligaData.id).order('created_at', { ascending: false });
    setRondas(rondasData || []);

    const activa = (rondasData || []).find(r => r.estado === 'en_curso');
    if (activa) {
      setRondaActiva(activa);
      const { data: scData } = await supabase.from('scores').select('*').eq('ronda_id', activa.id);
      const sm2 = {}, em = {};
      (scData || []).forEach(s => {
        sm2[`${s.jugador_id}_${s.hoyo}`] = s.golpes;
        if (s.extras) em[`${s.jugador_id}_${s.hoyo}`] = s.extras;
      });
      setScores(sm2);
      setExtras(em);
    }
    setLoading(false);
  }, [slug, router]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div className="app-shell">
      <div className="loading"><div style={{fontSize:32}}>🏌️</div><span>Cargando tu liga...</span></div>
    </div>
  );

  if (!liga) return null;

  const rondaJugadores = rondaActiva
    ? jugadores.filter(j => rondaActiva.jugadores_ids?.includes(j.id))
    : [];

  const TABS = [
    { id:'inicio', icon:'🏠', label:'Inicio' },
    { id:'score', icon:'✏️', label:'Score' },
    { id:'unidades', icon:'💰', label:'Unidades' },
    { id:'lideres', icon:'🏆', label:'Líderes' },
    { id:'resumen', icon:'📊', label:'Resumen' },
    { id:'liga', icon:'⚙️', label:'Mi Liga' },
  ];

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <div className="header-sub">Club de Golf Bellavista</div>
          <h1>{liga.nombre}</h1>
        </div>
        <div className="header-right">
          <div style={{fontSize:10,opacity:.7}}>liga/{slug}</div>
        </div>
      </div>

      <div className="nav-tabs">
        {TABS.map(t => (
          <div key={t.id} className={`nav-tab ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'inicio' && (
        <InicioTab
          liga={liga} jugadores={jugadores} rondas={rondas} rondaActiva={rondaActiva}
          apuestasConfig={apuestasConfig} unidadesConfig={unidadesConfig}
          onNuevaRonda={() => setTab('nueva_ronda')}
          onVerScore={() => setTab('score')}
          setTab={setTab}
        />
      )}
      {tab === 'nueva_ronda' && (
        <NuevaRondaTab
          liga={liga} jugadores={jugadores} apuestasConfig={apuestasConfig} unidadesConfig={unidadesConfig}
          onCreada={(ronda) => { setRondaActiva(ronda); setScores({}); setExtras({}); setCurrentHole(1); setTab('score'); loadData(); }}
          onCancel={() => setTab('inicio')}
        />
      )}
      {tab === 'score' && (
        <ScoreTab
          rondaActiva={rondaActiva} jugadores={rondaJugadores}
          scores={scores} setScores={setScores} extras={extras} setExtras={setExtras}
          currentHole={currentHole} setCurrentHole={setCurrentHole}
          strokesMap={strokesMap} unidadesConfig={unidadesConfig}
          onNuevaRonda={() => setTab('nueva_ronda')}
          onTerminar={() => { setTab('resumen'); }}
        />
      )}
      {tab === 'unidades' && (
        <UnidadesTab
          jugadores={rondaJugadores} extras={extras} unidadesConfig={unidadesConfig}
          rondaActiva={rondaActiva}
        />
      )}
      {tab === 'lideres' && (
        <LideresTab
          jugadores={rondaJugadores} scores={scores} strokesMap={strokesMap} rondaActiva={rondaActiva}
        />
      )}
      {tab === 'resumen' && (
        <ResumenTab
          jugadores={rondaJugadores} scores={scores} extras={extras}
          strokesMap={strokesMap} apuestasConfig={apuestasConfig} unidadesConfig={unidadesConfig}
          rondaActiva={rondaActiva} liga={liga} onNuevaRonda={() => setTab('nueva_ronda')}
        />
      )}
      {tab === 'liga' && (
        <LigaSettingsTab
          liga={liga} jugadores={jugadores} strokesMap={strokesMap}
          apuestasConfig={apuestasConfig} unidadesConfig={unidadesConfig}
          rondas={rondas} onSaved={loadData}
        />
      )}
    </div>
  );
}

/* ─── INICIO TAB ─── */
function InicioTab({ liga, jugadores, rondas, rondaActiva, apuestasConfig, unidadesConfig, onNuevaRonda, onVerScore, setTab }) {
  const hoy = new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' });
  const rondasTerminadas = rondas.filter(r => r.estado === 'terminada');

  return (
    <div className="screen">
      <div style={{textAlign:'center',padding:'8px 0 16px'}}>
        <div style={{fontSize:13,color:'#757575'}}>{hoy}</div>
        <div style={{fontSize:20,fontWeight:700,color:'#1a5c2e',marginTop:4}}>{liga.nombre}</div>
        <div style={{fontSize:13,color:'#757575',marginTop:2}}>{jugadores.length} miembros · {rondasTerminadas.length} rondas jugadas</div>
      </div>

      {rondaActiva ? (
        <div className="card" style={{borderColor:'#1a5c2e',borderWidth:2}}>
          <div className="card-title" style={{color:'#1a5c2e'}}>🟢 Ronda en curso</div>
          <div style={{fontSize:14,marginBottom:12}}>
            {rondaActiva.jugadores_ids?.length} jugadores · {new Date(rondaActiva.created_at).toLocaleDateString('es-MX')}
          </div>
          <button className="btn btn-primary mb-0" onClick={onVerScore}>Continuar ronda →</button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={onNuevaRonda}>+ Nueva ronda de hoy</button>
      )}

      <div className="card">
        <div className="card-title">Miembros del grupo</div>
        {jugadores.length === 0 && <p className="text-muted">Agrega jugadores en ⚙️ Mi Liga.</p>}
        {jugadores.map(j => (
          <div key={j.id} className="row">
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="avatar" style={{background: TEE_COLORS[j.tee]||'#1a5c2e',width:32,height:32,fontSize:12}}>{j.nombre[0].toUpperCase()}</div>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{j.nombre}</div>
                <div style={{fontSize:11,color:'#757575'}}>{TEE_LABELS[j.tee]} · HCP {j.handicap}</div>
              </div>
            </div>
            <span className="badge badge-gray">@{j.username}</span>
          </div>
        ))}
        <button className="btn btn-sm mt-8" onClick={() => setTab('liga')}>+ Editar miembros</button>
      </div>

      {rondasTerminadas.length > 0 && (
        <div className="card">
          <div className="card-title">Últimas rondas</div>
          {rondasTerminadas.slice(0,5).map(r => (
            <div key={r.id} className="row">
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{new Date(r.fecha).toLocaleDateString('es-MX',{day:'numeric',month:'short'})}</div>
                <div style={{fontSize:11,color:'#757575'}}>{r.jugadores_ids?.length} jugadores</div>
              </div>
              <span className="badge badge-green">Terminada</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-title">Tu link para compartir</div>
        <div style={{background:'#f5f5f5',borderRadius:8,padding:'10px 12px',fontSize:13,wordBreak:'break-all',color:'#1a5c2e',fontWeight:600}}>
          {typeof window !== 'undefined' ? window.location.href : `bellavistagolf.vercel.app/liga/...`}
        </div>
        <button className="btn btn-sm mt-8" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copiar link</button>
      </div>
    </div>
  );
}

/* ─── NUEVA RONDA TAB ─── */
function NuevaRondaTab({ liga, jugadores, apuestasConfig, unidadesConfig, onCreada, onCancel }) {
  const [selected, setSelected] = useState([]);
  const [apOverride, setApOverride] = useState({});
  const [step, setStep] = useState(1); // 1=jugadores, 2=apuestas

  function toggleJugador(id) {
    setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  }

  async function crearRonda() {
    const apFinal = { ...apuestasConfig, ...apOverride };
    const { data, error } = await supabase.from('rondas').insert({
      liga_id: liga.id,
      jugadores_ids: selected,
      apuestas_override: apFinal,
      estado: 'en_curso',
      fecha: new Date().toISOString().split('T')[0]
    }).select().single();
    if (!error && data) onCreada(data);
  }

  if (step === 1) return (
    <div className="screen">
      <div className="card">
        <div className="card-title">¿Quiénes juegan hoy?</div>
        <p className="text-muted" style={{marginBottom:12}}>Selecciona los jugadores de hoy. Puedes cambiarlos cada ronda.</p>
        {jugadores.length === 0 && <p className="text-muted">Primero agrega jugadores en ⚙️ Mi Liga.</p>}
        {jugadores.map(j => (
          <div key={j.id} className="toggle-row" onClick={() => toggleJugador(j.id)} style={{cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="avatar" style={{background:selected.includes(j.id)?TEE_COLORS[j.tee]:'#ccc',width:32,height:32,fontSize:12}}>{j.nombre[0].toUpperCase()}</div>
              <div>
                <div className="toggle-label-main">{j.nombre}</div>
                <div className="toggle-label-sub">{TEE_LABELS[j.tee]} · HCP {j.handicap}</div>
              </div>
            </div>
            <button className={`toggle ${selected.includes(j.id)?'on':''}`}></button>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => setStep(2)} disabled={selected.length < 2}>
        Configurar apuestas ({selected.length} jugadores) →
      </button>
      <button className="btn" onClick={onCancel}>Cancelar</button>
    </div>
  );

  return (
    <div className="screen">
      <div className="card">
        <div className="card-title">Apuestas de hoy</div>
        <p className="text-muted" style={{marginBottom:12}}>Estas son las apuestas base de tu liga. Puedes cambiarlas solo para hoy.</p>
        {ALL_APUESTAS.map(ap => {
          const cfg = apOverride[ap.id] ?? apuestasConfig[ap.id] ?? {};
          const activa = cfg.activa ?? false;
          return (
            <div key={ap.id}>
              <div className="toggle-row">
                <div className="toggle-label">
                  <div className="toggle-label-main">{ap.name}</div>
                  <div className="toggle-label-sub">{ap.desc}</div>
                </div>
                <button className={`toggle ${activa?'on':''}`} onClick={() => {
                  const next = { ...(apOverride[ap.id] ?? apuestasConfig[ap.id] ?? {}), activa: !activa };
                  setApOverride(o => ({...o,[ap.id]:next}));
                }}></button>
              </div>
              {activa && ap.campos.map(campo => {
                if (campo.condicional && cfg[ap.campos.find(c=>c.tipo==='select'&&!c.condicional)?.key] !== campo.condicional) return null;
                if (campo.tipo === 'select') return (
                  <div key={campo.key} style={{marginBottom:8,marginLeft:8}}>
                    <label>{campo.label}</label>
                    <select value={cfg[campo.key]||campo.opciones[0]} onChange={e => {
                      const next = {...(apOverride[ap.id]??apuestasConfig[ap.id]??{}), activa:true, [campo.key]:e.target.value};
                      setApOverride(o=>({...o,[ap.id]:next}));
                    }}>
                      {campo.opciones.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                );
                return (
                  <div key={campo.key} style={{marginBottom:8,marginLeft:8}}>
                    <label>{campo.label}</label>
                    <input type={campo.tipo} placeholder={campo.placeholder} value={cfg[campo.key]||''}
                      onChange={e => {
                        const v = campo.tipo==='number' ? +e.target.value : e.target.value;
                        const next = {...(apOverride[ap.id]??apuestasConfig[ap.id]??{}), activa:true, [campo.key]:v};
                        setApOverride(o=>({...o,[ap.id]:next}));
                      }}
                    />
                  </div>
                );
              })}
              <div className="divider" style={{margin:'4px 0'}}></div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-primary" onClick={crearRonda}>¡A jugar! 🏌️</button>
      <button className="btn" onClick={() => setStep(1)}>← Atrás</button>
    </div>
  );
}

/* ─── SCORE TAB ─── */
function ScoreTab({ rondaActiva, jugadores, scores, setScores, extras, setExtras, currentHole, setCurrentHole, strokesMap, unidadesConfig, onNuevaRonda, onTerminar }) {
  if (!rondaActiva) return (
    <div className="screen">
      <div className="card" style={{textAlign:'center',padding:32}}>
        <div style={{fontSize:40,marginBottom:12}}>🏌️</div>
        <p className="text-muted" style={{marginBottom:16}}>No hay ronda activa.</p>
        <button className="btn btn-primary" onClick={onNuevaRonda}>Iniciar ronda</button>
      </div>
    </div>
  );

  const hole = BELLAVISTA.holes[currentHole - 1];
  const pills = BELLAVISTA.holes.map(h => {
    const done = jugadores.length > 0 && jugadores.every(j => scores[`${j.id}_${h.n}`]);
    return (
      <div key={h.n} className={`hole-pill ${done?'done':''} ${h.n===currentHole?'current':''}`} onClick={() => setCurrentHole(h.n)}>
        {h.n}
      </div>
    );
  });

  async function saveScore(jugadorId, hoyo, golpes, extrasData) {
    await supabase.from('scores').upsert({
      ronda_id: rondaActiva.id,
      jugador_id: jugadorId,
      hoyo,
      golpes,
      extras: extrasData || {}
    }, { onConflict: 'ronda_id,jugador_id,hoyo' });
  }

  function handleScore(jid, val, par) {
    const g = +val;
    const newScores = {...scores, [`${jid}_${currentHole}`]: g};
    setScores(newScores);
    const diff = g - par;
    const newExtras = {...(extras[`${jid}_${currentHole}`]||{})};
    newExtras.birdie = diff === -1;
    newExtras.eagle = diff <= -2;
    newExtras.holeinone = g === 1;
    const newE = {...extras, [`${jid}_${currentHole}`]: newExtras};
    setExtras(newE);
    saveScore(jid, currentHole, g, newExtras);
  }

  function handleExtra(jid, key, val) {
    const newE = {...extras, [`${jid}_${currentHole}`]: {...(extras[`${jid}_${currentHole}`]||{}), [key]:val}};
    setExtras(newE);
    const g = scores[`${jid}_${currentHole}`];
    if (g) saveScore(jid, currentHole, g, newE[`${jid}_${currentHole}`]);
  }

  const activeUnidades = UNIDADES_LIST.filter(u => unidadesConfig?.[u.id]?.activa);

  return (
    <>
      <div className="hole-nav">{pills}</div>
      <div className="screen">
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div>
              <div style={{fontSize:22,fontWeight:700,color:'#1a5c2e'}}>Hoyo {hole.n}</div>
              <div style={{fontSize:11,color:'#757575'}}>HCP {hole.hcp} · {hole.n<=9?'Front 9':'Back 9'}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:28,fontWeight:700}}>Par {hole.par}</div>
            </div>
          </div>

          {jugadores.map(j => {
            const tee = j.tee || 'azul';
            const par = getHolePar(hole, tee);
            const yds = hole.yds[tee] || '-';
            const g = scores[`${j.id}_${currentHole}`] || '';
            const diff = g ? +g - par : null;
            let cls = 'score-box';
            if (diff !== null) {
              if (diff <= -2) cls += ' score-eagle';
              else if (diff === -1) cls += ' score-birdie';
              else if (diff === 0) cls += ' score-par';
              else if (diff === 1) cls += ' score-bogey';
              else cls += ' score-double';
            }
            const exData = extras[`${j.id}_${currentHole}`] || {};
            const manualUs = activeUnidades.filter(u => !u.auto);

            return (
              <div key={j.id} style={{marginBottom:14,paddingBottom:14,borderBottom:'1px solid #eee'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div className="avatar" style={{background:TEE_COLORS[tee]}}>{j.nombre[0].toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14}}>{j.nombre}</div>
                    <div style={{fontSize:11,color:'#757575'}}>{TEE_LABELS[tee]} · {yds} yds · Par {par}</div>
                  </div>
                  <input type="number" className={cls} min="1" max="15"
                    value={g} placeholder={par}
                    onChange={e => handleScore(j.id, e.target.value, par)}
                  />
                </div>
                {g && manualUs.length > 0 && (
                  <div style={{paddingLeft:46}}>
                    {manualUs.map(u => (
                      <span key={u.id} className={`chip ${exData[u.id]?'on':''}`}
                        onClick={() => handleExtra(j.id, u.id, !exData[u.id])}>
                        {u.icon} {u.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{display:'flex',gap:8}}>
          <button className="btn" style={{flex:1}} onClick={() => setCurrentHole(h=>Math.max(1,h-1))} disabled={currentHole<=1}>← Ant.</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={() => setCurrentHole(h=>Math.min(18,h+1))} disabled={currentHole>=18}>Sig. →</button>
        </div>
        {currentHole === 18 && (
          <button className="btn" style={{color:'#1a5c2e',borderColor:'#1a5c2e',marginTop:8}} onClick={onTerminar}>Ver resumen final →</button>
        )}
      </div>
    </>
  );
}

/* ─── UNIDADES TAB ─── */
function UnidadesTab({ jugadores, extras, unidadesConfig, rondaActiva }) {
  const activeUs = UNIDADES_LIST.filter(u => unidadesConfig?.[u.id]?.activa);

  if (!rondaActiva) return <div className="screen"><p className="text-muted">Inicia una ronda primero.</p></div>;
  if (!activeUs.length) return <div className="screen"><div className="card"><p className="text-muted">No hay unidades configuradas para esta liga.</p></div></div>;

  const playerStats = jugadores.map(j => {
    let won = 0, lost = 0;
    const detail = {};
    BELLAVISTA.holes.forEach(h => {
      const ex = extras[`${j.id}_${h.n}`] || {};
      activeUs.forEach(u => {
        if (!detail[u.id]) detail[u.id] = 0;
        if (ex[u.id]) {
          const monto = unidadesConfig[u.id]?.montos?.[j.id] || 0;
          won += monto * (jugadores.length - 1);
          detail[u.id]++;
        }
      });
    });
    jugadores.forEach(o => {
      if (o.id === j.id) return;
      BELLAVISTA.holes.forEach(h => {
        const ex = extras[`${o.id}_${h.n}`] || {};
        activeUs.forEach(u => {
          if (ex[u.id]) {
            const monto = unidadesConfig[u.id]?.montos?.[j.id] || 0;
            lost += monto;
          }
        });
      });
    });
    return { j, won, lost, net: won - lost, detail };
  });

  return (
    <div className="screen">
      <div className="card">
        <div className="card-title">Cuentas de unidades</div>
        {playerStats.map(({ j, won, lost, net, detail }) => (
          <div key={j.id} className="row">
            <div>
              <div style={{fontWeight:600,fontSize:14}}>{j.nombre}</div>
              <div style={{marginTop:3}}>
                {activeUs.map(u => detail[u.id] > 0 ? (
                  <span key={u.id} className="badge badge-green" style={{marginRight:4}}>{u.icon}×{detail[u.id]}</span>
                ) : null)}
              </div>
            </div>
            <div className={net > 0 ? 'money-pos' : net < 0 ? 'money-neg' : 'money-zero'}>
              {net > 0 ? '+' : ''}${Math.abs(net).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">Valores por jugador</div>
        {activeUs.map(u => (
          <div key={u.id} style={{marginBottom:10}}>
            <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{u.icon} {u.name}</div>
            {jugadores.map(j => (
              <div key={j.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#757575',padding:'2px 0'}}>
                <span>{j.nombre}</span>
                <span>${(unidadesConfig[u.id]?.montos?.[j.id]||0).toLocaleString()}/u</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LÍDERES TAB ─── */
function LideresTab({ jugadores, scores, strokesMap, rondaActiva }) {
  if (!rondaActiva) return <div className="screen"><p className="text-muted">Inicia una ronda primero.</p></div>;

  const stats = jugadores.map(j => {
    let gross = 0, net = 0, played = 0, birdies = 0;
    BELLAVISTA.holes.forEach(h => {
      const g = scores[`${j.id}_${h.n}`];
      if (!g) return;
      const par = getHolePar(h, j.tee || 'azul');
      let st = 0;
      jugadores.forEach(o => {
        if (o.id !== j.id) {
          const given = strokesMap[`${o.id}_${j.id}`] || 0;
          if (given > 0 && h.hcp <= given) st = Math.max(st, 1);
        }
      });
      gross += +g;
      net += +g - st;
      played++;
      if (+g - par === -1) birdies++;
    });
    const tee = j.tee || 'azul';
    const parPlayed = BELLAVISTA.holes.filter(h => scores[`${j.id}_${h.n}`]).reduce((s,h) => s + getHolePar(h, tee), 0);
    return { j, gross, net, played, birdies, vspar: net - parPlayed };
  }).sort((a,b) => a.vspar - b.vspar);

  return (
    <div className="screen">
      <div className="card">
        <div className="card-title">Clasificación — {stats[0]?.played || 0} hoyos</div>
        {stats.map(({ j, gross, birdies, vspar }, idx) => (
          <div key={j.id} className="metric-row">
            <div className="metric-rank">{idx + 1}</div>
            <div className="avatar" style={{background:TEE_COLORS[j.tee||'azul'],width:32,height:32,fontSize:12,flexShrink:0}}>{j.nombre[0].toUpperCase()}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14}}>{j.nombre}</div>
              <div style={{fontSize:11,color:'#757575'}}>Gross {gross||'-'} · {birdies} 🐦</div>
            </div>
            <div style={{fontWeight:700,fontSize:17,color:vspar<0?'#1a5c2e':vspar===0?'#111':'#c62828'}}>
              {vspar===0?'E':vspar>0?`+${vspar}`:vspar}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── RESUMEN TAB ─── */
function ResumenTab({ jugadores, scores, extras, strokesMap, apuestasConfig, unidadesConfig, rondaActiva, liga, onNuevaRonda }) {
  if (!rondaActiva) return (
    <div className="screen">
      <div className="card" style={{textAlign:'center',padding:32}}>
        <p className="text-muted" style={{marginBottom:16}}>No hay ronda activa.</p>
        <button className="btn btn-primary" onClick={onNuevaRonda}>Iniciar ronda</button>
      </div>
    </div>
  );

  const balance = {};
  jugadores.forEach(j => { balance[j.id] = 0; });

  const apActivas = ALL_APUESTAS.filter(ap => {
    const cfg = rondaActiva.apuestas_override?.[ap.id] ?? apuestasConfig[ap.id] ?? {};
    return cfg.activa;
  });

  function calcSkins(cfg) {
    const monto = cfg.monto || 0;
    const results = [];
    let acum = monto;
    BELLAVISTA.holes.forEach(h => {
      const hasAll = jugadores.every(j => scores[`${j.id}_${h.n}`]);
      if (!hasAll) return;
      const nets = jugadores.map(j => {
        const g = +scores[`${j.id}_${h.n}`];
        const par = getHolePar(h, j.tee||'azul');
        let st = 0;
        jugadores.forEach(o => { if (o.id!==j.id) { const gv=strokesMap[`${o.id}_${j.id}`]||0; if(gv>0&&h.hcp<=gv)st=Math.max(st,1); }});
        return { j, net: g - st };
      });
      const min = Math.min(...nets.map(x=>x.net));
      const winners = nets.filter(x=>x.net===min);
      if (winners.length === 1) {
        const w = winners[0].j;
        results.push({ hoyo:h.n, winner:w.nombre, monto:acum });
        balance[w.id] += acum * (jugadores.length - 1);
        jugadores.forEach(j => { if(j.id!==w.id) balance[j.id] -= acum; });
        acum = monto;
      } else {
        results.push({ hoyo:h.n, empate:true, acum:acum+monto });
        acum += monto;
      }
    });
    return results;
  }

  function calcMedal(cfg) {
    const monto = cfg.monto || 0;
    const tots = jugadores.map(j => {
      let net = 0;
      BELLAVISTA.holes.forEach(h => {
        const g = scores[`${j.id}_${h.n}`];
        if (!g) return;
        let st = 0;
        jugadores.forEach(o => { if(o.id!==j.id){const gv=strokesMap[`${o.id}_${j.id}`]||0;if(gv>0&&h.hcp<=gv)st=Math.max(st,1);}});
        net += +g - st;
      });
      return { j, net };
    }).sort((a,b)=>a.net-b.net);
    if (tots.length && monto) {
      const w = tots[0].j;
      balance[w.id] += monto * (jugadores.length-1);
      jugadores.forEach(j => { if(j.id!==w.id) balance[j.id] -= monto; });
    }
    return tots;
  }

  function calcNassau(cfg) {
    const { front, back, total } = cfg;
    const result = {};
    ['front','back','total'].forEach(part => {
      const monto = cfg[part] || 0;
      if (!monto) return;
      const holes = part==='front'?BELLAVISTA.holes.slice(0,9):part==='back'?BELLAVISTA.holes.slice(9):BELLAVISTA.holes;
      const tots = jugadores.map(j => {
        let net = 0;
        holes.forEach(h => {
          const g = scores[`${j.id}_${h.n}`];
          if (!g) return;
          let st=0; jugadores.forEach(o=>{if(o.id!==j.id){const gv=strokesMap[`${o.id}_${j.id}`]||0;if(gv>0&&h.hcp<=gv)st=Math.max(st,1);}});
          net += +g-st;
        });
        return { j, net };
      }).sort((a,b)=>a.net-b.net);
      if (tots.length) {
        const w = tots[0].j;
        result[part] = { winner:w.nombre, monto };
        balance[w.id] += monto*(jugadores.length-1);
        jugadores.forEach(j=>{if(j.id!==w.id)balance[j.id]-=monto;});
      }
    });
    return result;
  }

  // Unidades
  const activeUs = UNIDADES_LIST.filter(u => unidadesConfig?.[u.id]?.activa);
  jugadores.forEach(j => {
    BELLAVISTA.holes.forEach(h => {
      const ex = extras[`${j.id}_${h.n}`] || {};
      activeUs.forEach(u => {
        if (ex[u.id]) {
          const monto = unidadesConfig[u.id]?.montos?.[j.id] || 0;
          balance[j.id] += monto*(jugadores.length-1);
          jugadores.forEach(o => { if(o.id!==j.id) balance[o.id] -= monto; });
        }
      });
    });
  });

  async function terminarRonda() {
    await supabase.from('rondas').update({ estado:'terminada' }).eq('id', rondaActiva.id);
    await supabase.from('resultados').insert(
      jugadores.map(j => ({ ronda_id:rondaActiva.id, jugador_id:j.id, balance:balance[j.id] }))
    );
    alert('Ronda terminada y guardada ✅');
  }

  return (
    <div className="screen">
      {apActivas.map(ap => {
        const cfg = rondaActiva.apuestas_override?.[ap.id] ?? apuestasConfig[ap.id] ?? {};
        if (ap.id === 'skins') {
          const res = calcSkins(cfg);
          return (
            <div key={ap.id} className="card">
              <div className="card-title">{ap.name} · ${cfg.monto||0}/skin</div>
              {res.length ? res.map((r,i) => (
                <div key={i} className="row">
                  <span>H{r.hoyo}</span>
                  {r.empate ? <span className="badge badge-gray">Empate → Bote ${r.acum}</span> : <span className="badge badge-green">{r.winner} +${r.monto}</span>}
                </div>
              )) : <p className="text-muted">Sin hoyos completados.</p>}
            </div>
          );
        }
        if (ap.id === 'medal' || ap.id === 'stableford') {
          const tots = calcMedal(cfg);
          return (
            <div key={ap.id} className="card">
              <div className="card-title">{ap.name} · ${cfg.monto||0}</div>
              {tots.map((t,i) => (
                <div key={t.j.id} className="row">
                  <span>{t.j.nombre}</span>
                  <span style={{fontWeight:600}}>{t.net} neto {i===0?'🏆':''}</span>
                </div>
              ))}
            </div>
          );
        }
        if (ap.id === 'nassau') {
          const res = calcNassau(cfg);
          return (
            <div key={ap.id} className="card">
              <div className="card-title">Nassau</div>
              {['front','back','total'].map(p => res[p] ? (
                <div key={p} className="row">
                  <span style={{textTransform:'capitalize'}}>{p==='front'?'Front 9':p==='back'?'Back 9':'Total'}</span>
                  <span className="badge badge-green">{res[p].winner} +${res[p].monto}</span>
                </div>
              ) : null)}
            </div>
          );
        }
        return (
          <div key={ap.id} className="card">
            <div className="card-title">{ap.name}</div>
            <p className="text-muted" style={{fontSize:12}}>Cálculo al terminar la ronda.</p>
          </div>
        );
      })}

      {activeUs.length > 0 && (
        <div className="card">
          <div className="card-title">Unidades</div>
          {jugadores.map(j => {
            let net = 0;
            BELLAVISTA.holes.forEach(h => {
              const ex = extras[`${j.id}_${h.n}`]||{};
              activeUs.forEach(u => {
                if(ex[u.id]){const m=unidadesConfig[u.id]?.montos?.[j.id]||0;net+=m*(jugadores.length-1);}
              });
            });
            jugadores.forEach(o => {
              if(o.id===j.id)return;
              BELLAVISTA.holes.forEach(h=>{
                const ex=extras[`${o.id}_${h.n}`]||{};
                activeUs.forEach(u=>{if(ex[u.id]){const m=unidadesConfig[u.id]?.montos?.[j.id]||0;net-=m;}});
              });
            });
            return (
              <div key={j.id} className="row">
                <span>{j.nombre}</span>
                <span className={net>0?'money-pos':net<0?'money-neg':'money-zero'}>{net>0?'+':''}${Math.abs(net).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{borderColor:'#1a5c2e',borderWidth:2}}>
        <div className="card-title" style={{color:'#1a5c2e'}}>Total final del día</div>
        {jugadores.map(j => (
          <div key={j.id} className="row">
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="avatar" style={{background:TEE_COLORS[j.tee||'azul'],width:30,height:30,fontSize:11}}>{j.nombre[0].toUpperCase()}</div>
              <span style={{fontWeight:600}}>{j.nombre}</span>
            </div>
            <span style={{fontSize:20,fontWeight:700}} className={balance[j.id]>0?'money-pos':balance[j.id]<0?'money-neg':'money-zero'}>
              {balance[j.id]>0?'+':''}${Math.abs(balance[j.id]).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={terminarRonda}>Terminar y guardar ronda ✅</button>
      <button className="btn" onClick={onNuevaRonda} style={{marginTop:4}}>Nueva ronda</button>
    </div>
  );
}

/* ─── LIGA SETTINGS TAB ─── */
function LigaSettingsTab({ liga, jugadores, strokesMap, apuestasConfig, unidadesConfig, rondas, onSaved }) {
  const [subTab, setSubTab] = useState('jugadores');
  const [jugs, setJugs] = useState(jugadores.map(j=>({...j})));
  const [sm, setSm] = useState({...strokesMap});
  const [apCfg, setApCfg] = useState({...apuestasConfig});
  const [uCfg, setUCfg] = useState({...unidadesConfig});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveJugadores() {
    setSaving(true);
    for (const j of jugs) {
      if (j.id) {
        await supabase.from('jugadores').update({ nombre:j.nombre, username:j.username, tee:j.tee, handicap:j.handicap||0 }).eq('id', j.id);
      } else if (j.nombre && j.username) {
        await supabase.from('jugadores').insert({ liga_id:liga.id, nombre:j.nombre, username:j.username, tee:j.tee||'azul', handicap:j.handicap||0 });
      }
    }
    for (const key of Object.keys(sm)) {
      const [deId, aId] = key.split('_');
      await supabase.from('strokes').upsert({ liga_id:liga.id, de_jugador_id:deId, a_jugador_id:aId, strokes:sm[key]||0 }, { onConflict:'liga_id,de_jugador_id,a_jugador_id' });
    }
    await supabase.from('apuestas_config').upsert({ liga_id:liga.id, config:{ apuestas:apCfg, unidades:uCfg }, updated_at:new Date().toISOString() }, { onConflict:'liga_id' });
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false),2000);
    onSaved();
  }

  function addJugador() {
    setJugs(j=>[...j,{nombre:'',username:'',tee:'azul',handicap:0}]);
  }

  const SUBTABS = ['jugadores','strokes','apuestas','unidades','historial'];

  return (
    <div>
      <div style={{display:'flex',borderBottom:'1px solid #eee',background:'white',overflowX:'auto'}}>
        {SUBTABS.map(t=>(
          <div key={t} onClick={()=>setSubTab(t)}
            style={{padding:'10px 14px',fontSize:12,fontWeight:subTab===t?700:400,color:subTab===t?'#1a5c2e':'#757575',borderBottom:subTab===t?'2px solid #1a5c2e':'2px solid transparent',cursor:'pointer',whiteSpace:'nowrap',textTransform:'capitalize'}}>
            {t}
          </div>
        ))}
      </div>

      <div className="screen">
        {subTab === 'jugadores' && (
          <div>
            <div className="card">
              <div className="card-title">Miembros de la liga</div>
              {jugs.map((j,i)=>(
                <div key={j.id||i} style={{marginBottom:14,paddingBottom:14,borderBottom:'1px solid #eee'}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                    <div className="avatar" style={{background:TEE_COLORS[j.tee||'azul']}}>{(j.nombre||'?')[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <input value={j.nombre} placeholder="Nombre completo" onChange={e=>{const n=[...jugs];n[i]={...n[i],nombre:e.target.value};setJugs(n);}} style={{marginBottom:6}} />
                      <input value={j.username} placeholder="@username" onChange={e=>{const n=[...jugs];n[i]={...n[i],username:e.target.value.replace('@','')};setJugs(n);}} />
                    </div>
                  </div>
                  <label>Tee</label>
                  <div style={{display:'flex',flexWrap:'wrap'}}>
                    {Object.entries(TEE_LABELS).map(([k,v])=>(
                      <button key={k} className="tee-pill" style={{background:j.tee===k?TEE_COLORS[k]:'white',color:j.tee===k?'white':'#111',borderColor:j.tee===k?TEE_COLORS[k]:'#e0e0e0'}}
                        onClick={()=>{const n=[...jugs];n[i]={...n[i],tee:k};setJugs(n);}}>{v}</button>
                    ))}
                  </div>
                  <label>Handicap oficial</label>
                  <input type="number" value={j.handicap||0} onChange={e=>{const n=[...jugs];n[i]={...n[i],handicap:+e.target.value};setJugs(n);}} />
                </div>
              ))}
              <button className="btn" onClick={addJugador}>+ Agregar jugador</button>
            </div>
          </div>
        )}

        {subTab === 'strokes' && (
          <div className="card">
            <div className="card-title">Strokes entre jugadores</div>
            <p className="text-muted" style={{marginBottom:12}}>Fila = quien da strokes. Columna = quien los recibe.</p>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr>
                    <th style={{padding:'6px 8px',textAlign:'left',borderBottom:'1px solid #eee',background:'#f5f5f5'}}>Da \ Recibe</th>
                    {jugs.filter(j=>j.id).map(j=><th key={j.id} style={{padding:'6px 4px',textAlign:'center',borderBottom:'1px solid #eee',background:'#f5f5f5'}}>{j.nombre.split(' ')[0]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {jugs.filter(j=>j.id).map(de=>(
                    <tr key={de.id}>
                      <td style={{padding:'6px 8px',fontWeight:600,borderBottom:'1px solid #eee'}}>{de.nombre.split(' ')[0]}</td>
                      {jugs.filter(j=>j.id).map(a=>(
                        <td key={a.id} style={{padding:'4px',textAlign:'center',borderBottom:'1px solid #eee'}}>
                          {de.id===a.id ? <span style={{color:'#ccc'}}>—</span> : (
                            <input type="number" min="0" max="36" value={sm[`${de.id}_${a.id}`]||0}
                              style={{width:42,padding:'4px',textAlign:'center',border:'1px solid #e0e0e0',borderRadius:6,fontSize:13}}
                              onChange={e=>setSm(s=>({...s,[`${de.id}_${a.id}`]:+e.target.value}))}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {subTab === 'apuestas' && (
          <div className="card">
            <div className="card-title">Apuestas base de la liga</div>
            <p className="text-muted" style={{marginBottom:12}}>Estas serán las apuestas por default en cada ronda. Puedes ajustarlas al crear la ronda del día.</p>
            {ALL_APUESTAS.map(ap => {
              const cfg = apCfg[ap.id] || {};
              const activa = !!cfg.activa;
              return (
                <div key={ap.id}>
                  <div className="toggle-row">
                    <div className="toggle-label">
                      <div className="toggle-label-main">{ap.name}</div>
                      <div className="toggle-label-sub">{ap.desc}</div>
                    </div>
                    <button className={`toggle ${activa?'on':''}`} onClick={()=>setApCfg(c=>({...c,[ap.id]:{...cfg,activa:!activa}}))}></button>
                  </div>
                  {activa && ap.campos.map(campo => {
                    const mainSel = ap.campos.find(c=>c.tipo==='select'&&!c.condicional);
                    if (campo.condicional && cfg[mainSel?.key] !== campo.condicional) return null;
                    if (campo.tipo === 'select') return (
                      <div key={campo.key} style={{marginLeft:8,marginBottom:8}}>
                        <label>{campo.label}</label>
                        <select value={cfg[campo.key]||campo.opciones[0]} onChange={e=>setApCfg(c=>({...c,[ap.id]:{...cfg,[campo.key]:e.target.value}}))}>
                          {campo.opciones.map(o=><option key={o}>{o}</option>)}
                        </select>
                      </div>
                    );
                    return (
                      <div key={campo.key} style={{marginLeft:8,marginBottom:8}}>
                        <label>{campo.label}</label>
                        <input type={campo.tipo} placeholder={campo.placeholder} value={cfg[campo.key]||''}
                          onChange={e=>setApCfg(c=>({...c,[ap.id]:{...cfg,[campo.key]:campo.tipo==='number'?+e.target.value:e.target.value}}))}
                        />
                      </div>
                    );
                  })}
                  <div className="divider" style={{margin:'4px 0'}}></div>
                </div>
              );
            })}
          </div>
        )}

        {subTab === 'unidades' && (
          <div className="card">
            <div className="card-title">Configuración de unidades</div>
            <p className="text-muted" style={{marginBottom:12}}>Activa las unidades que quieran jugar y pon el valor por jugador.</p>
            {UNIDADES_LIST.map(u => {
              const cfg = uCfg[u.id] || {};
              const activa = !!cfg.activa;
              return (
                <div key={u.id}>
                  <div className="toggle-row">
                    <div className="toggle-label">
                      <div className="toggle-label-main">{u.icon} {u.name}</div>
                      <div className="toggle-label-sub">{u.auto?'Se detecta automático':'Se marca manual por hoyo'}</div>
                    </div>
                    <button className={`toggle ${activa?'on':''}`} onClick={()=>setUCfg(c=>({...c,[u.id]:{...cfg,activa:!activa}}))}></button>
                  </div>
                  {activa && jugs.filter(j=>j.id).map(j=>(
                    <div key={j.id} style={{marginLeft:8,marginBottom:8}}>
                      <label>{j.nombre} — valor por unidad (MXN)</label>
                      <input type="number" placeholder="$0" value={(cfg.montos||{})[j.id]||''}
                        onChange={e=>setUCfg(c=>({...c,[u.id]:{...cfg,montos:{...(cfg.montos||{}),[j.id]:+e.target.value}}}))}
                      />
                    </div>
                  ))}
                  <div className="divider" style={{margin:'4px 0'}}></div>
                </div>
              );
            })}
          </div>
        )}

        {subTab === 'historial' && (
          <div className="card">
            <div className="card-title">Historial de rondas</div>
            {rondas.length === 0 && <p className="text-muted">Aún no hay rondas terminadas.</p>}
            {rondas.map(r=>(
              <div key={r.id} className="row">
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>{new Date(r.fecha).toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'})}</div>
                  <div style={{fontSize:11,color:'#757575'}}>{r.jugadores_ids?.length} jugadores</div>
                </div>
                <span className={`badge ${r.estado==='terminada'?'badge-green':'badge-gold'}`}>{r.estado==='terminada'?'Terminada':'En curso'}</span>
              </div>
            ))}
          </div>
        )}

        {subTab !== 'historial' && (
          <button className="btn btn-primary" onClick={saveJugadores} disabled={saving}>
            {saving?'Guardando...':saved?'✅ Guardado':'Guardar cambios'}
          </button>
        )}
      </div>
    </div>
  );
}
