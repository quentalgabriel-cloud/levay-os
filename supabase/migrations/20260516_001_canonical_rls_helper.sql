-- ADR-001: Função canônica de RLS para isolamento de workspace
--
-- Problema: auth.workspace_id() usa LIMIT 1 sem ORDER BY (não-determinístico)
--           e vive no schema auth (requer schema explícito em todo uso).
--           Algumas migrations usam bare workspace_id() sem schema algum.
--
-- Solução: public.current_workspace_id() com ORDER BY created_at ASC LIMIT 1
--          determinístico, schema explícito, callable sem prefixo dentro de public.
--
-- Compatibilidade: auth.workspace_id() NÃO é dropado — policies existentes
--                  continuam funcionando. Novas policies usam public.current_workspace_id().

CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS UUID AS $$
  SELECT workspace_id::uuid
  FROM public.workspace_members
  WHERE user_id = auth.uid()
  ORDER BY created_at ASC
  LIMIT 1
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Permissão de execução para usuários autenticados (necessário para SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.current_workspace_id() TO authenticated;
