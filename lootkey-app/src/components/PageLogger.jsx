import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logAction } from "../services/logger";

export default function PageLogger() {
  const location = useLocation();

  useEffect(() => {
    logAction(
      "PAGE_OPENED",
      `User opened page: ${location.pathname}${location.search}`,
      `${location.pathname}${location.search}`
    );
  }, [location.pathname, location.search]);

  return null;
}