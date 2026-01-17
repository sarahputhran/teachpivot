import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LanguageToggleProps = {
  language: string
  onChange: (lang: string) => void
  className?: string
}

export function LanguageToggle({
  language,
  onChange,
  className,
}: LanguageToggleProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-full bg-secondary p-1', className)}>
      <Button
        size="sm"
        variant={language === 'en' ? 'default' : 'ghost'}
        onClick={() => onChange('en')}
      >
        EN
      </Button>
      <Button
        size="sm"
        variant={language === 'hi' ? 'default' : 'ghost'}
        onClick={() => onChange('hi')}
      >
        हिं
      </Button>
    </div>
  )
}
