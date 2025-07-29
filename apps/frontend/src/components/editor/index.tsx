"use client";

import 'katex/dist/katex.min.css';
import React, { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { getLocalStorageWithExpiry, setLocalStorageWithExpiry } from "@/app/_helpers/storage";
import { EditorContent } from "@tiptap/react";
import EditorToolbar from "./toolbars/EditorToolbar";
import { NextSessionContext } from '@/contexts/SessionContext';
import CommentBubble from '../pannels/CommentBubble';
import { cn } from '@heroui/theme';
import * as Y from "yjs"
import { WebsocketProvider } from 'y-websocket';
import { getRandomHexColor } from '@/lib/utils';

const BlockEditor = forwardRef(({
  doc,
  editable,
  autoFocus,
  containerRef,
  debouncedUpdates,
}: {
  doc?: any,
  editable: boolean,
  autoFocus: boolean,
  debouncedUpdates: Function,
  containerRef?: React.RefObject<HTMLElement>,
}, ref) => {
  // const menuContainerRef = useRef(null);
  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const tokenRef = useRef<string | null>(null);
  // const containerRef = useRef<HTMLDivElement>(null);
  
  const { session } = useContext(NextSessionContext);
  const user = session?.user;
  const userID = session?.user?.id;

  const [localDoc, setLocalDoc] = useState(() => {
    const savedDoc = getLocalStorageWithExpiry('editor-document');
    return savedDoc || {
      content: '',
      cover: null,
      title: 'New Document',
    };
  });
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)

  const getRelativePosition = (event: MouseEvent, containerRef: HTMLElement | null) => {
    if (!containerRef) {
      return { x: event.clientX, y: event.clientY };
    }

    const rect = containerRef.getBoundingClientRect();
    
    return {
      x: event.clientX - rect.left + containerRef.scrollLeft,
      y: event.clientY - rect.top + containerRef.scrollTop,
      containerWidth: rect.width,
      containerHeight: rect.height,
      scrollLeft: containerRef.scrollLeft,
      scrollTop: containerRef.scrollTop
    };
  };

  const { editor } = useBlockEditor({
    provider,
    doc: localDoc,
    editable: editable,
    autoFocus: autoFocus,
    debouncedUpdates: () => {
      if (editor) {
        const editorContent = editor.getHTML();
        
        setLocalDoc((oldValue: any) => {
          const updatedDoc = {
            ...oldValue,
            content: editorContent ?? '',
            updatedAt: new Date().toISOString()
          };
  
          if (!doc?.id) {
            setLocalStorageWithExpiry({
              key: 'editor-document',
              value: updatedDoc,
            });
          }
          
          return updatedDoc;
        });
  
        const updatedDoc = {
          ...localDoc,
          content: editorContent ?? '',
          updatedAt: new Date().toISOString()
        }
        const characterCount = editor?.storage.characterCount;
  
        debouncedUpdates({
          updatedDoc,
          characterCount,
        })
      }
    }
  });

  const isDraft = useMemo(() => (!localDoc?.id), [localDoc?.id]);
  const canEditDraft = useMemo(() => {
    return localDoc?.author?.id === userID && editable;
  }, [localDoc?.author?.id, userID, editable]);

  // Function to fetch fresh token
  // const fetchToken = async (): Promise<string> => {
  //   console.log('[EDITOR] Fetching token...')
  //   const res = await fetch("/api/collab/token")
  //   if (!res.ok) {
  //     console.log(res)
  //     throw new Error(`Token fetch failed: ${res.status}`)
  //   }
    
  //   const { token } = await res.json()
  //   console.log('[EDITOR] Token received:', token ? 'Yes' : 'No')
    
  //   if (!token || typeof token !== 'string') {
  //     throw new Error('Invalid token format')
  //   }
    
  //   tokenRef.current = token
  //   return token
  // }

  // Function to create provider with retry logic
  // const createProvider = async (docName: string): Promise<WebsocketProvider> => {
  //   try {
  //     const token = await fetchToken()
      
  //     class AuthenticatedWebSocket extends WebSocket {
  //       constructor(url: string | URL, protocols?: string | string[]) {
  //         const urlString = url.toString()
  //         const urlWithToken = urlString.includes('?') 
  //           ? `${urlString}&token=${encodeURIComponent(token)}`
  //           : `${urlString}?token=${encodeURIComponent(token)}`
          
  //         super(urlWithToken, protocols)
  //       }
  //     }
      
  //     const websocketProvider = new WebsocketProvider(
  //       'wss://websocket-server-drafts-io.onrender.com',
  //       docName,
  //       ydocRef.current,
  //       {
  //         WebSocketPolyfill: AuthenticatedWebSocket,
  //         connect: true,
  //         disableBc: false
  //       }
  //     )

  //     return websocketProvider
  //   } catch (error) {
  //     console.error('[EDITOR] Provider creation failed:', error)
  //     throw error
  //   }
  // }

  // const initializeProvider = useCallback(async (docName: string) => {
  //   try {
  //     if (provider) {
  //       // Clear awareness state before destroying
  //       if (provider.awareness) {
  //         provider.awareness.setLocalState(null)
  //       }
  //       provider.destroy
  //       setProvider(null)
        
  //       // Give a small delay to ensure cleanup is complete
  //       await new Promise(resolve => setTimeout(resolve, 100))
  //     }

  //     const websocketProvider = await createProvider(docName)

  //     setProvider(websocketProvider)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [provider])

  // useEffect(() => {
  //   const docName = doc?.id
  //   const userColor = getRandomHexColor()
    
  //   if (!docName) {
  //     return
  //   }

  //   if (!user) {
  //     return
  //   }

  //   const updateAwarenessField = (event: any) => {
  //     if (!containerRef) return;

  //     const container = containerRef.current;

  //     if (container) {
  //       // const rect = container?.getBoundingClientRect();
  //       const relativePos = getRelativePosition(event, containerRef.current);
  
  //       // const relativeX = event.clientX - rect.left + container?.scrollLeft;
  //       // const relativeY = event.clientY - rect.top + container?.scrollTop;
  
  //       provider?.awareness.setLocalStateField('user', {
  //         name: `${user.firstname} ${user.lastname}`,
  //         color: userColor,
  //         // relativeX: relativeX,
  //         // relativeY: relativeY,
  //         // containerWidth: rect.width,
  //         // containerHeight: rect.height,
  //         // scrollLeft: container?.scrollLeft,
  //         // scrollTop: container?.scrollTop,
  //         relativeX: relativePos.x,
  //         relativeY: relativePos.y,
  //         containerWidth: relativePos.containerWidth,
  //         containerHeight: relativePos.containerHeight,
  //         scrollLeft: relativePos?.scrollLeft,
  //         scrollTop: relativePos?.scrollTop,
  //       }
  //     );
  //       // if (event.clientX >= rect.left && 
  //       //   event.clientX <= rect.right && 
  //       //   event.clientY >= rect.top && 
  //       //   event.clientY <= rect.bottom) {
  //       // }
  //     }
  //   }

  //   if (!provider) {
  //     initializeProvider(docName)
  //   } else {
  //     const awareness = provider.awareness
  //     const awarenessStates = Array.from(awareness.getStates().values()).filter((state) => Object.keys(state).length > 0)
  //     const isStateAlreadyPresent = awarenessStates.find((state: any) => state?.id === user?.id)

  //     if (!isStateAlreadyPresent) {
  //       if (containerRef) {
  //         containerRef.current?.addEventListener('mousemove', updateAwarenessField);
  //       } else {
  //         document.addEventListener('mousemove', updateAwarenessField);
  //       }
  //     }
  //   }

  //   return () => {
  //     console.log('[EDITOR] Cleaning up useBlockEditor');
  //     if (containerRef) {
  //       containerRef.current?.removeEventListener('mousemove', updateAwarenessField);
  //     } else {
  //       document.removeEventListener('mousemove', updateAwarenessField);
  //     }

  //     if (provider) {
  //       if (provider.awareness) {
  //         provider.awareness.setLocalState(null)
  //       }
  //       provider.destroy()
  //       setProvider(null)
  //     }
  //   }
  // }, [doc?.id, provider, user])

  // useEffect update localDoc values
  useEffect(() => {
    if (doc?.id) {
      setLocalDoc(doc);
    }
  }, [doc]);

  useImperativeHandle(ref, () => ({
    editor,
  }));

  if (!editor) return

  return (
    <div className={cn("w-full flex gap-5 relative justify-center", isDraft ? "h-full" : "")}>
      <div
        className={cn(
          "w-full relative flex flex-col bg-content1 md:rounded-lg z-[1] md:border md:border-divider overflow-hidden",
          isDraft ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        {/* Scrollable Editor */}
        <div className={cn("h-full p-5 z-10 relative", isDraft ? "overflow-y-auto" : "")}>
          {editor && (
            <>
              {(isDraft || canEditDraft) &&
                <>
                  {/* <ContentItemMenu editor={editor} /> */}
                  {/* <TableRowMenu editor={editor} appendTo={menuContainerRef} /> */}
                  {/* <TableColumnMenu editor={editor} appendTo={menuContainerRef} /> */}
                  {/* <ImageBlockMenu editor={editor} appendTo={menuContainerRef} /> */}
                </>
              }

              <EditorContent
                editor={editor}
                spellCheck="false"
                key={"page-editor"}
                className={cn("tiptap h-full", (!localDoc?.id || editable) && "editableClass")}
              />
            </>
          )}
        </div>
      </div>

      {/* {provider && containerRef && <CursorOverlay provider={provider} containerRef={containerRef} />} */}

      {localDoc?.id &&
        <CommentBubble
          editor={editor}
          documentId={localDoc?.id}
          user={{
            id: user?.id,
            avatar: user?.avatar,
            lastname: user?.lastname,
            firstname: user?.firstname,
          }}
        />
      }
    </div>
  )
})

BlockEditor.displayName = 'BlockEditor'

export default BlockEditor;