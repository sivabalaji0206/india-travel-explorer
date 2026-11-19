import React from 'react';
import { Box } from '@mui/material';

interface TravelerMascotProps {
  mode: 'login' | 'signup';
}

export const TravelerMascot: React.FC<TravelerMascotProps> = ({ mode }) => {
  const isLogin = mode === 'login';

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: { xs: 220, md: 440 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FBF9F5', // Soft, warm, simple cream background matching the video
        borderRadius: isLogin ? '16px 0 0 16px' : '0 16px 16px 0',
      }}
    >
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes waveHand {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(14deg); }
          75% { transform: rotate(-8deg); }
        }
        @keyframes blinkEye {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
        @keyframes peekIn {
          from { opacity: 0; transform: translateX(${isLogin ? '-20px' : '20px'}); }
          to { opacity: 1; transform: translateX(0); }
        }
        .traveler-character {
          animation: peekIn 0.4s ease-out forwards;
        }
        .traveler-body {
          animation: subtleFloat 3s ease-in-out infinite;
        }
        .waving-hand {
          transform-origin: 275px 235px;
          animation: waveHand 1.8s ease-in-out infinite;
        }
        .blinking-eye {
          transform-origin: center;
          animation: blinkEye 4s infinite;
        }
      `}</style>

      {isLogin ? (
        /* ============================================================
           LOGIN MODE: Peeking from behind the green pillar on the left,
           holding hand to brow looking across at the form!
           ============================================================ */
        <svg
          className="traveler-character"
          viewBox="0 0 320 400"
          width="100%"
          height="100%"
          style={{ maxHeight: 380 }}
        >
          {/* Green vertical rounded pillar / edge (inspired by the video) */}
          <rect x="0" y="20" width="22" height="360" rx="11" fill="#1E7D5C" />

          <g className="traveler-body" transform="translate(10, 0)">
            {/* Torso & Shirt */}
            <path
              d="M30 360 C30 290 55 240 100 225 C145 210 180 230 195 360 Z"
              fill="#FDEFD9"
            />
            {/* Little travel plane/arrow patterns on shirt */}
            <path
              d="M75 270 L82 280 L72 283 Z M130 285 L138 295 L128 298 Z M95 320 L102 330 L92 333 Z"
              fill="#E8D1B5"
            />

            {/* Neck */}
            <rect x="92" y="180" width="36" height="42" rx="10" fill="#F8B896" />

            {/* Head */}
            <circle cx="110" cy="140" r="54" fill="#FBC4A6" />

            {/* Left Ear */}
            <ellipse cx="58" cy="142" rx="9" ry="13" fill="#F8B896" />

            {/* Stylish Brown Hair (back & top) */}
            <path
              d="M60 135 C55 100 70 70 115 65 C150 62 175 85 170 120 C162 105 148 95 125 96 C98 97 80 112 70 135 Z"
              fill="#4A3427"
            />
            {/* Hair bangs / front curls */}
            <path
              d="M75 95 C90 75 130 75 148 88 C135 88 120 95 110 106 C100 95 88 94 75 95 Z"
              fill="#3A281E"
            />

            {/* Face details: Eyebrows, Eyes looking forward to the right */}
            {/* Eyebrows */}
            <path
              d="M95 118 Q108 114 122 118"
              stroke="#3A281E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M135 118 Q148 114 160 118"
              stroke="#3A281E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Eyes looking intently toward the login fields */}
            <g className="blinking-eye">
              <ellipse cx="112" cy="128" rx="6.5" ry="7.5" fill="#263238" />
              <circle cx="114" cy="126" r="2.2" fill="#FFFFFF" />

              <ellipse cx="148" cy="128" rx="6.5" ry="7.5" fill="#263238" />
              <circle cx="150" cy="126" r="2.2" fill="#FFFFFF" />
            </g>

            {/* Friendly Nose & Happy Smile */}
            <path
              d="M134 133 Q138 142 133 146"
              stroke="#E09777"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M116 156 Q130 170 144 156"
              stroke="#3A281E"
              strokeWidth="3"
              strokeLinecap="round"
              fill="#FFFFFF"
            />

            {/* Peeking Hand gripping the green pillar on the left */}
            <g transform="translate(6, 175)">
              <rect x="0" y="0" width="16" height="34" rx="8" fill="#FBC4A6" />
              <circle cx="14" cy="8" r="5" fill="#F8B896" />
              <circle cx="14" cy="18" r="5" fill="#F8B896" />
              <circle cx="14" cy="27" r="5" fill="#F8B896" />
            </g>

            {/* Right Arm raised to forehead/brow (peering into the horizon!) */}
            <path
              d="M170 230 C195 210 220 185 210 145 C205 125 185 110 150 108"
              stroke="#FBC4A6"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Shirt Sleeve */}
            <path
              d="M165 240 C178 220 195 210 205 220 C200 235 185 255 170 260 Z"
              fill="#FDEFD9"
            />
            {/* Hand shielding eyes at forehead */}
            <path
              d="M138 108 Q155 104 172 110"
              stroke="#F8B896"
              strokeWidth="13"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      ) : (
        /* ============================================================
           SIGNUP MODE: Popping out from the right green curved portal,
           waving enthusiastically to welcome the user!
           ============================================================ */
        <svg
          className="traveler-character"
          viewBox="0 0 320 400"
          width="100%"
          height="100%"
          style={{ maxHeight: 380 }}
        >
          {/* Green curved circle/portal arch on the right (inspired by video) */}
          <path
            d="M 310 40 A 150 150 0 0 0 310 360"
            stroke="#1E7D5C"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
          />

          <g className="traveler-body" transform="translate(45, 0)">
            {/* Torso & Shirt */}
            <path
              d="M40 360 C50 280 80 235 130 225 C180 215 210 240 220 360 Z"
              fill="#FDEFD9"
            />
            {/* Little pattern details on shirt */}
            <path
              d="M85 275 L92 285 L82 288 Z M140 290 L148 300 L138 303 Z M105 325 L112 335 L102 338 Z"
              fill="#E8D1B5"
            />

            {/* Neck */}
            <rect x="110" y="175" width="36" height="42" rx="10" fill="#F8B896" />

            {/* Head */}
            <circle cx="128" cy="135" r="54" fill="#FBC4A6" />

            {/* Right Ear */}
            <ellipse cx="180" cy="138" rx="9" ry="13" fill="#F8B896" />

            {/* Brown Hair */}
            <path
              d="M75 125 C70 85 100 60 145 62 C185 64 200 95 195 130 C185 110 168 100 145 100 C118 100 95 110 75 125 Z"
              fill="#4A3427"
            />
            <path
              d="M95 90 C115 75 155 78 170 95 C155 92 135 98 122 108 C115 98 105 92 95 90 Z"
              fill="#3A281E"
            />

            {/* Cheerful Eyebrows */}
            <path
              d="M100 115 Q114 110 126 114"
              stroke="#3A281E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M140 114 Q152 110 166 115"
              stroke="#3A281E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Big Friendly Eyes looking at user */}
            <g className="blinking-eye">
              <ellipse cx="114" cy="125" rx="6.5" ry="7.5" fill="#263238" />
              <circle cx="116" cy="123" r="2.2" fill="#FFFFFF" />

              <ellipse cx="152" cy="125" rx="6.5" ry="7.5" fill="#263238" />
              <circle cx="154" cy="123" r="2.2" fill="#FFFFFF" />
            </g>

            {/* Cute Rosy Cheeks */}
            <ellipse cx="102" cy="138" rx="7" ry="4" fill="#F39C80" opacity="0.6" />
            <ellipse cx="164" cy="138" rx="7" ry="4" fill="#F39C80" opacity="0.6" />

            {/* Happy Open Smile */}
            <path
              d="M120 148 Q134 168 148 148 Z"
              fill="#E05D44"
              stroke="#3A281E"
              strokeWidth="2.5"
            />
            {/* Teeth highlight */}
            <path d="M124 150 Q134 156 144 150 Z" fill="#FFFFFF" />

            {/* Left Hand resting on the curved edge */}
            <g transform="translate(195, 230)">
              <rect x="0" y="0" width="30" height="18" rx="8" fill="#FBC4A6" />
              <circle cx="8" cy="16" r="4.5" fill="#F8B896" />
              <circle cx="18" cy="16" r="4.5" fill="#F8B896" />
              <circle cx="26" cy="16" r="4.5" fill="#F8B896" />
            </g>

            {/* Right Arm & Waving Hand */}
            <g className="waving-hand">
              {/* Arm reaching out and up */}
              <path
                d="M190 220 Q225 180 235 140"
                stroke="#FBC4A6"
                strokeWidth="22"
                strokeLinecap="round"
                fill="none"
              />
              {/* Sleeve */}
              <path
                d="M180 215 C195 200 210 205 215 220 C205 235 190 245 175 235 Z"
                fill="#FDEFD9"
              />
              {/* Open waving palm */}
              <circle cx="240" cy="125" r="16" fill="#FBC4A6" />
              {/* Fingers waving */}
              <rect x="228" y="96" width="6.5" height="18" rx="3" fill="#F8B896" />
              <rect x="236" y="92" width="6.5" height="20" rx="3" fill="#F8B896" />
              <rect x="244" y="95" width="6.5" height="18" rx="3" fill="#F8B896" />
              <rect x="252" y="102" width="6.5" height="14" rx="3" fill="#F8B896" />
              {/* Thumb */}
              <rect
                x="220"
                y="122"
                width="6.5"
                height="14"
                rx="3"
                transform="rotate(-40 220 122)"
                fill="#F8B896"
              />
            </g>
          </g>
        </svg>
      )}
    </Box>
  );
};
