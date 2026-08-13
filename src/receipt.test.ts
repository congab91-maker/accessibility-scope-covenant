import { describe, expect, it } from "vitest";

import { FinalizedExecutionError, assertFinalizedSuccess, errorMessage } from "./receipt";

describe("assertFinalizedSuccess", () => {
  it("accepts explicit finalized return", () => {
    expect(() =>
      assertFinalizedSuccess({
        statusName: "FINALIZED",
        txExecutionResultName: "FINISHED_WITH_RETURN",
        consensus_data: { final: true },
      }),
    ).not.toThrow();
  });

  it("accepts the SDK simplified status_name receipt", () => {
    expect(() =>
      assertFinalizedSuccess({
        status_name: "FINALIZED",
        consensus_data: { leader_receipt: [{ execution_result: "SUCCESS" }] },
      }),
    ).not.toThrow();
  });

  it("still rejects an explicit non-final consensus envelope", () => {
    expect(() =>
      assertFinalizedSuccess({
        status_name: "FINALIZED",
        consensus_data: { final: false, leader_receipt: [{ execution_result: "SUCCESS" }] },
      }),
    ).toThrow(/final is not true/);
  });

  it("accepts the documented successful leader envelope", () => {
    expect(() =>
      assertFinalizedSuccess({
        status: "FINALIZED",
        consensus_data: { final: true, leader_receipt: { execution_result: "SUCCESS", error: null } },
      }),
    ).not.toThrow();
  });

  it.each(["ACCEPTED", "UNDETERMINED", "CANCELED"])("rejects %s as authority", (status) => {
    expect(() => assertFinalizedSuccess({ statusName: status })).toThrow(/not FINALIZED/);
  });

  it("rejects finalized execution errors without serializing the hostile receipt", () => {
    expect(() =>
      assertFinalizedSuccess({
        statusName: "FINALIZED",
        txExecutionResultName: "FINISHED_WITH_ERROR",
        consensus_data: { final: true },
        data: { amount: 9007199254740993n },
      }),
    ).toThrow(FinalizedExecutionError);
  });

  it("decodes the SDK simplified rollback payload without serializing the receipt", () => {
    expect(() =>
      assertFinalizedSuccess({
        status_name: "FINALIZED",
        consensus_data: {
          leader_receipt: [{
            execution_result: "ERROR",
            result: { status: "rollback", payload: "Freeze requires complete evidence" },
            node_config: { private_key: "must-never-appear" },
          }],
        },
      }),
    ).toThrow("Contract execution failed: Freeze requires complete evidence");
  });

  it("rejects unknown finalized shapes", () => {
    expect(() => assertFinalizedSuccess({ statusName: "FINALIZED", consensus_data: { final: true } })).toThrow(
      /Unknown finalized execution result/,
    );
  });
});

describe("errorMessage", () => {
  it("does not throw on bigint values", () => {
    expect(errorMessage({ code: 1n })).toContain("1");
  });
});
