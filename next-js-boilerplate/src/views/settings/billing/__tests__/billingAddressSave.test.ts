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

    handleAddressSave(
      { name: "John Doe", zipCode: "10001" },
      mutation,
      onSaved,
    );

    expect(mutate).toHaveBeenCalledWith(
      { name: "John Doe", zipCode: "10001" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("closes the editor only after the mutation succeeds", () => {
    const { mutate, mutation } = makeMutationStub();
    const onSaved = vi.fn();

    handleAddressSave({ city: "NYC" }, mutation, onSaved);

    const options = mutate.mock.calls[0][1] as { onSuccess: () => void };
    expect(onSaved).not.toHaveBeenCalled();

    options.onSuccess();
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
