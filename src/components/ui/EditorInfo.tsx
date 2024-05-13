import { memo } from "react";

export type EditorInfoProps = {
  characters: number
  words: number
}

const EditorInfo = memo(({ characters, words }: EditorInfoProps) => {
  return (
    <div className="flex flex-col items-end">
      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        {words} {words === 1 ? 'word' : 'words'}
      </span>
      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        {characters} {characters === 1 ? 'character' : 'characters'}
      </span>
    </div>
  )
})

EditorInfo.displayName = 'EditorInfo'

export default EditorInfo