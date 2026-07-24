/**
 * Client Azure DevOps REST API.
 *
 * Autenticazione (scelta automatica):
 *   1. ADO_PAT nel .env  →  Basic auth (più semplice)
 *   2. Az CLI già autenticato (`az login`)  →  Bearer OAuth
 *   3. Browser interattivo  →  Bearer OAuth (richiede ADO_TENANT_ID + ADO_CLIENT_ID)
 */

const ADO_API_VERSION = "7.1";
const ADO_RESOURCE_SCOPE = "499b84ac-1321-427f-aa17-267ca6975798/.default";

// ─── Tipi ADO ──────────────────────────────────────────────────────────────

interface AdoIdentityRef {
  displayName: string;
  uniqueName?: string | undefined;
  id?: string | undefined;
}

interface AdoWorkItemFields {
  "System.Id": number;
  "System.Title": string;
  "System.WorkItemType": string;
  "System.State": string;
  "System.AssignedTo"?: AdoIdentityRef | string | null | undefined;
  "System.CreatedDate": string;
  "System.AreaPath"?: string | undefined;
  "System.IterationPath"?: string | undefined;
  "Microsoft.VSTS.Common.Priority"?: number | null | undefined;
}

interface AdoWorkItemLinks {
  html: { href: string };
}

interface AdoWorkItem {
  id: number;
  fields: AdoWorkItemFields;
  _links?: AdoWorkItemLinks | undefined;
}

interface AdoWorkItemsResponse {
  value: AdoWorkItem[];
  count: number;
}

interface AdoWiqlRef {
  id: number;
  url: string;
}

interface AdoWiqlResponse {
  workItems: AdoWiqlRef[];
  queryType: string;
}

// ─── Tipi per stati progetto ───────────────────────────────────────────────

interface AdoWitStateInfo {
  name: string;
  color?: string | undefined;
  category?: string | undefined;
}

interface AdoWitType {
  name: string;
  isDisabled?: boolean | undefined;
  states?: AdoWitStateInfo[] | undefined;
}

interface AdoWitTypesResponse {
  value: AdoWitType[];
  count: number;
}

export interface MemberInfo {
  displayName: string;
  uniqueName: string;
}

interface AdoTeam {
  id: string;
  name: string;
}

interface AdoTeamsResponse {
  value: AdoTeam[];
  count: number;
}

interface AdoTeamMemberIdentity {
  displayName: string;
  uniqueName: string;
  id: string;
}

interface AdoTeamMember {
  identity: AdoTeamMemberIdentity;
}

interface AdoTeamMembersResponse {
  value: AdoTeamMember[];
  count: number;
}

export interface ProjectStateInfo {
  name: string;
  /** Es: Proposed | InProgress | Resolved | Completed | Removed */
  category: string;
}

// ─── Tipo esportato ────────────────────────────────────────────────────────

export interface WorkItemSummary {
  id: number;
  title: string;
  workItemType: string;
  state: string;
  priority: number | null;
  assignedTo: string;
  createdDate: string;
  areaPath: string;
  iterationPath: string;
  url: string;
}

// ─── Helpers di autenticazione ─────────────────────────────────────────────

/**
 * Restituisce l'header di autorizzazione.
 * Ordine: PAT → Azure CLI.
 * NON apre mai il browser — adatto a daemon in background.
 */
export async function resolveAuthHeader(): Promise<string> {
  const pat = process.env["ADO_PAT"];
  if (pat) {
    const encoded = Buffer.from(`:${pat}`).toString("base64");
    return `Basic ${encoded}`;
  }

  // Azure CLI (az login) — non-interattivo, non apre browser
  try {
    const { AzureCliCredential } = await import("@azure/identity");
    const cred = new AzureCliCredential();
    const token = await cred.getToken(ADO_RESOURCE_SCOPE);
    return `Bearer ${token.token}`;
  } catch {
    // Az CLI non disponibile o non autenticato
  }

  throw new Error(
    "Autenticazione ADO non configurata.\n" +
    "  Opzione 1 (consigliata): imposta ADO_PAT nel .env\n" +
    "  Opzione 2: esegui 'az login' in un terminale"
  );
}

// ─── Client principale ─────────────────────────────────────────────────────

