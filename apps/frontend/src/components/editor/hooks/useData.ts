import { Node } from '@tiptap/pm/model'
import { Editor } from '@tiptap/core'
import { useCallback, useState } from 'react'
import { NodeSelection } from '@tiptap/pm/state'

export const useData = () => {
  const [currentNode, setCurrentNode] = useState<Node | null>(null)
  const [currentNodePos, setCurrentNodePos] = useState<number>(-1)

  const handleNodeChange = useCallback(
    ({ node, editor, pos }: {node: Node | null, editor: Editor, pos: number}) => {
      if (node) {
        setCurrentNode(node)
      }

      setCurrentNodePos(pos)
    },
    [setCurrentNodePos, setCurrentNode],
  )

  return {
    currentNode,
    currentNodePos,
    setCurrentNode,
    setCurrentNodePos,
    handleNodeChange,
  }
}