-- RLS Policies for reservations and memberships tables
-- Generated: 2026-05-14
-- Purpose: Ensure workspace isolation for reservations and memberships

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- RESERVATIONS: Users can only see/manage reservations in their workspace
CREATE POLICY "Users can view their workspace reservations"
  ON reservations FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace reservations"
  ON reservations FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace reservations"
  ON reservations FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can delete their workspace reservations"
  ON reservations FOR DELETE
  USING (workspace_id = auth.workspace_id());

-- MEMBERSHIPS: Users can only see/manage memberships in their workspace
CREATE POLICY "Users can view their workspace memberships"
  ON memberships FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "Users can insert their workspace memberships"
  ON memberships FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can update their workspace memberships"
  ON memberships FOR UPDATE
  USING (workspace_id = auth.workspace_id())
  WITH CHECK (workspace_id = auth.workspace_id());

CREATE POLICY "Users can delete their workspace memberships"
  ON memberships FOR DELETE
  USING (workspace_id = auth.workspace_id());