import { NodeViewWrapperProps, NodeViewWrapper, NodePos, Editor } from "@tiptap/react"
import { useCallback, useEffect, useRef, useState } from "react"
import OpenAI from "openai"
import { Button, Input, Textarea } from "@nextui-org/react"
import { CircleArrowUpIcon, SparklesIcon } from "lucide-react"

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
            content: "When you give an answer, you don't use any form of courtesy or politeness."
          },
          {
            role: "user",
            content: payload.text
          },
        ],
        model: "gpt-4o",
        stream: true,
      })

      let content = " "

      for await (const chunk of completion) {
        content += chunk.choices[0]?.delta?.content || ""
        // let position = getPos()
        // let chunkContent = chunk.choices[0]?.delta?.content || ""

        // if (content?.length && content !== "\n") {
        //   let newContent = chunkContent.replace(content, "")
        //   if (newContent === '<h') {
        //     editor.commands.enter()
        //     editor.chain().focus().setHeading({ level: 1 }).run()
        //     const transaction = editor.state.tr.insertText(newContent)
        //     editor.view.dispatch(transaction)
        //   } else if (newContent === '<p') {
        //     editor.commands.enter()
        //     const transaction = editor.state.tr.insertText(newContent)
        //     editor.view.dispatch(transaction)
        //   } else if (newContent === '<br') {
        //     editor.commands.enter()
        //   } else if (newContent?.endsWith("\n")) {
        //     const transaction = editor.state.tr.insertText(newContent)
        //     editor.view.dispatch(transaction)
        //     editor.commands.enter()
        //   } else {
        //     const transaction = editor.state.tr.insertText(newContent)
        //     editor.view.dispatch(transaction)
        //   }
        //   editor.commands.scrollIntoView()
        //   console.log(newContent)
        //   console.log(newContent?.endsWith("\n"))
        // }
      }

      const lines = content.split('\n')
      lines.forEach(line => {
        let newLine = line.trimStart()
        // console.log(newLine)
        if (newLine.startsWith('- ')) {
          editor.commands.enter()
          editor.chain().focus().insertContent(newLine.substring(2)).toggleBulletList().run()
        } else if (newLine.match(/^\d+\. /)) {
          editor.commands.enter()
          editor.chain().focus().insertContent(newLine.replace(/^\d+\. /, '')).toggleOrderedList().run()
        } else {
          editor.commands.enter()
          editor.chain().focus().insertContent(newLine).run()
        }
      })
      setIsFetching(false)
      setPreviewText(content)
    } catch (error) {
      setIsFetching(false)
      console.log(error)
    }
  }, [data, editor, getPos, openai.chat.completions])

  const insert = useCallback((message: String | null) => {
    const from = getPos()
    const to = from + node.nodeSize

    editor.chain().focus().insertContentAt({ from, to }, message).run()
  }, [editor, getPos, node.nodeSize])

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
      <Textarea
        id="ai-input"
        ref={inputRef}
        minRows={1}
        maxRows={10}
        value={data.text}
        variant="bordered"
        className="lg:!w-3/4 my-4"
        label={"Ask something to the AI"}
        onChange={onInputChange}
        startContent={
          <div className="flex items-center justify-center w-10 h-10">
            <SparklesIcon />
          </div>
        }
        endContent={
          <Button
            isIconOnly={true}
            color="primary"
            variant="light"
            isDisabled={!data.text}
            isLoading={isFetching}
            onClick={generateAnswer}
          >
            <CircleArrowUpIcon />
          </Button>
        }
      />
    </NodeViewWrapper>
  )
}