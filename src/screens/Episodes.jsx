import { useNavigate } from 'react-router-dom'
import {
  Button,
  Icon,
  InputSelect,
  Text,
} from '@pearson-ux/nebula-design-system/alpha'
import {
  arrowRightOutlinedRegular,
  lockOutlinedRegular,
  playOutlinedRegular,
} from '@pearson-ux/nebula-design-system/icons'
import episode from '../data/episode.json'
import { GlassScreen } from '../components/GlassScreen.jsx'

export default function Episodes({ sessionMinutes, onSessionMinutesChange }) {
  const navigate = useNavigate()
  const session = episode.sessionLength

  return (
    <GlassScreen label={`${episode.game} episodes`} onBack={() => navigate('/')}>
      <div className="flex flex-col items-center gap-x3">
        <Text as="h1" variant="display-2-med" className="text-text-primary">
          {episode.game}
        </Text>
        <Text variant="body-large" className="max-w-[calc(var(--spacing-x50)*3)] text-text-secondary">
          {episode.desc}
        </Text>
      </div>

      <ol className="m-x0 flex list-none flex-col gap-x3 p-x0 text-left">
        {episode.episodes.map((ep) => (
          <li key={ep.title} className="flex items-center gap-x5">
            <span
              className={`grid size-x10 shrink-0 place-items-center rounded-circular border ${
                ep.playable ? 'border-interactive-border-default' : 'border-non-interactive-border-regular opacity-60'
              }`}
            >
              <Icon svg={ep.playable ? playOutlinedRegular : lockOutlinedRegular} size={16} color="primary" aria-hidden />
            </span>
            <Text
              as="span"
              variant={ep.playable ? 'body-large-bold' : 'body-large'}
              className={ep.playable ? 'text-text-primary' : 'text-text-secondary'}
            >
              {ep.title}
              {!ep.playable && <span className="sr-only"> (locked)</span>}
            </Text>
          </li>
        ))}
      </ol>

      {/* Choose a session length, then start: stacked and centred, label included. */}
      <div className="flex flex-col items-center gap-x6">
        <div className="w-[calc(var(--spacing-x50)+var(--spacing-x30))] max-w-full text-center [&_label]:text-center">
          <InputSelect
            label={session.label}
            value={sessionMinutes ?? 'none'}
            onChange={(e) => onSessionMinutesChange(e.target.value === 'none' ? null : Number(e.target.value))}
          >
            {session.options.map((o) => (
              <option key={o.label} value={o.minutes ?? 'none'}>
                {o.label}
              </option>
            ))}
          </InputSelect>
        </div>
        <Button
          type="primary"
          trailingIcon={<Icon svg={arrowRightOutlinedRegular} />}
          onClick={() => navigate('/midnight-train/play')}
        >
          {episode.start}
        </Button>
      </div>
    </GlassScreen>
  )
}
