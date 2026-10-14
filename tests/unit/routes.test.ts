import { describe, expect, it } from "vitest";
import { getRoute } from "../../src/routes.js";

describe("getRoute", () => {
  it.each([
    ["/", "dashboard"],
    ["/leads", "workspace"],
    ["/leads/sofia", "detail"],
    ["/clients", "workspace"],
    ["/projects", "workspace"],
    ["/projects/abc", "detail"],
    ["/automations", "workspace"],
    ["/messages", "workspace"],
    ["/reports", "workspace"],
    ["/settings", "workspace"],
    ["/portal/abc", "portal"],
    ["/reference", "reference"],
    ["/unknown", "not-found"],
  ] as const)("maps %s to %s", (path, kind) => {
    expect(getRoute(path).kind).toBe(kind);
  });

  it("keeps the identifier on detail and portal routes", () => {
    expect(getRoute("/leads/sofia")).toMatchObject({
      entity: "lead",
      id: "sofia",
    });
    expect(getRoute("/projects/abc")).toMatchObject({
      entity: "project",
      id: "abc",
    });
    expect(getRoute("/portal/abc")).toMatchObject({ projectId: "abc" });
  });
});
