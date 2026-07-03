import React from 'react';
import PlatformWorkspaceView from './PlatformWorkspaceView';

export function NotificationsView() {
  return <PlatformWorkspaceView initialTab="notifications" />;
}

export function AuditLogsView() {
  return <PlatformWorkspaceView initialTab="audit" />;
}

export function SystemSettingsView() {
  return <PlatformWorkspaceView initialTab="settings" />;
}

export function IntegrationsView() {
  return <PlatformWorkspaceView initialTab="integrations" />;
}
