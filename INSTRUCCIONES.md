# Bellavista Golf App — Instrucciones de instalación

## Lo que vas a necesitar (todo gratis)
- Cuenta en GitHub: github.com
- Cuenta en Supabase: supabase.com  
- Cuenta en Vercel: vercel.com

---

## PASO 1 — Crear la base de datos en Supabase

1. Entra a supabase.com y crea una cuenta gratuita
2. Crea un nuevo proyecto (ponle "bellavista-golf")
3. Espera ~2 minutos a que se cree
4. Ve a la sección "SQL Editor" en el menú izquierdo
5. Copia TODO el contenido del archivo `supabase_schema.sql` y pégalo ahí
6. Dale click en "Run"
7. Guarda estos dos datos (los necesitas en el Paso 3):
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > Project API keys > anon public

---

## PASO 2 — Subir el código a GitHub

1. Entra a github.com y crea una cuenta gratuita
2. Crea un nuevo repositorio llamado "bellavista-golf" (que sea público)
3. Sube todos los archivos de esta carpeta a ese repositorio
   - Opción fácil: arrastra y suelta los archivos en la interfaz de GitHub

---

## PASO 3 — Deployar en Vercel

1. Entra a vercel.com y crea una cuenta (puedes entrar con tu cuenta de GitHub)
2. Click en "New Project"
3. Selecciona tu repositorio "bellavista-golf"
4. Antes de darle Deploy, ve a "Environment Variables" y agrega:
   - NEXT_PUBLIC_SUPABASE_URL = (tu Project URL del Paso 1)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = (tu Anon Key del Paso 1)
5. Click en "Deploy"
6. Vercel te da una URL tipo: bellavista-golf.vercel.app

---

## PASO 4 — ¡Listo!

Tu app está live. Manda el link a todos los grupos del Bellavista:
- bellavista-golf.vercel.app

Cada grupo entra, crea su liga con su nombre, y obtiene su propio link:
- bellavista-golf.vercel.app/liga/los-martes
- bellavista-golf.vercel.app/liga/team-aguila
- bellavista-golf.vercel.app/liga/jueves-7am

Cada liga es 100% independiente. Los datos se guardan para siempre.

---

## Dominio personalizado (opcional)

Si quieres que el link sea algo como "bellavistagolf.app" en vez de vercel.app:
1. Compra el dominio en namecheap.com o godaddy.com (~$12 USD/año)
2. En Vercel > Settings > Domains, agrega tu dominio
3. Sigue las instrucciones de Vercel para conectarlo

---

## ¿Problemas?

Mándale este archivo a cualquier persona técnica y con esto tienen todo lo que necesitan.
