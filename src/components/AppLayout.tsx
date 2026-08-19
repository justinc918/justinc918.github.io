import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'

const BASE = import.meta.env.BASE_URL

export default function AppLayout() {
  return (
    <div style={layoutStyle}>
      <TopBar />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  )
}

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgb(20, 24, 39)',
  backgroundImage: `url(${BASE}images/common/background.png)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}

const mainStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  position: 'relative',
}
