import { checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import type { ExecutionPlan } from "./models.js";

/**
 * Mostra un prompt interattivo multi-select che elenca tutti i task pending
 * del workflow. L'utente può deselezionare quelli da saltare.
 *
 * Se stdin non è un TTY (es. CI/CD, pipe) il prompt viene saltato
 * e tutti i task rimangono pending.
 *
 * Opzione --all: salta il prompt ed esegue tutto.
 */
export async function selectTasksInteractive(
  plan: ExecutionPlan,
  skipPrompt: boolean
): Promise<void> {
  const pending = plan.tasks.filter(t => t.status === "pending");
  if (pending.length === 0) return;

  // Non interattivo: non mostrare il prompt
  if (skipPrompt || !process.stdin.isTTY) return;

  const agentMaxLen = Math.max(...pending.map(t => t.agentId.length));

  const choices = pending.map(task => {
    const agent = task.agentId.padEnd(agentMaxLen);
    const deps =
      task.dependencies.length > 0
        ? chalk.gray(` ← ${task.dependencies.join(", ")}`)
        : "";
    return {
      name: `${chalk.bold(task.id.padEnd(24))} ${chalk.dim(agent)}  ${task.title}${deps}`,
      value: task.id,
      checked: true,
    };
  });

  console.log(
    chalk.cyan("\n  Usa") +
    chalk.bold(" Spazio") + chalk.cyan(" per abilitare/disabilitare,") +
    chalk.bold(" A") + chalk.cyan(" per tutto,") +
    chalk.bold(" Enter") + chalk.cyan(" per confermare.\n")
  );

  let selected: string[];
  try {
    selected = await checkbox({
      message: "Task da eseguire:",
      choices,
      pageSize: 20,
    });
  } catch {
    // Ctrl+C o prompt annullato: esegui tutto
    console.log(chalk.yellow("\n  Selezione annullata — verranno eseguiti tutti i task.\n"));
    return;
  }

  const selectedSet = new Set(selected);
  const skipped: string[] = [];

  for (const task of plan.tasks) {
    if (task.status === "pending" && !selectedSet.has(task.id)) {
      task.status = "skipped";
      skipped.push(task.id);
    }
  }

  if (skipped.length > 0) {
    console.log(chalk.yellow(`\n  Saltati: ${skipped.join(", ")}`));
  }
  console.log();
}
