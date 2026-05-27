export const BELLAVISTA = {
  holes: [
    {n:1,par:4,hcp:3,yds:{negro:436,azul:416,blanco:388,gold:377,rojo:325}},
    {n:2,par:5,hcp:9,yds:{negro:568,azul:559,blanco:551,gold:522,rojo:511}},
    {n:3,par:3,hcp:17,yds:{negro:178,azul:171,blanco:154,gold:141,rojo:136}},
    {n:4,par:4,hcp:15,yds:{negro:364,azul:356,blanco:337,gold:325,rojo:318}},
    {n:5,par:4,hcp:5,yds:{negro:420,azul:408,blanco:392,gold:309,rojo:303}},
    {n:6,par:4,hcp:7,yds:{negro:391,azul:385,blanco:378,gold:362,rojo:326}},
    {n:7,par:3,hcp:13,yds:{negro:198,azul:190,blanco:168,gold:160,rojo:138}},
    {n:8,par:4,hcp:11,yds:{negro:423,azul:401,blanco:358,gold:344,rojo:321}},
    {n:9,par:5,hcp:1,yds:{negro:456,azul:407,blanco:543,gold:493,rojo:459},parByTee:{negro:4,azul:4,blanco:5,gold:5,rojo:5}},
    {n:10,par:4,hcp:8,yds:{negro:422,azul:398,blanco:376,gold:353,rojo:347}},
    {n:11,par:3,hcp:16,yds:{negro:219,azul:211,blanco:194,gold:167,rojo:136}},
    {n:12,par:5,hcp:4,yds:{negro:567,azul:559,blanco:542,gold:514,rojo:465}},
    {n:13,par:4,hcp:10,yds:{negro:401,azul:396,blanco:330,gold:274,rojo:288}},
    {n:14,par:5,hcp:14,yds:{negro:542,azul:516,blanco:490,gold:455,rojo:449}},
    {n:15,par:4,hcp:2,yds:{negro:477,azul:455,blanco:423,gold:396,rojo:353}},
    {n:16,par:3,hcp:18,yds:{negro:198,azul:193,blanco:176,gold:151,rojo:125}},
    {n:17,par:4,hcp:6,yds:{negro:472,azul:430,blanco:404,gold:333,rojo:326}},
    {n:18,par:4,hcp:12,yds:{negro:461,azul:441,blanco:393,gold:368,rojo:320}}
  ]
};

export const TEE_COLORS = {
  negro:'#111',azul:'#1565c0',blanco:'#777',gold:'#b8860b',rojo:'#c62828'
};

export const TEE_LABELS = {
  negro:'Negras',azul:'Azules',blanco:'Blancas',gold:'Gold',rojo:'Rojas'
};

export function getHolePar(hole, tee) {
  return hole.parByTee?.[tee] ?? hole.par;
}

export function getTotalPar(tee) {
  return BELLAVISTA.holes.reduce((s,h) => s + getHolePar(h, tee), 0);
}

