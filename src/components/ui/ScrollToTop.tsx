import { Button, cn } from '@heroui/react';
import { ChevronUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const ScrollToTop = ({ classes }: { classes?: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById('main_container')

    if (!scrollContainer) {
      return;
    }

    const toggleVisibility = () => {
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      const scrollTop = scrollContainer.scrollTop;
      
      // Check if container has scrollable content and user has scrolled
      const hasScrollableContent = scrollHeight > clientHeight;
      const isScrolledDown = scrollTop > 300;
      
      setIsVisible(hasScrollableContent && isScrolledDown);
    };

    // Check on mount
    toggleVisibility();

    // Add scroll listener to the container
    scrollContainer.addEventListener('scroll', toggleVisibility);

    return () => {
      scrollContainer.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('main_container');

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Button
        isIconOnly
        variant="shadow"
        color="primary"
        aria-label="Scroll to top"
        className={cn("fixed z-50 shadow", classes ? classes : "bottom-16 right-5")}
        onPress={scrollToTop}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </>
  );
};

export default ScrollToTop;