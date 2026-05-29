import { ArrowRight, MousePointer2, Network, SearchCheck, ShieldQuestion } from 'lucide-react';
import { Button } from '../ui/Button';
import { useProjectStore } from '../../store/useProjectStore';

export function OnboardingModal() {
  const open = useProjectStore((state) => state.onboardingOpen);
  const dismiss = useProjectStore((state) => state.dismissOnboarding);
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <section className="onboarding glass-panel">
        <div className="onboarding-hero">
          <span className="eyebrow">canvasMD MVP</span>
          <h1>Визуальные заметки, задачи, изображения и ссылки на бесконечном холсте</h1>
          <p>Создавайте заметки, TODO-блоки, изображения и ссылки. Соединяйте карточки стрелками, добавляйте теги и быстро находите нужные элементы.</p>
        </div>
        <div className="onboarding-grid">
          <article><MousePointer2 size={20} /><strong>Управление</strong><span>Колесико — zoom, пустое место — перемещение, Shift + drag — выделение.</span></article>
          <article><Network size={20} /><strong>Связи</strong><span>Тяните линии между точками карточек и подписывайте связи.</span></article>
          <article><SearchCheck size={20} /><strong>Поиск</strong><span>Ищет по заголовкам, тексту, тегам и комментариям.</span></article>
          <article><ShieldQuestion size={20} /><strong>OSINT</strong><span>Используйте заметки, изображения и ссылки как элементы визуальной доски.</span></article>
        </div>
        <Button variant="primary" onClick={dismiss}>Начать работу <ArrowRight size={16} /></Button>
      </section>
    </div>
  );
}
