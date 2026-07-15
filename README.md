# Pomodoro App

Pomodoro App es una app de escritorio para organizar sesiones de enfoque, descanso y seguimiento de productividad.

La app está pensada para estudiar, programar y trabajar con más disciplina usando bloques tipo Pomodoro. Permite elegir modos de enfoque, registrar tareas, guardar historial diario, ver estadísticas semanales, exportar datos a CSV y usar una mini ventana flotante para controlar el temporizador mientras trabajás en otras ventanas.

## Resumen

- Temporizador por bloques de foco y descanso.
- Modos Clásico, Intermedio, Profundo y Ultrafoco.
- Mini ventana flotante siempre visible.
- Tareas por sesión con categorías.
- Historial diario de pomodoros completados.
- Racha de días de uso.
- Estadísticas semanales y hora pico de productividad.
- Exportación de historial a CSV.
- Tema claro y modo oscuro espacial.
- Configuración de sonido, volumen y descanso largo.

## Modos disponibles

- Clásico: 25 min foco + 5 min descanso.
- Intermedio: 40 min foco + 10 min descanso.
- Profundo: 50 min foco + 10 min descanso.
- Ultrafoco: 90 min foco + 20/30 min descanso.

## Uso local

```bash
npm install
npm start
```

## Crear app portable para Windows

```bash
npm run build:win
```

## Crear instalador para Windows

```bash
npm run installer:win
```

El instalador queda en la carpeta `release`.
