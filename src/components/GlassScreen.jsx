import { Button, Card, Icon } from '@pearson-ux/nebula-design-system/alpha'
import { arrowLeftOutlinedRegular } from '@pearson-ux/nebula-design-system/icons'
import trainImg from '../assets/train.jpg'
import { useRef } from 'react'
import { useScrollingClass } from './useScrollingClass.js'

/**
 * Episode and end screens: blurred scene art behind one centred glass card
 * (Figma 7:32304 / 40:11364). The card is the only surface, so it is the
 * primary glass pane.
 */
export function GlassScreen({ label, onBack, children }) {
  const screenRef = useRef(null)
  const cardRef = useRef(null)
  useScrollingClass(screenRef)
  useScrollingClass(cardRef)
  return (
    <section
      ref={screenRef}
      aria-label={label}
      className="scroll-quiet game-root fixed inset-0 flex flex-col items-center overflow-auto px-x4"
    >
      {/* Clipped layer: the blurred art overhangs the screen, which would otherwise make the page scrollable. */}
      <div className="fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="scene-bg" style={{ '--scene-img': `url(${trainImg})` }} />
      </div>
      <div className="glass-area relative flex min-h-0 w-full flex-1 items-center justify-center py-x8">
        <Card
          variant="primaryGlassElevation"
          // Figma episode card: brand-1 navy at 75% over the blurred scene.
          ref={cardRef}
          className="scroll-quiet glass-card relative !rounded-x6 !bg-core-always-brand-1/75 backdrop-blur-xl flex flex-col items-center gap-x8 overflow-auto px-x6 py-x14 text-center"
        >
          {/* The end screen has its own Back to Game Library button, so it passes no onBack. */}
          {onBack && (
            <div className="absolute left-x5 top-x5">
              <Button type="tertiary" size="small" leadingIcon={<Icon svg={arrowLeftOutlinedRegular} />} onClick={onBack}>
                Game library
              </Button>
            </div>
          )}
          {children}
        </Card>
      </div>
    </section>
  )
}
