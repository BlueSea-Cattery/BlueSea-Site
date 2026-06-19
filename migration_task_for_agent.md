# ТЗ: Миграция базы данных с SQLite на облачный PostgreSQL

## Контекст для Агента
При деплое проекта **BlueSeaSite** на Vercel возникла ошибка сборки `PrismaConfigEnvError: Missing required environment variable: DATABASE_URL`. 
Текущая конфигурация Prisma настроена на использование локального файла SQLite (`file:/Users/artemiyzuzin/Desktop/Projects/BlueSeaSite/prisma/dev.db`). 
Так как Vercel представляет собой serverless-окружение с файловой системой read-only и не имеет доступа к локальной машине разработчика, проект необходимо перевести на облачную базу данных PostgreSQL.

Твоя задача — подготовить кодовую базу к переходу на PostgreSQL.

## Задачи для выполнения (Action Items)

### 1. Обновление схемы Prisma (`prisma/schema.prisma`)
Необходимо изменить провайдера базы данных с SQLite на PostgreSQL.
- Открой файл `prisma/schema.prisma`.
- Найди блок `datasource db`.
- Измени значение параметра `provider` на `"postgresql"`.

**Ожидаемый результат:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Очистка несовместимых миграций
Старые миграции, сгенерированные для SQLite, несовместимы с синтаксисом PostgreSQL. Их необходимо удалить, чтобы начать историю миграций с чистого листа для новой БД.
- Удали директорию `prisma/migrations` со всем ее содержимым.

### 3. Обновление переменных окружения (`.env` / `.env.example`)
Локальный путь к файлу базы данных больше не актуален.
- Открой файл `.env` (и `.env.example`, если он существует).
- Замени значение `DATABASE_URL` на типовой плейсхолдер для подключения к PostgreSQL. Оставь `SESSION_SECRET` без изменений.

**Пример ожидаемого `.env`:**
```env
# Prisma (Вставьте сюда URL от облачной БД: Neon, Supabase, Vercel Postgres и т.д.)
# Формат: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://<user>:<password>@<host>/<db_name>?sslmode=require"

# Session
SESSION_SECRET="complex_password_at_least_32_characters_long_bluesea_cattery_2024"
```

### 4. Инструкции по дальнейшим шагам (Оставить в комментариях или вывести в консоль)
После того как ты (Агент) внесешь эти изменения, разработчику (Артемию) потребуется выполнить следующие шаги вручную:
1. Зарегистрировать облачную БД (например, на Neon.tech) и получить реальный `DATABASE_URL`.
2. Вставить этот URL в локальный файл `.env`.
3. Выполнить команду для генерации клиента Prisma:
   `npx prisma generate`
4. Выполнить команду для создания первой миграции в новой базе:
   `npx prisma migrate dev --name init_postgres`
5. Добавить полученный `DATABASE_URL` в настройки проекта на Vercel (Settings -> Environment Variables).
6. Перезапустить деплой на Vercel.
