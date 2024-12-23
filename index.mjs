import { RedisCluster } from "./redis-cluster.mjs";

const [url, username, password] = process.argv.slice(2);

const cluster = new RedisCluster([url], {
  redisOptions: { username, password, tls: {} },
  dnsLookup: (address, callback) => callback(null, address),
});

console.log(await cluster.get("foo"));
