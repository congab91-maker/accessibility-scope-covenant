import { describe, expect, it } from "vitest";

import { assertFinalizedSuccess, errorMessage } from "./receipt";

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
        txExecutionResultName: "FINISHED_WITH_RETURN",
        consensus_data: { final: true },
      }),
    ).not.toThrow();
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

  it("rejects finalized execution errors and preserves bigint-safe feedback", () => {
    expect(() =>
      assertFinalizedSuccess({
        statusName: "FINALIZED",
        txExecutionResultName: "FINISHED_WITH_ERROR",
        consensus_data: { final: true },
        data: { amount: 9007199254740993n },
      }),
    ).toThrow(/9007199254740993/);
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
