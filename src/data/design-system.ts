import { getEntry } from 'astro:content';
import type { ContentBlock } from '../content/schema';

interface Example {
  block?: ContentBlock;
  source?: string;
  slug: string;
  label: string;
  code: string;
}

interface Entry {
  id: string;
  title: string;
  description: string;
  examples: Example[];
}

function example(slug: string, code: string, label = 'Пример'): Example {
  return { slug, label, code };
}

const library: Entry[] = [
  { id: 'hero', title: 'Первый экран', description: 'Заголовок, предложение и основные действия. У обеих композиций общие SiteHeader и HeroContent.', examples: [example('home-hero', '<HeroLight />', 'Главная'), example('service-hero', '<ServiceHero {...hero} />', 'Performance-маркетинг'), example('contextual-hero', '<ServiceHero {...contextualHero} />', 'Контекстная реклама')] },
  { id: 'header', title: 'Шапка и навигация', description: 'Логотип, меню и переходы между разделами страницы.', examples: [example('header', '<SiteHeader activeSection="services" />')] },
  { id: 'directions', title: 'Каталог направлений', description: 'Список направлений с описаниями, тегами и ссылками. Обе композиции используют DirectionRows.', examples: [example('directions', '<Services items={directions} />', 'Главная'), example('channels', '<ServiceChannels items={subservices} />', 'Услуга')] },
  { id: 'cases', title: 'Кейсы', description: 'Подборка проектов с фотографиями и измеримыми результатами.', examples: [example('cases', '<Cases items={cases} />')] },
  { id: 'process', title: 'Процесс в карточках', description: 'Этапы с длительностью и результатом. На главной используется карусель.', examples: [example('process', '<ProcessCards items={process} inset={false} />', 'Сетка'), example('carousel', '<ProcessCards items={process} carousel />', 'Карусель')] },
  { id: 'expert', title: 'Консультация эксперта', description: 'Форма обсуждения задачи со специалистом.', examples: [example('expert', '<ExpertContactForm id="expert" />')] },
  { id: 'team', title: 'Команда и отзыв', description: 'Карточки специалистов и отзыв клиента.', examples: [example('team', '<TeamReviews />')] },
  { id: 'contacts', title: 'Контакты и заявка', description: 'Форма заявки, бриф, телефоны и мессенджеры.', examples: [example('contacts', '<Contacts />')] },
  { id: 'footer', title: 'Подвал', description: 'Заключительная навигация и сведения об агентстве. Входит в Contacts.', examples: [example('footer', '<Footer />')] },
  { id: 'tasks', title: 'Задачи бизнеса', description: 'Список ситуаций, фотография и переход к консультации.', examples: [example('tasks', '<BusinessTasks items={tasks} />')] },
  { id: 'matrix', title: 'Матрица решений', description: 'Вопросы и пояснения к критериям выбора.', examples: [example('matrix', '<ServiceDecisionMatrix items={approach} />')] },
  { id: 'budget', title: 'Распределение бюджета', description: 'Принцип распределения и карточки критериев.', examples: [example('budget', '<BudgetCriteria items={budgetCriteria} />')] },
  { id: 'metrics', title: 'Метрики', description: 'Нумерованные показатели с анимацией при прокрутке.', examples: [example('metrics', '<Metrics items={metrics} />')] },
  { id: 'analytics', title: 'Витрина аналитики', description: 'Изображение интерфейса и описание аналитического продукта.', examples: [example('analytics', '<AnalyticsShowcase description="Все показатели проекта в одном кабинете." />')] },
  { id: 'timeline', title: 'Этапы на временной шкале', description: 'Слайды с результатом, сроком и иллюстрацией каждого этапа.', examples: [example('timeline', '<StageTimeline items={stages} />')] },
  { id: 'pricing', title: 'Стоимость', description: 'Основные статьи расходов и дополнительное предложение.', examples: [example('pricing', '<Pricing items={pricing} extra={pricingExtra} />')] },
  { id: 'faq', title: 'Частые вопросы', description: 'Раскрывающиеся ответы и ссылка для связи.', examples: [example('faq', '<Faq items={[{ q: "Как начать?", a: "Оставьте заявку." }]} />')] },
  { id: 'articles', title: 'Статьи', description: 'Основная публикация и дополнительные материалы.', examples: [example('articles', '<BlogArticles heading="Статьи" posts={blogPosts} />')] },
  { id: 'certificates', title: 'Сертификаты', description: 'Подтверждения квалификации и партнёрства.', examples: [example('certificates', '<Certificates />')] },
];

export async function getLibrary() {
  const pilot = await getEntry('seo', 'seo-internet-magazinov');
  return library.map(entry => {
    const block = pilot?.data.blocks.find(item => item.type === entry.id);
    if (!block || !pilot) return entry;
    const preview: Example = {
      label: 'Из Markdown', slug: `md-${block.type}`,
      code: JSON.stringify(block, null, 2), block, source: pilot.filePath ?? pilot.id,
    };
    return { ...entry, examples: [...entry.examples, preview] };
  });
}
