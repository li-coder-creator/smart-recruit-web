<template>
  <RouterView />
</template>

<script setup></script>

<style>
:root {
  --sr-primary: #12b886;
  --sr-primary-dark: #0f9f7a;
  --sr-primary-soft: #e8fbf5;
  --sr-ink: #17233d;
  --sr-text: #334155;
  --sr-muted: #6b7280;
  --sr-line: #e6edf3;
  --sr-bg: #f5f8fb;
  --sr-card: #ffffff;
  --sr-warning: #f59e0b;
  --sr-danger: #ef4444;
  --sr-shadow: 0 14px 38px rgba(15, 35, 52, 0.08);
  --el-color-primary: var(--sr-primary);
  --el-color-primary-light-3: #55cfad;
  --el-color-primary-light-5: #85dec5;
  --el-color-primary-light-7: #b8ecdd;
  --el-color-primary-light-8: #d6f6ed;
  --el-color-primary-light-9: var(--sr-primary-soft);
  --el-color-primary-dark-2: var(--sr-primary-dark);
  --el-border-radius-base: 8px;
  --el-font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

body {
  color: var(--sr-text);
  background: var(--sr-bg);
  font-family: var(--el-font-family);
  font-size: 16px;
  letter-spacing: 0;
}

a {
  color: inherit;
}

h2,
h3,
p {
  letter-spacing: 0;
}

h2 {
  margin: 0 0 22px;
  color: var(--sr-ink);
  font-size: 26px;
  font-weight: 750;
  line-height: 1.25;
}

h3 {
  margin: 0 0 14px;
  color: var(--sr-ink);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
}

p {
  margin: 8px 0;
  color: var(--sr-muted);
  line-height: 1.75;
}

.el-button {
  border-radius: 8px;
  font-weight: 650;
}

.el-button--primary {
  border-color: var(--sr-primary);
  background: var(--sr-primary);
}

.el-button--primary:hover,
.el-button--primary:focus {
  border-color: var(--sr-primary-dark);
  background: var(--sr-primary-dark);
}

.el-button--danger {
  border-color: var(--sr-danger);
  background: var(--sr-danger);
}

.el-button.is-link {
  padding: 4px 0;
  color: var(--sr-primary);
}

.el-card {
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  box-shadow: var(--sr-shadow);
}

.el-card__header {
  border-bottom: 1px solid var(--sr-line);
  padding: 18px 22px;
  color: var(--sr-ink);
  font-weight: 700;
}

.el-card__body {
  padding: 22px;
}

.el-input__wrapper,
.el-textarea__inner,
.el-select__wrapper {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--sr-line) inset;
}

.el-input__wrapper.is-focus,
.el-textarea__inner:focus,
.el-select__wrapper.is-focused {
  box-shadow:
    0 0 0 1px var(--sr-primary) inset,
    0 0 0 4px rgba(18, 184, 134, 0.12);
}

.el-form-item__label {
  color: var(--sr-ink);
  font-weight: 650;
}

.el-table {
  overflow: hidden;
  border-radius: 8px;
  color: var(--sr-text);
}

.el-table th.el-table__cell {
  background: #f8fafc;
  color: var(--sr-ink);
  font-weight: 700;
}

.el-table--border::after,
.el-table--border::before,
.el-table__inner-wrapper::before {
  background-color: var(--sr-line);
}

.el-tag {
  border-radius: 999px;
  font-weight: 650;
}

.el-dialog {
  border-radius: 8px;
  box-shadow: 0 26px 80px rgba(15, 35, 52, 0.18);
}

.el-dialog__header {
  padding: 22px 24px 10px;
}

.el-dialog__title {
  color: var(--sr-ink);
  font-weight: 750;
}

.el-dialog__body {
  padding: 18px 24px 24px;
}

.el-descriptions {
  --el-descriptions-table-border: var(--sr-line);
}

.el-descriptions__label.el-descriptions__cell.is-bordered-label {
  background: #f8fafc;
  color: var(--sr-ink);
  font-weight: 700;
}

.el-descriptions__content.el-descriptions__cell.is-bordered-content {
  color: var(--sr-text);
}

#app .job-container,
#app .resume-container,
#app .application-container,
#app .job-info-container,
#app .application-info-container,
#app .job-edit-container,
#app .resume-edit-container,
#app .update-info-container,
#app .password-container,
#app .user-info-container,
#app .company-info-container,
#app .company-edit-container,
#app .admin-user-container,
#app .admin-company-container,
#app .home-container {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 28px;
}

