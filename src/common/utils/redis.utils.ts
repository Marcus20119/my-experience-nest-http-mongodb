export const parseRedisOptionsFromUrl = (url: URL) => ({
  db: Number.isInteger(Number(url.pathname?.slice(1))) ? Number(url.pathname.slice(1)) : 0,
  host: url.hostname,
  password: url.password,
  port: Number(url.port ?? 6379),
  username: url.username,
})
