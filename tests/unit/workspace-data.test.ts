import { afterEach, describe, expect, it, vi } from "vitest";
import {
  convertLeadToClient,
  createProject,
  demoWorkspaceService,
  type DemoProject,
} from "../../src/data/workspace-data.js";
import type { Lead } from "../../src/domain/types.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lead conversion and project creation", () => {
  it("converts an active lead into a won lead and a linked client", () => {
    const lead: Lead = {
      id: "lead-1",
      workspaceId: "workspace-1",
      name: "Sofia Martin",
      email: "sofia@example.com",
      phone: "555-0100",
      stage: "qualified",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const result = convertLeadToClient(lead);

    expect(result.lead).toMatchObject({
      id: lead.id,
      stage: "won",
      convertedClientId: result.client.id,
    });
    expect(result.client).toMatchObject({
      workspaceId: lead.workspaceId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      sourceLeadId: lead.id,
    });
  });

  it("reuses an existing client for the same lead email", () => {
    const lead: Lead = {
      id: "lead-1",
      workspaceId: "workspace-1",
      name: "ABC Restaurant",
      email: "hello@example.com",
      stage: "proposal",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const existingClient = {
      id: "client-1",
      workspaceId: "workspace-1",
      name: "ABC Restaurant",
      email: "HELLO@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const result = convertLeadToClient(lead, existingClient);

    expect(result.client.id).toBe(existingClient.id);
    expect(result.lead.convertedClientId).toBe(existingClient.id);
    expect(result.client.sourceLeadId).toBe(lead.id);
  });

  it("creates projects in planning with dates linked to the client", () => {
    const project = createProject({
      clientId: "client-1",
      name: "Kitchen refresh",
      startDate: "2026-11-01",
      deadline: "2026-12-01",
    });

    expect(project.project).toMatchObject({
      clientId: "client-1",
      name: "Kitchen refresh",
      status: "planning",
      startDate: "2026-11-01",
      deadline: "2026-12-01",
    });
    expect(project.progress).toBe(0);
    expect(project.nextMilestoneStatus).toBe("not_started");
  });

  it("migrates existing demo workspaces by deriving clients from projects", () => {
    const stored = new Map<string, string>();
    const legacyProject: DemoProject = {
      project: {
        id: "project-1",
        workspaceId: "workspace-1",
        clientId: "client-1",
        name: "Garden redesign",
        status: "in_progress",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
      progress: 50,
      nextMilestone: "Planting",
      nextMilestoneStatus: "in_progress",
    };
    stored.set(
      "telos.demo-workspace.v1.existing-account",
      JSON.stringify({
        ownerName: "Alex Morgan",
        contactsUsed: 10,
        contactsLimit: 1000,
        leads: [],
        followUps: [],
        activities: [],
        projects: [legacyProject],
      }),
    );
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => stored.set(key, value),
      },
    });

    const data = demoWorkspaceService.load("existing-account");

    expect(data.clients).toEqual([
      {
        id: "client-1",
        workspaceId: "workspace-1",
        name: "Garden redesign",
        ownerId: undefined,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ]);
    expect(
      JSON.parse(stored.get("telos.demo-workspace.v1.existing-account") ?? "{}"),
    ).toHaveProperty("clients");
  });
});
