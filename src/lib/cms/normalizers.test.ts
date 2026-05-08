import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  normalizeCmsEntry,
  normalizeStrapiCollection,
  stripPrivateCmsFields,
  unwrapStrapiEntity,
  unwrapStrapiList
} from "@lib/cms/normalizers";

describe("CMS normalizers", () => {
  it("unwraps Strapi attribute-shaped entities", () => {
    const entity = unwrapStrapiEntity({
      id: 12,
      documentId: "abc",
      attributes: {
        title: "Интернет в офис",
        slug: "internet"
      }
    });

    expect(entity).toMatchObject({
      id: 12,
      documentId: "abc",
      title: "Интернет в офис",
      slug: "internet"
    });
  });

  it("unwraps Strapi list responses", () => {
    const list = unwrapStrapiList({
      data: [
        {
          id: 1,
          attributes: {
            slug: "a"
          }
        },
        {
          id: 2,
          slug: "b"
        }
      ]
    });

    expect(list.map((item) => item.slug)).toEqual(["a", "b"]);
  });

  it("strips private CMS fields recursively before validation", () => {
    const stripped = stripPrivateCmsFields({
      title: "B2B заявка",
      internalNotes: "do not expose",
      nested: {
        reviewNotes: "private",
        label: "public"
      }
    });

    expect(stripped).toEqual({
      title: "B2B заявка",
      nested: {
        label: "public"
      }
    });
  });

  it("normalizes entries through a schema", () => {
    const schema = z.object({
      title: z.string(),
      slug: z.string()
    });

    expect(
      normalizeCmsEntry(
        {
          title: "Телефония",
          slug: "telephony",
          reviewedBy: "commercial"
        },
        schema
      )
    ).toEqual({
      title: "Телефония",
      slug: "telephony"
    });
  });

  it("normalizes Strapi collections", () => {
    const schema = z.object({
      slug: z.string()
    });

    expect(
      normalizeStrapiCollection(
        {
          data: [
            {
              attributes: {
                slug: "vps"
              }
            }
          ]
        },
        schema
      )
    ).toEqual([{ slug: "vps" }]);
  });
});
