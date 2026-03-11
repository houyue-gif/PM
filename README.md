# PM Platform P0

## 技术栈确认
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React Query（数据拉取）
- Zod（API 入参校验）
- Prisma + PostgreSQL schema（已建模，P0 以 mock API 演示）

## 目录结构方案
- `app/` 路由与 API
- `components/` 布局、基础 UI、业务组件
- `lib/` mock 数据、API helper、工具
- `types/` 领域模型
- `prisma/` 数据库 schema

## 数据模型方案
覆盖 Organization、Workspace、Team、Member、Role、Permission、Project、ProjectMember、Task、TaskWatcher、Comment、ActivityLog、Notification、Tag、RecentVisit。

## 路由与页面规划
- `/login`
- `/app`
- `/app/projects`
- `/app/projects/[id]`
- `/app/tasks`
- `/app/my-tasks`
- `/app/teams`
- `/app/members`
- `/app/settings/roles`
- `/app/settings/configs`
- `/app/notifications`

## 第一阶段创建文件清单
- layout：`app/layout.tsx`、`app/app/layout.tsx`、`components/layout/*`
- 页面：上述路由对应 `page.tsx`
- 任务中心：`components/tasks/task-center.tsx`
- 项目中心：`components/projects/project-list.tsx`
- API：`app/api/*`
- 数据与类型：`lib/mock-db.ts`、`types/domain.ts`
- DB 建模：`prisma/schema.prisma`
