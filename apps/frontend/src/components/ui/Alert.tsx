"use client";

import { toast } from "sonner"
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAlertService } from '../../app/_services';

export { Alert };

const Alert = () => {
  const pathname = usePathname();
  const alertService = useAlertService();
  const alert = alertService.alert;
  
  useEffect(() => {
    // clear alert on location change
    alertService.clear();
  }, [pathname]);

  if (!alert) return null;

  toast(`${alert.type}`, {
    description: `${alert.message}`,
    duration: 5000,
    action: {
      label: "Close",
      onClick: () => {
        alertService.clear
      },
    },
  })

  return (
    <></>
  )
}

Alert.displayName = "Alert"