import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/svg+xml';

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#0F172A" />
        <path
          d="M11 10h10v2H11zM9 15h8v2H9zM15 20h8v2h-8z"
          fill="#38BDF8"
        />
      </svg>
    ),
    {
      width: size.width,
      height: size.height,
    }
  );
}