export const ALL_APUESTAS = [
  {
    id:'medal', name:'Medal (Stroke Play)', desc:'Menos golpes totales gana',
    campos:[{key:'monto',label:'¿Cuánto vale? (MXN)',tipo:'number',placeholder:'Ej: 500'}]
  },
  {
    id:'match', name:'Match Play', desc:'Hoyo por hoyo — quien gana más hoyos',
    campos:[
      {key:'tipo',label:'¿Cómo juegan?',tipo:'select',opciones:['Por 9 hoyos','Ronda completa']},
      {key:'front',label:'Front 9 (MXN)',tipo:'number',placeholder:'Ej: 500',condicional:'Por 9 hoyos'},
      {key:'back',label:'Back 9 (MXN)',tipo:'number',placeholder:'Ej: 500',condicional:'Por 9 hoyos'},
      {key:'monto',label:'Ronda completa (MXN)',tipo:'number',placeholder:'Ej: 2000',condicional:'Ronda completa'}
    ]
  },
  {
    id:'nassau', name:'Nassau', desc:'Front 9, Back 9 y Total — 3 apuestas en 1',
    campos:[
      {key:'front',label:'Front 9 (MXN)',tipo:'number',placeholder:'Ej: 200'},
      {key:'back',label:'Back 9 (MXN)',tipo:'number',placeholder:'Ej: 200'},
      {key:'total',label:'Total (MXN)',tipo:'number',placeholder:'Ej: 400'},
      {key:'presion',label:'¿Juegan presiones?',tipo:'select',opciones:['No','Sí']},
      {key:'presion_monto',label:'Valor presión (MXN)',tipo:'number',placeholder:'Ej: 100',condicional:'Sí'}
    ]
  },
  {
    id:'skins', name:'Skins', desc:'Cada hoyo vale dinero — se acumula si hay empate',
    campos:[
      {key:'monto',label:'Valor por skin (MXN)',tipo:'number',placeholder:'Ej: 100'},
      {key:'acumula',label:'¿Se acumula en empate?',tipo:'select',opciones:['Sí','No']}
    ]
  },
  {
    id:'stableford', name:'Stableford', desc:'Puntos por hoyo vs par',
    campos:[{key:'monto',label:'Valor por punto (MXN)',tipo:'number',placeholder:'Ej: 50'}]
  },
  {
    id:'wolf', name:'Wolf', desc:'El lobo elige pareja cada hoyo o juega solo',
    campos:[
      {key:'monto',label:'Valor por hoyo (MXN)',tipo:'number',placeholder:'Ej: 100'},
      {key:'doble',label:'¿Doble si el lobo juega solo?',tipo:'select',opciones:['Sí','No']}
    ]
  },
  {
    id:'vegas', name:'Vegas', desc:'Parejas — se combinan los scores como número',
    campos:[{key:'monto',label:'Valor por punto (MXN)',tipo:'number',placeholder:'Ej: 50'}]
  },
  {
    id:'bingo', name:'Bingo Bango Bongo', desc:'3 puntos por hoyo: primero en green, más cerca, primero en embolsar',
    campos:[{key:'monto',label:'Valor por punto (MXN)',tipo:'number',placeholder:'Ej: 50'}]
  },
  {
    id:'snake', name:'Snake', desc:'Quien tres putts carga la serpiente — paga al final',
    campos:[{key:'monto',label:'Valor de la serpiente (MXN)',tipo:'number',placeholder:'Ej: 200'}]
  },
  {
    id:'greenies', name:'Greenies', desc:'Premio al más cerca del pin en par 3 + ganar el hoyo',
    campos:[{key:'monto',label:'Valor por greenie (MXN)',tipo:'number',placeholder:'Ej: 100'}]
  },
  {
    id:'sandies', name:'Sandies', desc:'Salir de bunker y hacer par o mejor',
    campos:[{key:'monto',label:'Valor por sandy (MXN)',tipo:'number',placeholder:'Ej: 100'}]
  },
  {
    id:'birdies_ap', name:'Birdies', desc:'Apuesta separada — todos pagan al que hace birdie',
    campos:[{key:'monto',label:'Valor por birdie (MXN)',tipo:'number',placeholder:'Ej: 100'}]
  },
  {
    id:'chippy', name:'Chippy', desc:'Premio por chipear al hoyo',
    campos:[{key:'monto',label:'Valor por chippy (MXN)',tipo:'number',placeholder:'Ej: 100'}]
  },
  {
    id:'pots', name:'Pots', desc:'Bote acumulado que gana el mejor score',
    campos:[
      {key:'monto_entrada',label:'Entrada por jugador (MXN)',tipo:'number',placeholder:'Ej: 200'},
      {key:'frecuencia',label:'¿Cada cuántos hoyos?',tipo:'select',opciones:['Por ronda','Por 9 hoyos']}
    ]
  },
  {
    id:'closest', name:'Closest to Pin', desc:'Más cerca del pin en par 3',
    campos:[
      {key:'monto',label:'Valor (MXN)',tipo:'number',placeholder:'Ej: 100'},
      {key:'hoyos',label:'¿En qué par 3s? (ej: 3,7,11,16)',tipo:'text',placeholder:'3,7,11,16'}
    ]
  },
  {
    id:'longest', name:'Longest Drive', desc:'Drive más largo',
    campos:[
      {key:'monto',label:'Valor (MXN)',tipo:'number',placeholder:'Ej: 100'},
      {key:'hoyo',label:'¿En qué hoyo?',tipo:'number',placeholder:'Ej: 18'}
    ]
  },
  {
    id:'fourball', name:'Fourball', desc:'Mejor score del equipo por hoyo',
    campos:[{key:'monto',label:'Valor por hoyo (MXN)',tipo:'number',placeholder:'Ej: 100'}]
  },
  {
    id:'alternate', name:'Alternate Shot', desc:'Foursomes — se alternan golpes',
    campos:[{key:'monto',label:'Valor total (MXN)',tipo:'number',placeholder:'Ej: 500'}]
  },
  {
    id:'scramble', name:'Scramble', desc:'Todos juegan desde el mejor tiro',
    campos:[{key:'monto',label:'Valor total (MXN)',tipo:'number',placeholder:'Ej: 300'}]
  },
  {
    id:'presiones', name:'Presiones (independiente)', desc:'Apuesta extra cuando vas perdiendo 2+',
    campos:[{key:'monto',label:'Valor por presión (MXN)',tipo:'number',placeholder:'Ej: 50'}]
  }
];

export const UNIDADES_LIST = [
  {id:'birdie',icon:'🐦',name:'Birdie',auto:true},
  {id:'eagle',icon:'🦅',name:'Eagle',auto:true},
  {id:'sandy',icon:'🏖️',name:'Sandy Par',auto:false},
  {id:'holeout',icon:'🎯',name:'Hole Out (chip in)',auto:false},
  {id:'holeinone',icon:'💫',name:'Hole in One',auto:true}
];
