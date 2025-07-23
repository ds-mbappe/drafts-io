import React, { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'

const CursorOverlay = ({ provider, containerRef }: { provider: WebsocketProvider | null, containerRef: React.RefObject<HTMLElement> }) => {
  const UserCursor = ({ 
    user, 
    containerRef 
  }: { 
    user: any; 
    containerRef: React.RefObject<HTMLElement>;
  }) => {
    const [position, setPosition] = useState({ x: 0, y: 0, visible: false });

    useEffect(() => {
      if (!containerRef.current || !user.relativeX || !user.relativeY) {
        setPosition(prev => ({ ...prev, visible: false }));
        return;
      }

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Calculate absolute position from relative position
      const absoluteX = containerRect.left + user.relativeX - container.scrollLeft;
      const absoluteY = containerRect.top + user.relativeY - container.scrollTop;
      
      // Check if cursor is within visible area
      const isVisible = 
        absoluteX >= containerRect.left - 10 &&
        absoluteX <= containerRect.right + 10 &&
        absoluteY >= containerRect.top - 10 && 
        absoluteY <= containerRect.bottom + 10;

      setPosition({
        x: absoluteX,
        y: absoluteY,
        visible: isVisible
      });
    }, [user.relativeX, user.relativeY, user.scrollLeft, user.scrollTop, containerRef]);

    if (!position.visible) return null;

    return (
      <div
        className="user-cursor"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-2px, -2px)',
          // transition: 'all 0.1s ease-out',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
        >
          <path
            d="M3 3L16 10L9 11L7 18L3 3Z"
            fill={user.color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>
        
        <div
          className="user-label"
          style={{
            backgroundColor: user.color,
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            marginTop: '4px',
            marginLeft: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          {user.name}
        </div>
      </div>
    );
  };

  const [cursors, setCursors] = useState<any[]>([]);

  useEffect(() => {
    if (!provider?.awareness) return;

    const updateCursors = () => {
      const states = Array.from(provider.awareness.getStates().entries()).filter((state) => Object.keys(state).length > 0);
      const remoteCursors = states
        .filter(([clientId, state]) => {
          return clientId !== provider.awareness.clientID && 
                 state.user && 
                 state.user.relativeX !== undefined && 
                 state.user.relativeY !== undefined;
        })
        .map(([clientId, state]) => ({
          clientId,
          user: state.user,
        }));

      setCursors(remoteCursors);
    };

    provider.awareness.on('change', updateCursors);
    updateCursors();

    // Also update when container scrolls
    const handleScroll = () => updateCursors();
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      provider.awareness.off('change', updateCursors);
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [provider, containerRef]);

  return (
    <>
      {cursors.map((cursor) => (
        <UserCursor
          key={cursor.clientId}
          user={cursor.user}
          containerRef={containerRef}
        />
      ))}
    </>
  )
}

export default CursorOverlay