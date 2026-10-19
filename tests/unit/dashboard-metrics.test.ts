import { describe, expect, it } from "vitest";
import { calculateDashboardMetrics } from "../../src/domain/dashboard-metrics.js";
import type { WorkspaceData } from "../../src/data/workspace-data.js";
import type { Lead } from "../../src/domain/types.js";

function createData(now: Date): WorkspaceData {
  const currentMonthLead: Lead = {
    id: "lead-current",
    workspaceId: "workspace",
    name: "Current lead",
    stage: "qualified",
    estimatedValue: 1250,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
    updatedAt: now.toISOString(),
  };
  const priorMonthLead: Lead = {
    id: "lead-prior",
    workspaceId: "workspace",
    name: "Prior lead",
    stage: "new",
    estimatedValue: 750,
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString(),
    updatedAt: now.toISOString(),
  };

  return {
    ownerName: "Alex Morgan",
    contactsUsed: 2,
    contactsLimit: 1000,
    leads: [currentMonthLead, priorMonthLead],
    clients: [],
    followUps: [],
    activities: [],
    projects: [],
  };
}

describe("calculateDashboardMetrics", () => {
  it("computes monthly lead counts and open pipeline value", () => {
    const now = new Date(2026, 5, 15, 12);
    const metrics = calculateDashboardMetrics(createData(now), now);

    expect(metrics.newLeadsThisMonth).toBe(1);
    expect(metrics.newLeadsLastMonth).toBe(1);
    expect(metrics.pipelineValue).toBe(2000);
  });

  it("excludes won and lost leads from pipeline value", () => {
    const now = new Date(2026, 5, 15, 12);
    const data = createData(now);
    data.leads.push(
      {
        id: "lead-won",
        workspaceId: "workspace",
        name: "Won lead",
        stage: "won",
        wonAt: now.toISOString(),
        convertedClientId: "client",
        estimatedValue: 5000,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "lead-lost",
        workspaceId: "workspace",
        name: "Lost lead",
        stage: "lost",
        lostAt: now.toISOString(),
        lostReason: "Not a fit",
        estimatedValue: 4000,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    );

    expect(calculateDashboardMetrics(data, now).pipelineValue).toBe(2000);
  });
});
