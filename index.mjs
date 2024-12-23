import assert from "assert";
import { Cluster } from "ioredis";

const [url, username, password] = process.argv.slice(2);

assert(url);
assert(username);
assert(password);

const cluster = new Cluster([url], {
  redisOptions: { username, password, tls: {} },
  dnsLookup: (address, callback) => callback(null, address),
});

console.log(await cluster.get("foo"));
