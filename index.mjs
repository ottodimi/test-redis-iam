import assert from "assert";
import { Cluster, Redis } from "ioredis";
import { getPassword } from "./get-password.mjs";

const [url, clusterName, username] = process.argv.slice(2);

assert(url);
assert(clusterName);
assert(username);

const auth = Redis.prototype.auth;

Redis.prototype.auth = async function () {
  const password = await getPassword({
    clusterName,
    username,
    serverless: false,
  });

  return await auth.call(this, username, password);
};

const cluster = new Cluster([url], {
  redisOptions: { username, password: "stub", tls: {} },
  dnsLookup: (address, callback) => callback(null, address),
});

console.log(await cluster.get("foo"));