export interface WorkItemDetail {
  id: number;
  title: string;
  workItemType: string;
  state: string;
  assignedTo: string;
  assignedToEmail: string;
  teamProject: string;
  areaPath: string;
  iterationPath: string;
  priority: number | null;
  createdDate: string;
  changedDate: string;
  url: string;
}

export type IterationType = "current" | "not-current" | "all";

export class DevOpsClient {
  private readonly baseUrl: string;
  private readonly project: string;
  private readonly authHeader: string;

  constructor(orgUrl: string, project: string, authHeader: string) {
    this.baseUrl = orgUrl.replace(/\/$/, "");
    this.project = project;
    this.authHeader = authHeader;
  }

  /**
   * Recupera un singolo work item per ID con tutti i campi diagnostici.
   * Non applica filtri — utile per capire perché un item non appare nella query.
   */
  async inspectWorkItem(id: number): Promise<WorkItemDetail | null> {
    const fields = [
      "System.Id",
      "System.Title",
      "System.WorkItemType",
      "System.State",
      "System.AssignedTo",
      "System.TeamProject",
      "System.AreaPath",
      "System.IterationPath",
      "System.CreatedDate",
      "System.ChangedDate",
      "Microsoft.VSTS.Common.Priority",
    ].join(",");

    const res = await fetch(
      `${this.baseUrl}/_apis/wit/workitems/${id}?fields=${fields}&api-version=${ADO_API_VERSION}`,
      { headers: { "Authorization": this.authHeader } }
    );

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`ADO ${res.status}: ${await res.text()}`);

    const item = (await res.json()) as { id: number; fields: AdoWorkItemFields & Record<string, unknown> };
    const f = item.fields;

    const assignedRaw = f["System.AssignedTo"];
    const assignedTo =
      typeof assignedRaw === "string" ? assignedRaw
      : assignedRaw !== null && assignedRaw !== undefined && typeof assignedRaw === "object"
        ? (assignedRaw as AdoIdentityRef).displayName
        : "(non assegnato)";
    const assignedEmail =
      typeof assignedRaw === "object" && assignedRaw !== null
        ? ((assignedRaw as AdoIdentityRef).uniqueName ?? "")
        : "";

    const priority = f["Microsoft.VSTS.Common.Priority"];

