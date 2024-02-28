# Novum

An activity pub server

### Building

```
npm i
sqlite3 novum.db < seed.sql
npx tsc
node build/index.js localhost 3000
```

Running the above in conjuction with `--watch` flags in seperate terminals leads to a pretty pleasant development experience.

You can also supply a publicly accessible URL if the application is running behind a reverse proxy.

e.g. `node build/index.js localhost 3000 https://novum.streats.dev`
