# Кузня — документация по проекту

Как устроен репозиторий и что делать при разработке, релизе и обновлении иконки.

## Структура

```
├── src/                    # фронтенд (React + TypeScript)
│   ├── App.tsx             # главный экран
│   ├── api.ts              # мост в Rust + браузерный fallback
│   ├── entropy.ts          # энтропия и стадии «нагрева»
│   ├── hooks/useForge.ts   # анимация «проковки»
│   ├── components/         # шкала нагрева, чипы наборов
│   ├── fonts/              # Unbounded, JetBrains Mono (woff2, офлайн)
│   └── styles.css          # все стили: дизайн-токены, темы
├── src-tauri/              # обёртка и бэкенд (Rust)
│   ├── src/generator.rs    # генерация пароля (OsRng) + юнит-тесты
│   ├── tauri.conf.json     # окно, bundle, CSP
│   ├── capabilities/       # права webview (буфер обмена)
│   └── icons/              # иконки всех форматов (генерируются, см. ниже)
├── docs/
│   ├── screenshots/        # скриншоты для README
│   └── specs/              # дизайн-документ переписывания
└── .github/workflows/build.yml   # CI: сборка и релиз
```

## Разработка

Нужны [Node.js](https://nodejs.org/) 18+ и [Rust](https://rustup.rs/) stable
с [пререквизитами Tauri](https://v2.tauri.app/start/prerequisites/).

```bash
npm install          # один раз
npm run tauri dev    # приложение с hot-reload
```

Быстрый просмотр дизайна без Rust — в браузере:

```bash
npm run dev          # http://localhost:1420
```

Вне окна Tauri генерация автоматически подменяется на
`crypto.getRandomValues` (см. `src/api.ts`), поэтому интерфейс полностью
рабочий и в браузере.

### Проверки перед коммитом

```bash
npm run build              # tsc + vite: типы и сборка фронтенда
cd src-tauri && cargo test # юнит-тесты генератора
```

### Где что менять

| Задача | Файл |
|--------|------|
| Наборы символов, логика генерации | `src-tauri/src/generator.rs` и зеркально `src/api.ts` |
| Пороги «нагрева», подписи стадий | `src/entropy.ts` |
| Цвета, шрифты, темы | `src/styles.css` (токены в `:root`) |
| Размер окна, заголовок | `src-tauri/tauri.conf.json` |
| Версия приложения | `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` — во всех трёх |

## Иконка

Исходник — квадратный PNG ≥1024×1024. Весь набор форматов генерируется одной
командой:

```bash
npx tauri icon путь/к/исходнику.png
rm -rf src-tauri/icons/android src-tauri/icons/ios   # мобильные не нужны
```

Иконка в шапке README — это `src-tauri/icons/128x128.png`, отдельной копии
нет: обновится сама.

## Релиз

1. Поднять версию в `package.json`, `src-tauri/tauri.conf.json`,
   `src-tauri/Cargo.toml` (и закоммитить в main через PR).
2. Поставить тег и запушить:

   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```

3. CI соберёт обе платформы (~10 минут) и создаст **черновик релиза** с
   файлами: `.dmg` (macOS universal), `-setup.exe` (NSIS) и `.msi` (Windows).
4. Зайти в [Releases](https://github.com/Denchikper/password_generator/releases),
   проверить черновик, дописать описание → **Publish release**.

Если сборка по тегу упала и нужно пересобрать после фикса — тег придётся
перевыпустить (workflow берётся из коммита, на который указывает тег):

```bash
git tag -d v2.1.0 && git push origin :refs/tags/v2.1.0
git tag v2.1.0 && git push origin v2.1.0
```

## CI

`.github/workflows/build.yml`:

- **Триггеры:** тег `v*` — сборка + черновик релиза; вручную
  (Actions → build → Run workflow) — просто сборка с артефактами.
  Обычные пуши в main ничего не собирают.
- **Матрица:** `macos-latest` (universal: Intel + Apple Silicon) и
  `windows-latest`.
- Перед сборкой гоняются `cargo test`.
- Артефакты каждого прогона лежат во вкладке Actions 90 дней;
  для раздачи пользователям — только Releases.
- `permissions: contents: write` обязателен — без него tauri-action
  не может создать релиз («Resource not accessible by integration»).

## Первый запуск у пользователей

Сборки не подписаны сертификатами, поэтому системы предупреждают:

- **macOS:** «Не удаётся проверить разработчика» → Системные настройки →
  Конфиденциальность и безопасность → **«Открыть всё равно»**.
  Либо в терминале: `xattr -cr /Applications/Кузня.app`.
- **Windows:** SmartScreen «Система защитила ваш компьютер» →
  **Подробнее** → **Выполнить в любом случае**. Дальше обычный установщик.

### Как убрать предупреждения совсем

- **macOS:** нужен платный Apple Developer ($99/год) — Developer ID
  сертификат + нотаризация. tauri-action подхватит секреты
  `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
  `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` — добавить их в
  Settings → Secrets и прокинуть в env шага сборки.
- **Windows:** сертификат подписи кода (OV/EV) или Azure Trusted Signing.
  Для опенсорс-проекта обычно не делают.

---

<div align="center"><sub>by <a href="https://github.com/Denchikper">Benovich</a></sub></div>
