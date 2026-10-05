interface Env {
  // kentaro/kentaro.github.io の Actions: Read and write を持つ fine-grained PAT
  GITHUB_TOKEN: string;
}

const DISPATCH_URL =
  "https://api.github.com/repos/kentaro/kentaro.github.io/actions/workflows/deploy.yml/dispatches";

async function dispatch(env: Env): Promise<void> {
  const res = await fetch(DISPATCH_URL, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "kentarokuribayashi-com-deploy-cron",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  if (!res.ok) {
    throw new Error(`workflow_dispatch failed: ${res.status} ${await res.text()}`);
  }
  console.log(`workflow_dispatch ok: ${res.status}`);
}

export default {
  // 失敗時は throw して Cron Trigger の実行履歴に失敗として残す
  async scheduled(_controller: ScheduledController, env: Env) {
    await dispatch(env);
  },
} satisfies ExportedHandler<Env>;
