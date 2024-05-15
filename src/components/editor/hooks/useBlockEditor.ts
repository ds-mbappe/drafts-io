import { useSidebar } from './useSidebar';
import { useEditor } from '@tiptap/react';
import { ExtensionKit } from '../extensions/extension-kit';

// declare global {
//   interface Window {
//     editor: Editor | null
//   }
// }

export const useBlockEditor = () => {
  const leftSidebar = useSidebar()
  
  const initialContent = "<p>Drafts is a notes taking app with really cool features ! Try and hit the '/' key or try the markdown shortcuts, which make it easy to format the text while typing.</p><p>Consider this page as your 'playground'; here you can test all features and when you're done, you can go ahead and tap the burger menu to your left to create new documents, or import existing ones.</p><p>To test that, start a new line and type # followed by a space to get aheading. Try #, ##, ###, ####, #####, ###### for different levels. Those conventions are called input rules in tiptap. Some of them are enabled by default. Try '>' for blockquotes, *, - or + for bullet lists, or ~~tildes~~ to strike text. These are some of the multiple 'cheat codes' you can have, but we'll let you explore to find out all of them.</p><p>Happy texting !</p>"

  const editor = useEditor({
    autofocus: true,
    extensions: [
      ...ExtensionKit(),
    ],
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full',
      },
    },
  });

  const characterCount = editor?.storage.characterCount || { characters: () => 0, words: () => 0 }

  // window.editor = editor

  return { editor, characterCount, leftSidebar, initialContent }
}