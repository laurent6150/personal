import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// React 19 + Zustand 5 호환성 문제로 StrictMode 임시 비활성화
// StrictMode의 이중 렌더링이 useSyncExternalStore와 충돌 발생
createRoot(document.getElementById('root')!).render(
  <App />
)
