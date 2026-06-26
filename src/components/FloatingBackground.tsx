import { Cross, Plus, Activity, HeartPulse, Syringe } from 'lucide-react'
import type { CSSProperties } from 'react'

const ITEMS = [
  { Icon: Cross,      top: '5%',  left: '7%',  size: 52, dur: 12, delay: 0,   rot: 0  },
  { Icon: Cross,      top: '63%', left: '80%', size: 74, dur: 15, delay: 1.5, rot: 15 },
  { Icon: Syringe,    top: '22%', left: '-2%', size: 38, dur: 14, delay: 1,   rot: 45 },
  { Icon: Plus,       top: '33%', left: '90%', size: 26, dur: 9,  delay: 0.8, rot: 0  },
  { Icon: Activity,   top: '83%', left: '9%',  size: 40, dur: 13, delay: 2.2, rot: 0  },
  { Icon: HeartPulse, top: '49%', left: '44%', size: 30, dur: 11, delay: 3,   rot: 0  },
]

export function FloatingBackground() {
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {ITEMS.map(({ Icon, top, left, size, dur, delay, rot }, i) => {
        const style = {
          top,
          left,
          width: size,
          height: size,
          transform: `rotate(${rot}deg)`,
          '--dur': `${dur}s`,
          '--delay': `${delay}s`,
          '--rot': `${rot}deg`,
        } as CSSProperties
        return (
          <Icon
            key={i}
            style={style}
            className="absolute text-primary-500/[0.15] dark:text-primary-400/[0.12] animate-floaty"
          />
        )
      })}
    </div>
  )
}
