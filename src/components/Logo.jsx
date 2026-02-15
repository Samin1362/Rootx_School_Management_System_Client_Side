import { Link } from "react-router";

const Logo = ({ size = "md", showText = true, linkTo = "/" }) => {
  const sizes = {
    sm: {
      container: "w-8 h-8",
      text: "text-base",
      sub: "text-[9px]",
      iconScale: 0.7,
    },
    md: {
      container: "w-10 h-10",
      text: "text-xl",
      sub: "text-[10px]",
      iconScale: 0.85,
    },
    lg: {
      container: "w-14 h-14",
      text: "text-2xl",
      sub: "text-xs",
      iconScale: 1,
    },
  };

  const s = sizes[size] || sizes.md;

  return (
    <Link to={linkTo} className="flex items-center gap-2.5 group no-underline">
      {/* Icon Container */}
      <div className="relative logo-icon-container">
        {/* Main Icon Box with Gradient Background */}
        <div
          className={`${s.container} rounded-2xl relative overflow-hidden
            bg-gradient-to-br from-primary via-primary to-secondary
            shadow-lg group-hover:shadow-2xl
            transition-all duration-500 ease-out
            group-hover:scale-110 group-hover:rotate-3
            border-2 border-primary/20 group-hover:border-primary/40`}
        >
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>

          {/* Pulsing Glow Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>

          {/* Book Icon SVG - Educational Symbol */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[60%] h-[60%] text-white transform transition-all duration-500 group-hover:scale-110"
              style={{ transform: `scale(${s.iconScale})` }}
            >
              {/* Book Pages */}
              <path
                d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-line"
              />
              <path
                d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-path"
              />
              {/* Bookmark Accent */}
              <path
                d="M13 2V9L15.5 7L18 9V2"
                fill="currentColor"
                fillOpacity="0.3"
                className="origin-top transition-all duration-500 group-hover:scale-y-110"
              />
            </svg>
          </div>
        </div>

        {/* Orbiting Dots Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dot 1 - Top Right */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full border-2 border-base-100 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-float"></div>

          {/* Dot 2 - Bottom Left */}
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-warning rounded-full border-2 border-base-100 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 group-hover:animate-bounce"></div>
        </div>

        {/* Success Indicator Badge */}
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-100 shadow-md transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-success/50 animate-pulse-slow"></div>
      </div>

      {/* Text Container */}
      {showText && (
        <div className="flex flex-col transition-all duration-300 group-hover:translate-x-0.5">
          <span
            className={`${s.text} font-bold text-base-content leading-tight tracking-tight transition-all duration-300 group-hover:text-primary`}
          >
            Root<span className="text-primary inline-block transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 origin-bottom">X</span>
          </span>
          <span
            className={`${s.sub} text-base-content/60 font-medium -mt-0.5 tracking-wide uppercase transition-all duration-300 group-hover:text-base-content/80 group-hover:tracking-wider`}
          >
            School Management
          </span>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }

        @keyframes draw-line {
          from {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          to {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-path {
          from {
            stroke-dasharray: 200;
            stroke-dashoffset: 200;
          }
          to {
            stroke-dasharray: 200;
            stroke-dashoffset: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(180deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-draw-line {
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
        }

        .group:hover .animate-draw-line {
          animation: draw-line 0.8s ease-out;
        }

        .animate-draw-path {
          stroke-dasharray: 200;
          stroke-dashoffset: 0;
        }

        .group:hover .animate-draw-path {
          animation: draw-path 1s ease-out;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </Link>
  );
};

export default Logo;
