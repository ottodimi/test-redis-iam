import assert from "assert";
import { HttpRequest } from "@smithy/protocol-http";
import { Cluster } from "ioredis";
import { SignatureV4 } from "@smithy/signature-v4";
import { formatUrl } from "@aws-sdk/util-format-url";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { loadConfig } from "@smithy/node-config-provider";
import {
  NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS,
} from "@smithy/config-resolver";
import { Hash } from "@smithy/hash-node";

const getPassword = async ({ cacheName, username }) => {
  const request = new HttpRequest({
    protocol: "https:",
    hostname: cacheName,
    method: "GET",
    headers: { host: cacheName },
    query: { Action: "connect", User: username },
  });

  const signer = new SignatureV4({
    service: "elasticache",
    sha256: Hash.bind(null, "sha256"),
    credentials: fromNodeProviderChain(),
    region: loadConfig(
      NODE_REGION_CONFIG_OPTIONS,
      NODE_REGION_CONFIG_FILE_OPTIONS
    ),
  });

  const presigned = await signer.presign(request, {
    expiresIn: 900,
  });

  return formatUrl(presigned).replace("https://", "");
};

const [url, cacheName, username] = process.argv.slice(2);

assert(url);
assert(cacheName);
assert(username);

const password = await getPassword({ cacheName, username });
console.log(password);

const cluster = new Cluster([url], {
  redisOptions: { username, password, tls: {} },
  dnsLookup: (address, callback) => callback(null, address),
});

console.log(await cluster.get("foo"));