#app .job-container > .el-button,
#app .resume-container > .el-button {
  margin-bottom: 22px;
}

#app .job-list,
#app .resume-list,
#app .application-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}

#app .job-card,
#app .resume-card,
#app .application-card {
  height: 100%;
  border: 1px solid var(--sr-line);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

#app .job-card:hover,
#app .resume-card:hover,
#app .application-card:hover {
  border-color: rgba(18, 184, 134, 0.5);
  box-shadow: 0 18px 44px rgba(18, 184, 134, 0.13);
  transform: translateY(-2px);
}

#app .job-card h3,
#app .application-card h3,
#app .resume-card h3 {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--sr-line);
}

#app .job-card p:first-of-type,
#app .application-card p:first-of-type {
  color: var(--sr-ink);
  font-weight: 650;
}

#app .job-card p:nth-of-type(2) {
  color: var(--sr-primary-dark);
  font-size: 18px;
  font-weight: 800;
}

#app .job-card .el-button,
#app .resume-card .el-button,
#app .application-card .el-button {
  margin-top: 12px;
}

#app .job-info-container,
#app .application-info-container,
#app .job-edit-container,
#app .resume-edit-container,
#app .update-info-container,
#app .password-container {
  max-width: 820px;
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  background: var(--sr-card);
  box-shadow: var(--sr-shadow);
}

#app .job-info-container h3 {
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--sr-line);
  font-size: 24px;
}

#app .job-info-container p,
#app .application-info-container p {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: #f8fafc;
  color: var(--sr-text);
}

#app .job-info-container .el-button,
#app .application-info-container .el-button {
  margin-top: 18px;
}

#app .job-edit-container .el-form,
#app .resume-edit-container .el-form,
#app .update-info-container .el-form,
#app .password-container .el-form {
  max-width: 680px;
}

#app .admin-user-container,
#app .admin-company-container {
  width: 100%;
}

#app .page-header {
  margin-bottom: 18px;
}

#app .page-header h2 {
  margin: 0;
}

#app .search-card {
  margin-bottom: 18px;
  box-shadow: 0 10px 28px rgba(15, 35, 52, 0.06);
}

#app .search-card .el-card__body {
  padding-bottom: 4px;
}

#app .table-card {
  margin-bottom: 20px;
}

#app .pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

#app .user-info-container {
  max-width: 760px;
}

#app .button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

#app .button-container .el-button {
  margin-left: 0;
}

#app .company-info-container,
#app .company-edit-container {
  max-width: 900px;
}

#app .company-info-container .header,
#app .company-edit-container .header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--sr-ink);
  font-size: 19px;
  font-weight: 750;
}

#app .company-form {
  max-width: 720px;
}

#app .home-container {
  position: relative;
  max-width: none;
  min-height: calc(100vh - 116px);
  overflow: hidden;
  border: 1px solid var(--sr-line);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(18, 184, 134, 0.12), rgba(59, 130, 246, 0.08)), #ffffff;
  box-shadow: var(--sr-shadow);
}

#app .home-container::before {
  content: '';
  position: absolute;
  inset: 28px 28px auto auto;
  width: min(34vw, 360px);
  aspect-ratio: 1;
  border: 1px solid rgba(18, 184, 134, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(18, 184, 134, 0.16) 1px, transparent 1px),
    linear-gradient(rgba(18, 184, 134, 0.16) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.65;
}

#app .home-container h2,
#app .home-container p {
  position: relative;
  max-width: 620px;
}

#app .home-container h2 {
  margin-top: 38px;
  font-size: 48px;
  line-height: 1.05;
}

#app .home-container p {
  color: var(--sr-text);
  font-size: 18px;
}

@media (max-width: 768px) {
  h2 {
    font-size: 22px;
  }

  #app .home-container h2 {
    font-size: 34px;
  }

  #app .job-container,
  #app .resume-container,
  #app .application-container,
  #app .job-info-container,
  #app .application-info-container,
  #app .job-edit-container,
  #app .resume-edit-container,
  #app .update-info-container,
  #app .password-container,
  #app .user-info-container,
  #app .company-info-container,
  #app .company-edit-container,
  #app .admin-user-container,
  #app .admin-company-container,
  #app .home-container {
    padding: 18px;
  }

  #app .job-list,
  #app .resume-list,
  #app .application-list {
    grid-template-columns: 1fr;
  }

  #app .job-info-container p,
  #app .application-info-container p {
    display: block;
  }

  #app .pagination {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
