/** @type {import('tailwindcss').Config} */
export default {
  // content: Tailwind가 CSS를 생성하기 위해 스캔할 파일들의 경로를 지정합니다.
  // './index.html': 프로젝트 루트의 index.html 파일을 포함합니다.
  // './src/**/*.{js,ts,jsx,tsx}': src 폴더 및 모든 하위 폴더에 있는 js, ts, jsx, tsx 파일을 포함합니다.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 여기에 커스텀 디자인 테마(색상, 폰트 등)를 추가할 수 있습니다.
    },
  },
  plugins: [],
}
