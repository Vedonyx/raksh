-- The server uses a secret API key mapped to service_role. The function can
-- run with the caller's privileges, so it does not need SECURITY DEFINER.
grant select, insert, update on public.admin_login_limits to service_role;
alter function public.allow_admin_login(text) security invoker;
