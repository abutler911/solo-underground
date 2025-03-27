// client/src/components/ScrollToTop.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // This will force scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // Try "auto" instead of "smooth" for more immediate effect
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
