import { Registry } from "./src/registry.js";
import { ProviderFactory } from "./src/provider-factory.js";
import { loadConfig } from "./src/config.js";

const config = loadConfig();
const registry = new Registry(process.cwd());
await registry.load();
const agent = registry.getAgent("html-angular-architect-agent");
console.log("agent ok", agent.id);
const pf = new ProviderFactory(config);
const provider = pf.createForAgent(agent);
console.log("provider ok", provider.constructor.name);
const skills = await registry.loadSkills(agent.skills);
console.log("skills ok", skills.map(s=>s.id));
