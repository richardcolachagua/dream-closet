import { createSearchOperation } from "./searchOperation";

const fixture = (execute = jest.fn().mockResolvedValue({ results: [] })) => {
  let id = 0;
  return {
    execute,
    client: createSearchOperation({ execute, createId: () => `operation-${++id}` }),
  };
};

test("intentional new submissions get different IDs even for identical text", async () => {
  const { client, execute } = fixture();
  await client.submit({ query: "black shirt" });
  await client.submit({ query: "black shirt" });
  expect(execute.mock.calls[0][0].requestId).not.toBe(execute.mock.calls[1][0].requestId);
});

test("retry preserves ID, query and refinement parameters", async () => {
  const { client, execute } = fixture();
  await client.submit({ query: " BLACK  shirt ", page: 1 });
  await client.refine({ page: 2, sort: "price_asc" });
  await client.retry();
  const requests = execute.mock.calls.map(([value]) => value);
  expect(new Set(requests.map((value) => value.requestId)).size).toBe(1);
  expect(requests[2]).toMatchObject({ query: "black shirt", page: 2, sort: "price_asc", action: "retry" });
});

test("simultaneous submission is single-flight", async () => {
  let release;
  const execute = jest.fn(() => new Promise((resolve) => { release = resolve; }));
  const { client } = fixture(execute);
  const first = client.submit({ query: "shirt" });
  const second = client.submit({ query: "shirt" });
  expect(first).toBe(second);
  await Promise.resolve();
  expect(execute).toHaveBeenCalledTimes(1);
  release({ results: [] });
  await first;
});

test("refinements cannot change text", async () => {
  const { client, execute } = fixture();
  await client.submit({ query: "shirt" });
  await expect(client.refine({ query: "boots" })).rejects.toThrow("new search");
  expect(execute).toHaveBeenCalledTimes(1);
});

test("a failed execution can retry without changing the ID", async () => {
  const execute = jest.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ results: [] });
  const { client } = fixture(execute);
  await expect(client.submit({ query: "shirt" })).rejects.toThrow("offline");
  await client.retry();
  expect(execute.mock.calls[1][0].requestId).toBe(execute.mock.calls[0][0].requestId);
});

test("refine and retry require an existing operation", async () => {
  const { client, execute } = fixture();
  await expect(client.refine({ page: 2 })).rejects.toThrow("first");
  await expect(client.retry()).rejects.toThrow("first");
  expect(execute).not.toHaveBeenCalled();
});

test("new client instances do not inherit another account's reservation", async () => {
  const first = fixture();
  await first.client.submit({ query: "shirt" });
  const second = fixture();
  expect(second.client.current()).toBeNull();
  await expect(second.client.retry()).rejects.toThrow("first");
});

test("empty or oversized text never executes", async () => {
  const { client, execute } = fixture();
  await expect(client.submit({ query: "   " })).rejects.toThrow();
  await expect(client.submit({ query: "x".repeat(251) })).rejects.toThrow();
  expect(execute).not.toHaveBeenCalled();
});


test("a denied new reservation preserves the previous search for refinements", async () => {
  const error = Object.assign(new Error("exhausted"), {
    details: { reason: "SEARCH_QUOTA_EXHAUSTED" },
  });
  const execute = jest.fn().mockResolvedValueOnce({ results: [] })
    .mockRejectedValueOnce(error).mockResolvedValueOnce({ results: [] });
  const { client } = fixture(execute);
  await client.submit({ query: "shirt" });
  const original = client.current().requestId;
  await expect(client.submit({ query: "boots" })).rejects.toBe(error);
  await client.refine({ page: 2 });
  expect(execute.mock.calls[2][0]).toMatchObject({ requestId: original, query: "shirt" });
});
