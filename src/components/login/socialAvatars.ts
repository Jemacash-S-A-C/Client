const createAvatar = ({
  background,
  hair,
  shirt,
  skin,
}: {
  background: [string, string]
  hair: string
  shirt: string
  skin: string
}) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stop-color="${background[0]}" />
          <stop offset="1" stop-color="${background[1]}" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill="url(#bg)" />
      <circle cx="32" cy="23" r="11.5" fill="${skin}" />
      <path d="M18 58c1.8-11.2 9-17 14-17s12.2 5.8 14 17H18Z" fill="${shirt}" />
      <path d="M20 24c0-8 4.8-14 12-14 7.5 0 12 5.8 12 13.2 0 .8-.1 1.5-.2 2.2-2.4-2-5.3-3.2-8.5-3.2-5.4 0-10 3.2-12.1 7.8-2-.9-3.2-3.1-3.2-6Z" fill="${hair}" />
      <circle cx="27.5" cy="24.5" r="1.2" fill="#2B211E" />
      <circle cx="36.5" cy="24.5" r="1.2" fill="#2B211E" />
      <path d="M28 30.4c1.4 1.2 3 1.8 4 1.8s2.6-.6 4-1.8" stroke="#8C5C49" stroke-linecap="round" stroke-width="1.8" />
    </svg>
  `)}`

export const socialAvatars = [
  createAvatar({
    background: ['#F6D8BE', '#ECA171'],
    hair: '#6B3D29',
    shirt: '#E0875B',
    skin: '#F4C7A1',
  }),
  createAvatar({
    background: ['#D8E4FB', '#82A9E7'],
    hair: '#2E3A59',
    shirt: '#6B8FDD',
    skin: '#F0C7A5',
  }),
  createAvatar({
    background: ['#DCEEDB', '#92C89B'],
    hair: '#35593B',
    shirt: '#5EA06A',
    skin: '#E7B792',
  }),
]
