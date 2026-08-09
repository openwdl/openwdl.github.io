import { SETUP_CATALOG } from "../catalog/catalog";
import type { SetupCatalog } from "../catalog/types";

/**
 * A deep-isolated clone of the production setup catalog.
 *
 * Use this fixture in tests that need a fully valid catalog as a baseline or
 * that assert properties of the real production data. Because this is a deep
 * clone, mutations to this fixture do not affect {@link SETUP_CATALOG}.
 */
export const eligibleCatalog: SetupCatalog = structuredClone(SETUP_CATALOG);

/**
 * Returns a deep clone of the production catalog with the Planetary service
 * overridden to be eligible and fully populated.
 *
 * Use this fixture to test validation paths that only trigger when an
 * eligible Planetary entry is present (e.g. checking that the validator
 * accepts a complete service record). Each call returns a fresh deep clone,
 * so mutations to the returned value do not affect {@link SETUP_CATALOG}.
 */
export function catalogWithEligiblePlanetary(): SetupCatalog {
  const catalog = structuredClone(SETUP_CATALOG);
  catalog.services.planetary = {
    ...catalog.services.planetary,
    eligible: true,
    owner: "test-owner",
    docsUrl: "https://example.test/planetary/docs",
    upstreamUrl: "https://example.test/planetary",
    supportedClouds: ["test-cloud"],
    securityPrerequisites: ["Use a dedicated test identity."],
    verification: [
      {
        shell: "bash",
        command: "planetary status",
        explanation: "Confirm the test service is reachable.",
      },
    ],
  };
  return catalog;
}
