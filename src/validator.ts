import type {
  AgentDefinition,
  AgentRunResult,
  AgentTask,
  ValidationResult
} from "./models.js";
import { normalizeErrors } from "./models.js";
import { PathPolicy } from "./path-policy.js";

export class ResultValidator {
  constructor(private readonly pathPolicy: PathPolicy) {}

  validate(
    agent: AgentDefinition,
    task: AgentTask,
    result: AgentRunResult
  ): ValidationResult {
    const normalizedResultErrors = normalizeErrors(result.errors);
    const policyErrors = this.pathPolicy.validateResult(agent, task, result);
    const errors = [...normalizedResultErrors, ...policyErrors];
    const warnings: string[] = [];

    if (!result.summary.trim()) {
      errors.push("Il risultato non contiene un riepilogo.");
    }

    // Se il task ha continueOnError=true e c'è un summary valido,
    // le segnalazioni nei errors del provider sono avvertimenti, non fallimenti bloccanti.
    if (task.continueOnError === true && result.summary.trim() && errors.length > 0) {
      warnings.push(...errors);
      errors.length = 0;
    }

    if (
      task.validationCriteria.length > 0 &&
      result.artifacts["validationCriteriaChecked"] === false
    ) {
      warnings.push("Il provider dichiara di non aver verificato tutti i criteri.");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}
