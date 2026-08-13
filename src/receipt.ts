import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value.toUpperCase() : undefined;
}

function leaderReceipts(receipt: UnknownRecord): UnknownRecord[] {
  const consensus = isRecord(receipt.consensus_data) ? receipt.consensus_data : undefined;
  if (!consensus) return [];
  const raw = consensus.leader_receipt;
  if (Array.isArray(raw)) return raw.filter(isRecord);
  return isRecord(raw) ? [raw] : [];
}

function safeError(value: unknown): string {
  try {
    return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item)).slice(0, 500);
  } catch {
    return "Unserializable transaction error";
  }
}

export function assertFinalizedSuccess(value: unknown): void {
  if (!isRecord(value)) throw new Error("Malformed transaction receipt");
  const status = text(value.statusName) ?? text(value.status_name) ?? text(value.status);
  if (status !== TransactionStatus.FINALIZED) {
    throw new Error(`Transaction is not FINALIZED (${status ?? "UNKNOWN"})`);
  }

  const consensus = isRecord(value.consensus_data) ? value.consensus_data : undefined;
  if (consensus && consensus.final !== true) {
    throw new Error("Receipt is FINALIZED but consensus_data.final is not true");
  }

  const execution = text(value.txExecutionResultName);
  if (execution === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error(`Contract execution failed: ${safeError(value)}`);
  }
  if (execution === ExecutionResult.FINISHED_WITH_RETURN) return;

  const leaders = leaderReceipts(value);
  if (leaders.some((item) => text(item.execution_result) === "SUCCESS" && !item.error)) return;
  const leaderError = leaders.find((item) => item.error)?.error;
  if (leaderError) throw new Error(`Leader execution failed: ${safeError(leaderError)}`);
  throw new Error(`Unknown finalized execution result (${execution ?? "MISSING"})`);
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return safeError(error);
}
