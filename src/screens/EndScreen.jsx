import { useNavigate } from 'react-router-dom'
import { Button, Card, Metric, Text } from '@pearson-ux/nebula-design-system/alpha'
import episode from '../data/episode.json'
import { GlassScreen } from '../components/GlassScreen.jsx'
import { characterType } from '../game/characterType.js'
import { cond } from '../game/engine.js'

export default function EndScreen({ run }) {
  const navigate = useNavigate()
  const { end, characterTypes } = episode
  const [name, desc] = characterTypes[characterType(run.results)]
  const total = run.results.length
  const right = run.results.filter((x) => x.ok).length
  const sure = run.results.filter((x) => x.conf === 'Sure').length
  const hasTicket = end.hasTicketIf.some((c) => cond(c, run.flags))

  return (
    <GlassScreen label="Episode complete" onBack={() => navigate('/')}>
      <div className="flex flex-col items-center gap-x2">
        <Text variant="label-regular" className="text-text-secondary">
          {end.eyebrow}
        </Text>
        <Text as="h1" variant="display-2-med" className="text-text-primary">
          {end.title}
        </Text>
      </div>

      <Card variant="secondaryGlassOnly" border className="flex max-w-[calc(var(--spacing-x50)*3)] flex-col gap-x1 px-x7 py-x6">
        <Text variant="label-small-bold" className="uppercase tracking-wide text-text-secondary">
          {end.characterLabel}
        </Text>
        <Text as="h2" variant="heading-h2-med" className="text-text-primary">
          {name}
        </Text>
        <Text variant="body-regular" className="text-text-secondary">
          {desc}
        </Text>
      </Card>

      <div className="flex flex-wrap justify-center gap-x3">
        {[
          [`${right} of ${total}`, 'checks passed'],
          [`${sure} of ${total}`, 'answered with “Sure”'],
          [`+${total}`, end.progressLabel],
        ].map(([value, title]) => (
          <Card key={title} variant="secondaryFlat" border className="min-w-x40 max-w-x60 rounded-x3 p-x4">
            <Metric title={title} value={value} size="x-small" />
          </Card>
        ))}
      </div>

      <Text variant="body-regular" className="italic text-text-secondary">
        {hasTicket ? end.teaserWithTicket : end.teaserNoTicket}
      </Text>

      <div className="flex flex-wrap justify-center gap-x3">
        <Button type="secondary" onClick={() => navigate('/')}>
          Back to Game Library
        </Button>
        <Button type="primary" disabled>
          Next stop (coming soon)
        </Button>
      </div>
    </GlassScreen>
  )
}
