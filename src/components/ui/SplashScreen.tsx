import logoUrl from '../../assets/canvasmd-logo.png';

export function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-card glass-panel">
        <img className="splash-logo" src={logoUrl} alt="canvasMD" />
        <strong>canvasMD</strong>
        <span>Загружаем рабочее пространство…</span>
        <div className="splash-bar"><i /></div>
      </div>
    </div>
  );
}
