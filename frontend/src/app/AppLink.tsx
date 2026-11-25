import type { MouseEvent, PropsWithChildren } from 'react'

interface AppLinkProps extends PropsWithChildren {
  href: string
  navigate: (href: string) => void
  className?: string
  title?: string
  'aria-current'?: 'page' | undefined
}

export function AppLink({
  href,
  navigate,
  children,
  className,
  title,
  'aria-current': ariaCurrent,
}: AppLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    navigate(href)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      title={title}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  )
}
