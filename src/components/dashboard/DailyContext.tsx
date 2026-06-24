const messages: Record<number, [string, string, string]> = {
  1: ['Semana nueva en pabellón. Buen momento para repasar técnica.', 'Tarde operatoria. Precisión y foco.', 'Noche de guardia. Mantén la calma y el protocolo.'],
  2: ['Martes de cirugía electiva. Tómate el tiempo que necesitas.', 'La técnica es rutina repetida con intención.', 'Guardia activa. Confía en tu entrenamiento.'],
  3: ['A mitad de semana. El pabellón te espera.', 'Cada incisión es una decisión. Piensa antes de actuar.', 'La noche del cirujano es silenciosa y exigente.'],
  4: ['Casi al fin de semana. Mantén el ritmo.', 'Tarde de cirugía. Lleva el caso con calma.', 'Guardia de jueves. Tú puedes con esto.'],
  5: ['Viernes de pabellón. Cierra la semana con buen trabajo.', 'Última tarde operatoria de la semana. Concéntrate.', 'Guardia de fin de semana. El equipo confía en ti.'],
  6: ['Sábado en pabellón. La dedicación no tiene días libres.', 'Tarde del sábado. Buen momento para registrar tus cirugías.', 'Guardia nocturna. Descansa cuando puedas.'],
  0: ['Domingo de guardia. Tu presencia es lo que importa.', 'Tarde dominical. Repasa los casos de la semana.', 'Madrugada del cirujano. Cada caso es una oportunidad de aprender.'],
}

function getShift(): number {
  const hour = new Date().getHours()
  if (hour < 14) return 0
  if (hour < 20) return 1
  return 2
}

export function DailyContext() {
  const day = new Date().getDay()
  const shift = getShift()
  const message = messages[day]?.[shift] ?? 'Bienvenido a QuiroLog.'

  return (
    <div className="px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-sm text-primary-800 dark:text-primary-200 italic">
      {message}
    </div>
  )
}
