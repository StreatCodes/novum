# Novum

An activity pub server

### Building

This project required a version of node that includes typescript support. Support started around node v23.6.1.

```
npm i
sqlite3 novum.db < seed.sql
node src/index.ts localhost 3000
```

Run `npm run dev` for development, it will rebuild on save.

You can also supply a publicly accessible URL if the application is running behind a reverse proxy.

e.g. `node src/index.ts localhost 3000 https://novum.streats.dev`
