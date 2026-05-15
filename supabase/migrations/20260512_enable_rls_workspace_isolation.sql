-- RLS Policies for Multi-Tenant Workspace Isolation
-- Generated: 2026-05-12
-- Purpose: Ensure row-level security for workspace-based data isolation

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's workspace
CREATE OR REPLACE FUNCTION auth.workspace_id()
RETURNS TEXT AS $$
  SELECT workspace_id
  FROM workspace_members
  WHERE user_id = auth.uid()
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- COMPANIES: Users can only see companies in their workspace
CREATE POLICY "Users can view their workspace companies"
  ON companies FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace companies"
  ON companies FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace companies"
  ON companies FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

-- TASKS: Users can only see tasks in their workspace
CREATE POLICY "Users can view their workspace tasks"
  ON tasks FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace tasks"
  ON tasks FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace tasks"
  ON tasks FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can delete their workspace tasks"
  ON tasks FOR DELETE
  USING (workspace_id = auth.workspace_id());

-- PROJECTS: Users can only see projects in their workspace
CREATE POLICY "Users can view their workspace projects"
  ON projects FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace projects"
  ON projects FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace projects"
  ON projects FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

-- DECISIONS: Users can only see decisions in their workspace
CREATE POLICY "Users can view their workspace decisions"
  ON decisions FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace decisions"
  ON decisions FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace decisions"
  ON decisions FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

-- EVENTS: Users can only see events in their workspace
CREATE POLICY "Users can view their workspace events"
  ON events FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace events"
  ON events FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace events"
  ON events FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

-- CRM_CLIENTS: Users can only see clients in their workspace
CREATE POLICY "Users can view their workspace crm_clients"
  ON crm_clients FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace crm_clients"
  ON crm_clients FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace crm_clients"
  ON crm_clients FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

-- COLLABORATORS: Users can see collaborators in their workspace
CREATE POLICY "Users can view workspace collaborators"
  ON collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = collaborators.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- CAPTURES: Users can only see captures in their workspace
CREATE POLICY "Users can view their workspace captures"
  ON captures FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace captures"
  ON captures FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace captures"
  ON captures FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

-- WORKSPACE_MEMBERS: Users can see their own memberships
CREATE POLICY "Users can view their workspace memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

-- AUDIT_LOG: Only admins can view audit logs, but only for their workspace
CREATE POLICY "Admins can view workspace audit logs"
  ON audit_log FOR SELECT
  USING (
    workspace_id = auth.workspace_id() AND
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = audit_log.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (workspace_id IS NOT NULL);