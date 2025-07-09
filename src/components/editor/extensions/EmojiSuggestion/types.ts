
export interface Command {
  name: string
}

export interface EmojiListProps {
  command: (command: Command) => void
  items: any[]
}