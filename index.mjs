import assert from "assert";
import { Cluster } from "ioredis";
import { getPassword } from "./get-password.mjs";

const [url, clusterName, username] = process.argv.slice(2);

assert(url);
assert(clusterName);
assert(username);

const password = await getPassword({
  clusterName,
  username,
  serverless: false,
});

const cluster = new Cluster([url], {
  redisOptions: { username: username, password, tls: {} },
  dnsLookup: (address, callback) => callback(null, address),
});

console.log(await cluster.get("foo"));
