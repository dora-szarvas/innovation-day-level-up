import { useNavigate } from 'react-router-dom'
import { Button, Card, Divider, Icon, Text } from '@pearson-ux/nebula-design-system/alpha'
import {
  arrowRightOutlinedRegular,
  binocularsFilledRegular,
  crownFilledRegular,
  lightningFilledRegular,
  magnifyingGlassFilledRegular,
  sunFilledRegular,
} from '@pearson-ux/nebula-design-system/icons'
import episode from '../data/episode.json'
import { GlassScreen } from '../components/GlassScreen.jsx'
import { characterType } from '../game/characterType.js'
import { cond } from '../game/engine.js'

// Icon and accent hue per character type (Figma 100:14318). The Detective has no design yet.
const CHARACTER_ICONS = {
  oracle: [crownFilledRegular, 'bg-accent-16-cyan-default-background', '!text-accent-16-cyan-default-icon'],
  improviser: [lightningFilledRegular, 'bg-accent-08-orange-red-default-background', '!text-accent-08-orange-red-default-icon'],
  genius: [sunFilledRegular, 'bg-accent-05-fuchsia-default-background', '!text-accent-05-fuchsia-default-icon'],
  explorer: [binocularsFilledRegular, 'bg-accent-13-green-default-background', '!text-accent-13-green-default-icon'],
  detective: [magnifyingGlassFilledRegular, 'bg-accent-01-amethyst-default-background', '!text-accent-01-amethyst-default-icon'],
}

// Stat and character tiles: the brand-03 tint the design uses on the glass card.
const TILE = '!bg-core-always-brand-3/8 border border-core-always-brand-3/30'

export default function EndScreen({ run }) {
  const navigate = useNavigate()
  const { end, characterTypes } = episode
  const type = characterType(run.results)
  const [name, desc] = characterTypes[type]
  const [glyph, tileBg, iconColor] = CHARACTER_ICONS[type]
  const total = run.results.length
  const right = run.results.filter((x) => x.ok).length
  const sure = run.results.filter((x) => x.conf === 'Sure').length
  const hasTicket = end.hasTicketIf.some((c) => cond(c, run.flags))

  return (
    <GlassScreen label="Episode complete">
      <div className="flex flex-col items-center gap-x14">
        <div className="flex w-full max-w-[calc(var(--spacing-x50)*4)] flex-col items-center gap-x2">
          <Text variant="body-large" className="text-text-primary">
            {end.eyebrow}
          </Text>
          <Text as="h1" variant="display-2-med" className="text-text-primary">
            {end.title}
          </Text>
        </div>

        <div className="flex flex-col items-center gap-x8">
          <div className="flex flex-wrap justify-center gap-x3">
            {[
              [end.proficiency.value, end.proficiency.label],
              [`${right} of ${total}`, 'checks passed'],
              [`${sure} of ${total}`, 'answered with “Sure”'],
            ].map(([value, label]) => (
              <Card key={label} variant="secondaryFlat" className={`${TILE} flex flex-col items-center gap-x1 rounded-x3 px-x4 py-x3`}>
                <Text variant="heading-h3-bold" as="p" className="text-text-primary">
                  {value}
                </Text>
                <Text variant="label-small" className="text-text-secondary">
                  {label}
                </Text>
              </Card>
            ))}
          </div>

          <Divider className="w-full" />

          <Card variant="secondaryFlat" className={`${TILE} flex flex-col items-center gap-x3 rounded-x4 px-x7 py-x5`}>
            <span className={`flex rounded-x2 p-x1 ${tileBg}`} aria-hidden="true">
              <Icon svg={glyph} size={32} className={iconColor} />
            </span>
            <div className="flex flex-col items-center gap-x1">
              <Text variant="label-small" className="uppercase text-text-brand-03">
                {end.characterLabel}
              </Text>
              <Text as="h2" variant="heading-h1-med" className="text-text-primary">
                {name}
              </Text>
              <Text variant="body-regular" className="text-text-secondary">
                {desc}
              </Text>
            </div>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-x8">
          <Text variant="body-regular" className="text-text-secondary">
            {hasTicket ? end.teaserWithTicket : end.teaserNoTicket}
          </Text>
          <div className="flex flex-wrap justify-center gap-x3">
            <Button type="secondary" onClick={() => navigate('/')}>
              Back to Game Library
            </Button>
            <Button type="primary" disabled trailingIcon={<Icon svg={arrowRightOutlinedRegular} />}>
              Next stop (coming soon)
            </Button>
          </div>
        </div>
      </div>
    </GlassScreen>
  )
}
