import { describe, it, expect, vi } from "vitest";
import { handleAddressSave } from "../FreePageView";
import { useUpsertBillingAddress } from "@/api/client/billing/address";

function makeMutationStub() {
  const mutate = vi.fn();
  const mutation = {
    mutate,
  } as unknown as ReturnType<typeof useUpsertBillingAddress>;
  return { mutate, mutation };
}

describe("handleAddressSave", () => {
  it("fires the upsert mutation with the entered form data", () => {
    const { mutate, mutation } = makeMutationStub();
    const onSaved = vi.fn();
    const toast = vi.fn();

    handleAddressSave(
      { name: "John Doe", zipCode: "10001" },
      mutation,
      onSaved,
      toast,
      "Failed to save billing address",
    );

    expect(mutate).toHaveBeenCalledWith(
      { name: "John Doe", zipCode: "10001" },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("closes the editor only after the mutation succeeds", () => {
    const { mutate, mutation } = makeMutationStub();
    const onSaved = vi.fn();
    const toast = vi.fn();

    handleAddressSave(
      { city: "NYC" },
      mutation,
      onSaved,
      toast,
      "Failed to save billing address",
    );

    const options = mutate.mock.calls[0][1] as {
      onSuccess: () => void;
      onError: () => void;
    };
    expect(onSaved).not.toHaveBeenCalled();

    options.onSuccess();
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(toast).not.toHaveBeenCalled();
  });

  it("shows a failure toast and does not close the editor when the mutation errors", () => {
    const { mutate, mutation } = makeMutationStub();
    const onSaved = vi.fn();
    const toast = vi.fn();

    handleAddressSave(
      { city: "NYC" },
      mutation,
      onSaved,
      toast,
      "Failed to save billing address",
    );

    const options = mutate.mock.calls[0][1] as {
      onSuccess: () => void;
      onError: () => void;
    };
    options.onError();

    expect(toast).toHaveBeenCalledWith({
      title: "Failed to save billing address",
      variant: "destructive",
    });
    expect(onSaved).not.toHaveBeenCalled();
  });
});
