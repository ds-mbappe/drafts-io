import { NodeViewWrapperProps, NodeViewWrapper, NodePos } from "@tiptap/react"
import { useCallback, useEffect, useRef, useState } from "react"
import OpenAI from "openai"
import { Button } from "@/components/ui/button"

export interface DataProps {
  text: string
  language?: string
}

export const AiWriterView = ({ editor, node, getPos, deleteNode }: NodeViewWrapperProps) => {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const [data, setData] = useState<DataProps>({
    text: '',
    language: undefined,
  })
  const [previewText, setPreviewText] = useState<String | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const inputRef = useRef(null)

  const generateAnswer = useCallback(async() => {
    const { text: dataText, language } = data

    if (!data.text) {
      console.log('Enter a description')
    }

    setIsFetching(true)

    const payload = {
      text: dataText,
      language,
    }
    
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a generative content editor."
          },
          // {
          //   role: "system",
          //   content: "You can construct entire content about almost anything the user asks you. Your particulary is that you use different html tags to wrap your answers. You can also emphasize some parts of your answers using attricutes like <strong>, <em> and <i> (the list is non exhaustive); you can also integrate tags to color some text in your answers. You can integrate whatever html tag you seem appropriate as long as you think it helps."
          // },
          // {
          //   role: "system",
          //   content: "You cannot use the p tag"
          // },
          // {
          //   role: "system",
          //   content: "You can use the following tags to structure your content: h1 to h6 tags (headings), strong (emphasize), em (italic), i (italic), u (underline), br (to go to next line), hr (for separators). This list is non exhaustive, so you can add in any tag you think appropriate (except for the p tag)"
          // },
          // {
          //   role: "system",
          //   content: "Don't use the p tag"
          // },
          {
            role: "user",
            content: payload.text
          },
        ],
        model: "gpt-3.5-turbo",
        stream: true,
      })
      // setPreviewText(completion.choices[0]?.message?.content)
      setIsFetching(false)

      // console.log(completion.choices[0]?.message?.content)
      let content = " "
      // editor.chain().insertContentAt(getPos(), {
      //   type: "paragraph",
      //   content: [
      //     {
      //       text: " ",
      //       type: "text"
      //     }
      //   ]
      // }).run()

      for await (const chunk of completion) {
        let position = getPos()
        content += chunk.choices[0]?.delta?.content || ""

        if (content?.length) {
          // editor.chain().setImageBlockLoading({ src: url, progress: 0 }).deleteRange({ from: getPos(), to: getPos() }).focus().run();
          // editor.chain().setParagraph().deleteRange({ from: position, to: position }).focus().run()
          // editor.chain().insertContentAt(position, content).focus().run()
          // editor.commands.setNodeSelection(position)
          // editor.commands.deleteSelection()
          // editor.commands.deleteNode(editor?.view.state.selection.$head.parent)
          console.log(content)
        }
      }
      // editor.commands.insertContentAt(getPos(), content)

    } catch (error) {
      setIsFetching(false)
      console.log(error)
    }
  }, [data])

  const insert = useCallback((message: String | null) => {
    const from = getPos()
    const to = from + node.nodeSize

    editor.chain().focus().insertContentAt({ from, to }, message).run()
  }, [editor, previewText, getPos, node.nodeSize])

  const discard = useCallback(() => {
    deleteNode()
  }, [deleteNode])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prevData => ({ ...prevData, text: e.target.value }))
  }, [])

  const onUndoClick = useCallback(() => {
    setData(prevData => ({ ...prevData, tone: undefined }))
  }, [])

  return (
    <NodeViewWrapper data-drag-handle>
      <div className="flex flex-col py-3">
        <div className=" flex gap-2 border border-gray-400 shadow-lg rounded-[8px] px-2.5 py-2.5">
          <div className="w-full flex items-center min-h-full">
            <input
              ref={inputRef} 
              required
              value={data.text}
              autoFocus={true}
              onChange={onInputChange}
              className="w-full h-9 text-muted-foreground block resize-none p-0 overflow-hidden"
              placeholder="Ask something to the AI"
            />
          </div>

          <Button disabled={!data.text} onClick={generateAnswer}>
            Search
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}