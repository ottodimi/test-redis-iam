import { formatUrl } from "@aws-sdk/util-format-url";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { Hash } from "@smithy/hash-node";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";
import { loadConfig } from "@smithy/node-config-provider";
import {
  NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS,
} from "@smithy/config-resolver";

export const getPassword = async ({ clusterName, username, serverless }) => {
  const request = new HttpRequest({
    protocol: "https:",
    hostname: clusterName,
    method: "GET",
    headers: { host: clusterName },
    query: {
      Action: "connect",
      User: username,
      ...(serverless && { ResourceType: "ServerlessCache" }),
    },
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

  return formatUrl(presigned).slice("https://".length);
};