    return {
      id: item.id,
      title: String(f["System.Title"] ?? ""),
      workItemType: String(f["System.WorkItemType"] ?? ""),
      state: String(f["System.State"] ?? ""),
      assignedTo,
      assignedToEmail: assignedEmail,
      teamProject: String(f["System.TeamProject"] ?? ""),
      areaPath: String(f["System.AreaPath"] ?? ""),
      iterationPath: String((f as Record<string, unknown>)["System.IterationPath"] ?? ""),
      priority: typeof priority === "number" ? priority : null,
      createdDate: String(f["System.CreatedDate"] ?? ""),
      changedDate: String(f["System.ChangedDate"] ?? ""),
      url: `${this.baseUrl}/${encodeURIComponent(this.project)}/_workitems/edit/${id}`,
    };
  }

  /**
   * Recupera tutti gli stati dei work item type del progetto via ADO REST API.
   */
  async fetchProjectStates(): Promise<ProjectStateInfo[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/${encodeURIComponent(this.project)}/_apis/wit/workitemtypes?$expand=states&api-version=${ADO_API_VERSION}`,
        { headers: { "Authorization": this.authHeader } }
      );
      if (!res.ok) return [];

      const data = (await res.json()) as AdoWitTypesResponse;
      const stateMap = new Map<string, string>(); // name → category

      for (const type of data.value) {
        if (type.isDisabled) continue;
        for (const s of type.states ?? []) {
          if (!stateMap.has(s.name)) {
            stateMap.set(s.name, s.category ?? "");
          }
        }
      }

      const ORDER = ["Proposed", "InProgress", "Resolved", "Completed", "Removed"];
      return [...stateMap.entries()]
        .map(([name, category]) => ({ name, category }))
        .sort((a, b) => {
          const ai = ORDER.indexOf(a.category);
          const bi = ORDER.indexOf(b.category);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
    } catch {
      return [];
    }
  }

  /**
   * Recupera i membri del team estraendo assegnatari unici dai work item del progetto.
   * Non richiede scope vso.project — funziona con soli work items:read.
   * Fallback: Teams API se il WIQL non restituisce dati.
   */
  async fetchTeamMembers(): Promise<MemberInfo[]> {
    // ── Approccio principale: estrai assegnatari dai work item via WIQL ──
    try {
      const wiql = `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project AND [System.AssignedTo] <> '' AND [System.State] NOT IN ('Closed', 'Removed', 'Done') ORDER BY [System.ChangedDate] DESC`;
      const wiqlRes = await fetch(
        `${this.baseUrl}/${encodeURIComponent(this.project)}/_apis/wit/wiql?$top=300&api-version=${ADO_API_VERSION}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": this.authHeader },
          body: JSON.stringify({ query: wiql }),
        }
      );

      if (wiqlRes.ok) {
        const wiqlData = (await wiqlRes.json()) as AdoWiqlResponse;
        const ids = wiqlData.workItems.map(r => r.id).slice(0, 200);

        if (ids.length > 0) {
          const res = await fetch(
            `${this.baseUrl}/_apis/wit/workitems?ids=${ids.join(",")}&fields=System.AssignedTo&api-version=${ADO_API_VERSION}`,
            { headers: { "Authorization": this.authHeader } }
          );

          if (res.ok) {
            const data = (await res.json()) as AdoWorkItemsResponse;
            const memberMap = new Map<string, MemberInfo>();

            for (const item of data.value) {
              const raw = item.fields["System.AssignedTo"];
              if (raw === null || raw === undefined) continue;

              let displayName: string;
              let uniqueName: string;

              if (typeof raw === "string") {
                displayName = raw;
                uniqueName = raw;
              } else {
                displayName = raw.displayName;
                uniqueName = raw.uniqueName ?? raw.displayName;
              }

              if (uniqueName && !memberMap.has(uniqueName)) {
                memberMap.set(uniqueName, { displayName, uniqueName });
              }
            }

            const result = [...memberMap.values()].sort((a, b) =>
              a.displayName.localeCompare(b.displayName)
            );
            if (result.length > 0) return result;
          }
        }
      }
    } catch { /* prosegui con fallback */ }

    // ── Fallback: Teams API (richiede vso.project) ──
    try {
      const teamsRes = await fetch(
        `${this.baseUrl}/${encodeURIComponent(this.project)}/_apis/teams?api-version=${ADO_API_VERSION}`,
        { headers: { "Authorization": this.authHeader } }
      );
      if (!teamsRes.ok) return [];

      const teams = (await teamsRes.json()) as AdoTeamsResponse;
      const memberMap = new Map<string, MemberInfo>();

      await Promise.all(teams.value.map(async team => {
        try {
          const res = await fetch(
            `${this.baseUrl}/${encodeURIComponent(this.project)}/_apis/teams/${team.id}/members?api-version=${ADO_API_VERSION}`,
            { headers: { "Authorization": this.authHeader } }
          );
          if (!res.ok) return;
          const data = (await res.json()) as AdoTeamMembersResponse;
          for (const m of data.value) {
            const un = m.identity.uniqueName;
            if (un && !memberMap.has(un)) {
              memberMap.set(un, { displayName: m.identity.displayName, uniqueName: un });
            }
          }
        } catch { /* ignora errori per singolo team */ }
      }));

      return [...memberMap.values()].sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    } catch {
      return [];
    }
  }

  /**
   * Recupera i work item nei stati e assegnatari indicati.
   * assignees: ["@Me"] → usa macro @Me | ["email1", ...] → usa IN clause
   */
  async getMyItems(
    states: string[] = ["New"],
    assignees: string[] = ["@Me"],
    iteration: IterationType = "current"
  ): Promise<WorkItemSummary[]> {
    const stateList = states.map(s => `'${s}'`).join(", ");

    const specificEmails = assignees.filter(a => a !== "@Me");
    const includeMe = assignees.includes("@Me");
    const meEmail = process.env["ADO_ME_EMAIL"];

    let assigneeFilter: string;
    if (specificEmails.length === 0) {
      assigneeFilter = meEmail
        ? `[System.AssignedTo] = '${meEmail}'`
        : "[System.AssignedTo] = @Me";
    } else if (includeMe) {
      const allEmails = meEmail ? [meEmail, ...specificEmails] : specificEmails;
      const quoted = [...new Set(allEmails)].map(e => `'${e}'`).join(", ");
      assigneeFilter = meEmail
        ? `[System.AssignedTo] IN (${quoted})`
        : `([System.AssignedTo] = @Me OR [System.AssignedTo] IN (${specificEmails.map(e => `'${e}'`).join(", ")}))` ;
    } else {
      const quoted = specificEmails.map(e => `'${e}'`).join(", ");
      assigneeFilter = `[System.AssignedTo] IN (${quoted})`;
    }

    const iterationClause =
      iteration === "current"     ? "AND [System.IterationPath] = @CurrentIteration " :
      iteration === "not-current" ? "AND [System.IterationPath] <> @CurrentIteration " :
      "";

    const wiql = `
      SELECT [System.Id]
      FROM WorkItems
      WHERE ${assigneeFilter}
        AND [System.State] IN (${stateList})
        ${iterationClause}
        AND [System.TeamProject] = @project
      ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC
    `;

    const projectSegment = encodeURIComponent(this.project);
    const wiqlRes = await fetch(
      `${this.baseUrl}/${projectSegment}/_apis/wit/wiql?api-version=${ADO_API_VERSION}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": this.authHeader,
        },
        body: JSON.stringify({ query: wiql }),
      }
    );

    if (!wiqlRes.ok) {
      const body = await wiqlRes.text();
      throw new Error(`ADO WIQL ${wiqlRes.status}: ${body}`);
    }

    const wiqlData = (await wiqlRes.json()) as AdoWiqlResponse;
    const ids = wiqlData.workItems.map(ref => ref.id);

    if (ids.length === 0) {
      // Diagnostica: controlla se ci sono item New nel progetto indipendentemente dall'assegnatario
      const diagCount = await this.countNewItemsInProject(states);
      if (diagCount > 0) {
        console.warn(
          `  ⚠ WIQL @Me = 0 risultati, ma il progetto ha ${diagCount} item in stato ${states.join("/")}.\n` +
          `    L'identità del PAT potrebbe non corrispondere all'assegnatario.\n` +
          `    Verifica su ADO: Settings → Personal access tokens → token owner.`
        );
      }
      return [];
    }

    return this.fetchDetails(ids);
  }

  /** Diagnostica: conta item in stato indicato nel progetto (qualsiasi assegnatario). */
  private async countNewItemsInProject(states: string[]): Promise<number> {
    try {
      const stateList = states.map(s => `'${s}'`).join(", ");
      const wiql = `SELECT [System.Id] FROM WorkItems WHERE [System.State] IN (${stateList}) AND [System.TeamProject] = @project`;
      const res = await fetch(
        `${this.baseUrl}/${encodeURIComponent(this.project)}/_apis/wit/wiql?api-version=${ADO_API_VERSION}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": this.authHeader },
          body: JSON.stringify({ query: wiql }),
        }
      );
      if (!res.ok) return 0;
      const data = (await res.json()) as AdoWiqlResponse;
      return data.workItems.length;
    } catch {
      return 0;
    }
  }

  private async fetchDetails(ids: number[]): Promise<WorkItemSummary[]> {
    const results: WorkItemSummary[] = [];
    const batchSize = 200;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const fields = [
        "System.Id",
        "System.Title",
        "System.WorkItemType",
        "System.State",
        "System.AssignedTo",
        "System.CreatedDate",
        "System.AreaPath",
      "System.IterationPath",
      ].join(",");

      const res = await fetch(
        `${this.baseUrl}/_apis/wit/workitems?ids=${batch.join(",")}&fields=${fields}&api-version=${ADO_API_VERSION}`,
        { headers: { "Authorization": this.authHeader } }
      );

      if (!res.ok) {
        throw new Error(`ADO WorkItems ${res.status}`);
      }

      const data = (await res.json()) as AdoWorkItemsResponse;

      for (const item of data.value) {
        const f = item.fields;
        const raw = f["System.AssignedTo"];
        const assignedTo =
          typeof raw === "string" ? raw
          : raw !== null && raw !== undefined && typeof raw === "object"
            ? raw.displayName
            : "";

        results.push({
          id: item.id,
          title: f["System.Title"],
          workItemType: f["System.WorkItemType"],
          state: f["System.State"],
          priority: f["Microsoft.VSTS.Common.Priority"] ?? null,
          assignedTo,
          createdDate: f["System.CreatedDate"],
          areaPath: f["System.AreaPath"] ?? "",
          iterationPath: f["System.IterationPath"] ?? "",
          url: `${this.baseUrl}/${encodeURIComponent(this.project)}/_workitems/edit/${item.id}`,
        });
      }
    }

    return results;
  }
}
