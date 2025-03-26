import { onCLS, onLCP, onTTFB } from "web-vitals";


const reportWebVitals = (onPerfEntry?: (metric:any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ onCLS, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
